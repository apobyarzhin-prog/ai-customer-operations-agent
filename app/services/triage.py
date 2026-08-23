from __future__ import annotations

import json
from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.core.config import Settings, get_settings
from app.models.ticket import Ticket
from app.schemas.triage import TicketTriageRead, TriagePriority, TriageStatus


@dataclass(frozen=True)
class TriageResult:
    priority: TriagePriority
    recommended_status: TriageStatus
    summary: str
    suggested_reply: str
    confidence: float
    reasoning: list[str]

    def to_schema(self) -> TicketTriageRead:
        return TicketTriageRead(
            priority=self.priority,
            recommended_status=self.recommended_status,
            summary=self.summary,
            suggested_reply=self.suggested_reply,
            confidence=self.confidence,
            reasoning=self.reasoning,
        )


class TicketTriageProvider(ABC):
    """Interface for ticket triage providers.

    The HTTP layer depends on this contract, so a future hosted model provider
    can replace the demo implementation without changing the API.
    """

    @abstractmethod
    def triage(self, ticket: Ticket) -> TriageResult:
        raise NotImplementedError


class DemoTicketTriageProvider(TicketTriageProvider):
    """Deterministic, local triage for demos and development."""

    _urgent_terms = ("outage", "security", "hacked", "data breach", "chargeback")
    _high_terms = (
        "refund",
        "damaged",
        "broken",
        "failed",
        "cannot login",
        "can't login",
        "cannot log in",
        "can't log in",
    )
    _low_terms = ("question", "how do i", "information", "feature request")

    def triage(self, ticket: Ticket) -> TriageResult:
        text = f"{ticket.subject} {ticket.description}".casefold()
        matched_terms: list[str] = []

        if any(term in text for term in self._urgent_terms):
            priority: TriagePriority = "urgent"
            confidence = 0.96
            matched_terms = [term for term in self._urgent_terms if term in text]
            reasoning = ["Urgent-risk language was found in the ticket.", f"Matched: {', '.join(matched_terms)}."]
        elif any(term in text for term in self._high_terms):
            priority = "high"
            confidence = 0.9
            matched_terms = [term for term in self._high_terms if term in text]
            reasoning = ["The ticket describes a likely customer-impacting issue.", f"Matched: {', '.join(matched_terms)}."]
        elif any(term in text for term in self._low_terms):
            priority = "low"
            confidence = 0.84
            matched_terms = [term for term in self._low_terms if term in text]
            reasoning = ["The ticket appears informational or non-blocking.", f"Matched: {', '.join(matched_terms)}."]
        else:
            priority = "normal"
            confidence = 0.7
            reasoning = ["No high-risk or informational keywords were found."]

        recommended_status: TriageStatus
        if ticket.status == "resolved":
            recommended_status = "resolved"
            reasoning.append("The ticket is already resolved, so its current status is preserved.")
        elif priority in ("urgent", "high"):
            recommended_status = "in_progress"
            reasoning.append("An actionable issue should be routed to active operations work.")
        else:
            recommended_status = ticket.status if ticket.status == "in_progress" else "open"
            reasoning.append("The current workflow status is retained for this recommendation.")

        summary = f"{ticket.subject}: {ticket.description.strip()}"
        if len(summary) > 240:
            summary = f"{summary[:237].rstrip()}..."
        suggested_reply = (
            "Thanks for contacting us. We have reviewed your request and routed it to our support team. "
            "We will follow up with the next update."
        )

        return TriageResult(
            priority=priority,
            recommended_status=recommended_status,
            summary=summary,
            suggested_reply=suggested_reply,
            confidence=confidence,
            reasoning=reasoning,
        )


class OpenAICompatibleTicketTriageProvider(TicketTriageProvider):
    """Ticket triage through an OpenAI-compatible ``/chat/completions`` API."""

    def __init__(
        self,
        settings: Settings | None = None,
        *,
        opener: Callable[..., object] = urlopen,
        fallback: TicketTriageProvider | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.opener = opener
        self.fallback = fallback or DemoTicketTriageProvider()

    def triage(self, ticket: Ticket) -> TriageResult:
        if not self.settings.openai_api_key:
            return self._fallback(ticket, "No LLM API key is configured.")

        payload = {
            "model": self.settings.openai_model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You triage customer-support tickets. Return only JSON with exactly these keys: "
                        "priority (low|normal|high|urgent), recommended_status "
                        "(open|in_progress|resolved), summary, suggested_reply, confidence (0..1), "
                        "reasoning (array of short strings). Do not invent customer data."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {
                            "subject": ticket.subject,
                            "description": ticket.description,
                            "current_status": ticket.status,
                        },
                        ensure_ascii=False,
                    ),
                },
            ],
        }
        request = Request(
            f"{self.settings.openai_base_url.rstrip('/')}/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.settings.openai_api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with self.opener(request, timeout=self.settings.openai_timeout_seconds) as response:
                body = json.loads(response.read().decode("utf-8"))
            content = body["choices"][0]["message"]["content"]
            result = json.loads(content) if isinstance(content, str) else content
            return TriageResult(
                priority=result["priority"],
                recommended_status=result["recommended_status"],
                summary=result["summary"],
                suggested_reply=result["suggested_reply"],
                confidence=float(result["confidence"]),
                reasoning=[str(item) for item in result["reasoning"]],
            )
        except (HTTPError, URLError, TimeoutError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
            if not self.settings.triage_llm_fallback_to_demo:
                raise RuntimeError("Configured LLM triage provider failed") from exc
            return self._fallback(ticket, f"LLM provider unavailable; demo triage used ({type(exc).__name__}).")

    def _fallback(self, ticket: Ticket, reason: str) -> TriageResult:
        result = self.fallback.triage(ticket)
        return TriageResult(
            priority=result.priority,
            recommended_status=result.recommended_status,
            summary=result.summary,
            suggested_reply=result.suggested_reply,
            confidence=result.confidence,
            reasoning=[reason, *result.reasoning],
        )


def get_ticket_triage_provider() -> TicketTriageProvider:
    """Select the configured provider; demo remains the safe local default."""

    settings = get_settings()
    if settings.triage_provider == "openai":
        return OpenAICompatibleTicketTriageProvider(settings)
    return DemoTicketTriageProvider()
