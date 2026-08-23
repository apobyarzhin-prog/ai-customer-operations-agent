import json
from types import SimpleNamespace

from app.core.config import Settings
from app.services.triage import DemoTicketTriageProvider, OpenAICompatibleTicketTriageProvider


def make_ticket() -> SimpleNamespace:
    return SimpleNamespace(subject="Refund request", description="Please refund this order.", status="open")


class FakeResponse:
    def __init__(self, payload: dict):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


def test_openai_compatible_provider_parses_chat_completion_without_network():
    captured = {}

    def opener(request, timeout):
        captured["url"] = request.full_url
        captured["headers"] = dict(request.headers)
        captured["timeout"] = timeout
        captured["payload"] = json.loads(request.data)
        return FakeResponse(
            {
                "choices": [
                    {
                        "message": {
                            "content": json.dumps(
                                {
                                    "priority": "high",
                                    "recommended_status": "in_progress",
                                    "summary": "Refund request needs review.",
                                    "suggested_reply": "We will review your refund request.",
                                    "confidence": 0.91,
                                    "reasoning": ["Refund policy review is required."],
                                }
                            )
                        }
                    }
                ]
            }
        )

    provider = OpenAICompatibleTicketTriageProvider(
        Settings(
            openai_api_key="test-key",
            openai_base_url="http://llm.test/v1",
            openai_model="test-model",
            openai_timeout_seconds=3,
        ),
        opener=opener,
    )
    result = provider.triage(make_ticket())

    assert result.priority == "high"
    assert captured["url"] == "http://llm.test/v1/chat/completions"
    assert captured["headers"]["Authorization"] == "Bearer test-key"
    assert captured["timeout"] == 3
    assert captured["payload"]["model"] == "test-model"


def test_openai_provider_falls_back_to_demo_when_not_configured():
    provider = OpenAICompatibleTicketTriageProvider(Settings(openai_api_key=""))
    result = provider.triage(make_ticket())

    assert result.priority == "high"
    assert result.reasoning[0] == "No LLM API key is configured."
    assert isinstance(provider.fallback, DemoTicketTriageProvider)
