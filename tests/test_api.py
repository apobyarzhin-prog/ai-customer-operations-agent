from uuid import uuid4

from fastapi.testclient import TestClient

from app.db.session import SessionLocal
from app.main import app
from app.models import Workspace

client = TestClient(app)


def create_workspace(suffix: str) -> int:
    db = SessionLocal()
    try:
        workspace = Workspace(name=f"Workspace {suffix}", slug=f"workspace-{suffix}")
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        return workspace.id
    finally:
        db.close()


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

    assert client.get(f"/customers/{customer['id']}").status_code == 200
    assert client.get(f"/orders/{order_response.json()['id']}").status_code == 200
    assert client.get(f"/tickets/{ticket_response.json()['id']}").status_code == 200
    assert len(client.get(f"/orders?customer_id={customer['id']}&status=delivered").json()) == 1
    assert len(client.get(f"/tickets?customer_id={customer['id']}&status=open").json()) == 1
    assert len(client.get("/customers?search=Alex").json()) >= 1


def test_missing_resources_return_not_found() -> None:
    assert client.get("/customers/999999999").status_code == 404
    assert client.get("/orders/999999999").status_code == 404
    assert client.get("/tickets/999999999").status_code == 404


def test_status_updates_and_status_validation() -> None:
    customer_response = client.post(
        "/customers",
        json={"email": f"status-{uuid4()}@example.com", "full_name": "Status Tester"},
    )
    customer_id = customer_response.json()["id"]
    order_response = client.post(
        "/orders",
        json={
            "customer_id": customer_id,
            "total_amount": "25.00",
            "shipping_address": "1 Test Street",
        },
    )
    ticket_response = client.post(
        "/tickets",
        json={
            "customer_id": customer_id,
            "subject": "Status update",
            "description": "Please update this case.",
        },
    )

    order_id = order_response.json()["id"]
    ticket_id = ticket_response.json()["id"]
    updated_order = client.patch(f"/orders/{order_id}/status", json={"status": "shipped"})
    updated_ticket = client.patch(
        f"/tickets/{ticket_id}/status", json={"status": "in_progress"}
    )

    assert updated_order.status_code == 200
    assert updated_order.json()["status"] == "shipped"
    assert updated_ticket.status_code == 200
    assert updated_ticket.json()["status"] == "in_progress"
    assert client.patch(f"/orders/{order_id}/status", json={"status": "unknown"}).status_code == 422
    assert client.patch(f"/tickets/{ticket_id}/status", json={"status": "unknown"}).status_code == 422


def test_status_updates_return_not_found() -> None:
    assert client.patch("/orders/999999999/status", json={"status": "shipped"}).status_code == 404
    assert client.patch("/tickets/999999999/status", json={"status": "resolved"}).status_code == 404


def test_list_endpoints_support_pagination_and_validate_parameters() -> None:
    for index in range(3):
        response = client.post(
            "/customers",
            json={
                "email": f"page-{uuid4()}@example.com",
                "full_name": f"Page Tester {index}",
            },
        )
        assert response.status_code == 201

    response = client.get("/customers?search=Page%20Tester&limit=2&offset=1")
    assert response.status_code == 200
    assert len(response.json()) == 2

    assert client.get("/customers?limit=0").status_code == 422
    assert client.get("/orders?offset=-1").status_code == 422
    assert client.get("/tickets?limit=101").status_code == 422


def test_workspace_header_isolates_records_and_legacy_requests_use_demo_workspace() -> None:
    first_workspace = create_workspace(str(uuid4()))
    second_workspace = create_workspace(str(uuid4()))
    first_headers = {"X-Workspace-ID": str(first_workspace)}
    second_headers = {"X-Workspace-ID": str(second_workspace)}

    first_customer = client.post(
        "/customers", headers=first_headers, json={"email": f"tenant-a-{uuid4()}@example.com", "full_name": "Tenant A"}
    ).json()
    second_customer = client.post(
        "/customers", headers=second_headers, json={"email": f"tenant-b-{uuid4()}@example.com", "full_name": "Tenant B"}
    ).json()

    assert first_customer["workspace_id"] == first_workspace
    assert second_customer["workspace_id"] == second_workspace
    assert [item["id"] for item in client.get("/customers", headers=first_headers).json()] == [first_customer["id"]]
    assert client.get(f"/customers/{second_customer['id']}", headers=first_headers).status_code == 404

    assert client.post(
        "/orders",
        headers=first_headers,
        json={
            "customer_id": second_customer["id"],
            "total_amount": "10.00",
            "shipping_address": "Cross-tenant address",
        },
    ).status_code == 404

    legacy_customer = client.post(
        "/customers", json={"email": f"legacy-{uuid4()}@example.com", "full_name": "Legacy Demo"}
    ).json()
    assert legacy_customer["workspace_id"] == 1
    assert client.get(f"/customers/{legacy_customer['id']}").status_code == 200


def test_workspace_listing_exposes_demo_workspace() -> None:
    response = client.get("/workspaces")

    assert response.status_code == 200
    assert any(item["id"] == 1 and item["slug"] == "relay-demo" for item in response.json())
