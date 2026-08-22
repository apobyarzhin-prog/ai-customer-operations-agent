from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

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


def get_ticket_triage_provider() -> TicketTriageProvider:
    """Return the local provider used until an external provider is configured."""

    return DemoTicketTriageProvider()

