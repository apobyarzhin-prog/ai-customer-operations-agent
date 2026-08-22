from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_customer_order_and_ticket_workflow() -> None:
    email = f"customer-{uuid4()}@example.com"
    customer_response = client.post(
        "/customers",
        json={"email": email, "full_name": "Alex Morgan"},
    )
    assert customer_response.status_code == 201
    customer = customer_response.json()

    order_response = client.post(
        "/orders",
        json={
            "customer_id": customer["id"],
            "status": "delivered",
            "total_amount": "149.99",
            "shipping_address": "10 Example Street",
        },
    )
    assert order_response.status_code == 201
    assert order_response.json()["status"] == "delivered"

    ticket_response = client.post(
        "/tickets",
        json={
            "customer_id": customer["id"],
            "subject": "Damaged headphones",
            "description": "The package arrived damaged.",
        },
    )
    assert ticket_response.status_code == 201
    assert ticket_response.json()["status"] == "open"
