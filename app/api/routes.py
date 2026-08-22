from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models import Customer, Order, Ticket, Workspace
from app.schemas.customer import CustomerCreate, CustomerRead
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.schemas.ticket import TicketCreate, TicketRead, TicketStatusUpdate
from app.schemas.triage import TicketTriageRead
from app.schemas.workspace import WorkspaceRead
from app.services.triage import get_ticket_triage_provider

router = APIRouter()
DEFAULT_WORKSPACE_ID = 1


def get_workspace_id(
    workspace_header: int | None = Header(default=None, alias="X-Workspace-ID"),
) -> int:
    """Resolve the active workspace while keeping legacy demo requests working."""

    return workspace_header or DEFAULT_WORKSPACE_ID


def require_workspace(db: Session, workspace_id: int) -> Workspace:
    workspace = db.get(Workspace, workspace_id)
    if workspace is None:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return workspace


@router.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Report whether the API process is running."""

    return {"status": "ok", "service": get_settings().app_name}


@router.get("/workspaces", response_model=list[WorkspaceRead], tags=["workspaces"])
def list_workspaces(db: Session = Depends(get_db)) -> list[Workspace]:
    """List workspaces available to the local demo client."""

    return list(db.scalars(select(Workspace).order_by(Workspace.id)).all())


@router.post("/customers", response_model=CustomerRead, status_code=status.HTTP_201_CREATED, tags=["customers"])
def create_customer(
    payload: CustomerCreate,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> Customer:
    """Create a customer record."""

    require_workspace(db, workspace_id)
    existing = db.scalar(
        select(Customer).where(Customer.email == payload.email, Customer.workspace_id == workspace_id)
    )
    if existing:
        raise HTTPException(status_code=409, detail="A customer with this email already exists")

    customer = Customer(email=str(payload.email), full_name=payload.full_name, workspace_id=workspace_id)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/customers", response_model=list[CustomerRead], tags=["customers"])
def list_customers(
    search: str | None = Query(default=None, min_length=1),
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> list[Customer]:
    """Return customers, optionally filtered by name or email."""

    query = select(Customer).where(Customer.workspace_id == workspace_id).order_by(Customer.id)
    if search:
        pattern = f"%{search}%"
        query = query.where(Customer.full_name.ilike(pattern) | Customer.email.ilike(pattern))
    return list(db.scalars(query.limit(limit).offset(offset)).all())


@router.get("/customers/{customer_id}", response_model=CustomerRead, tags=["customers"])
def get_customer(
    customer_id: int,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> Customer:
    """Return one customer or a 404 response."""

    customer = db.scalar(select(Customer).where(Customer.id == customer_id, Customer.workspace_id == workspace_id))
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED, tags=["orders"])
def create_order(
    payload: OrderCreate,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> Order:
    """Create an order belonging to an existing customer."""

    require_workspace(db, workspace_id)
    if db.scalar(select(Customer).where(Customer.id == payload.customer_id, Customer.workspace_id == workspace_id)) is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    order = Order(**payload.model_dump(), workspace_id=workspace_id)
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=list[OrderRead], tags=["orders"])
def list_orders(
    customer_id: int | None = Query(default=None, gt=0),
    order_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> list[Order]:
    """Return orders, optionally filtered by customer and status."""

    query = select(Order).where(Order.workspace_id == workspace_id).order_by(Order.id)
    if customer_id is not None:
        query = query.where(Order.customer_id == customer_id)
    if order_status:
        query = query.where(Order.status == order_status)
    return list(db.scalars(query.limit(limit).offset(offset)).all())


@router.get("/orders/{order_id}", response_model=OrderRead, tags=["orders"])
def get_order(order_id: int, workspace_id: int = Depends(get_workspace_id), db: Session = Depends(get_db)) -> Order:
    """Return one order or a 404 response."""

    order = db.scalar(select(Order).where(Order.id == order_id, Order.workspace_id == workspace_id))
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/orders/{order_id}/status", response_model=OrderRead, tags=["orders"])
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> Order:
    """Update an order status after validating the order and allowed value."""

    order = db.scalar(select(Order).where(Order.id == order_id, Order.workspace_id == workspace_id))
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order


@router.post("/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED, tags=["tickets"])
def create_ticket(
    payload: TicketCreate,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> Ticket:
    """Create a support ticket for an existing customer."""

    require_workspace(db, workspace_id)
    if db.scalar(select(Customer).where(Customer.id == payload.customer_id, Customer.workspace_id == workspace_id)) is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    ticket = Ticket(**payload.model_dump(), workspace_id=workspace_id)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/tickets", response_model=list[TicketRead], tags=["tickets"])
def list_tickets(
    customer_id: int | None = Query(default=None, gt=0),
    ticket_status: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=100, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> list[Ticket]:
    """Return tickets, optionally filtered by customer and status."""

    query = select(Ticket).where(Ticket.workspace_id == workspace_id).order_by(Ticket.id)
    if customer_id is not None:
        query = query.where(Ticket.customer_id == customer_id)
    if ticket_status:
        query = query.where(Ticket.status == ticket_status)
    return list(db.scalars(query.limit(limit).offset(offset)).all())


@router.get("/tickets/{ticket_id}", response_model=TicketRead, tags=["tickets"])
def get_ticket(ticket_id: int, workspace_id: int = Depends(get_workspace_id), db: Session = Depends(get_db)) -> Ticket:
    """Return one support ticket or a 404 response."""

    ticket = db.scalar(select(Ticket).where(Ticket.id == ticket_id, Ticket.workspace_id == workspace_id))
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.post("/tickets/{ticket_id}/triage", response_model=TicketTriageRead, tags=["tickets"])
def triage_ticket(
    ticket_id: int,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> TicketTriageRead:
    """Return a deterministic triage recommendation for a workspace ticket."""

    ticket = db.scalar(select(Ticket).where(Ticket.id == ticket_id, Ticket.workspace_id == workspace_id))
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return get_ticket_triage_provider().triage(ticket).to_schema()


@router.patch("/tickets/{ticket_id}/status", response_model=TicketRead, tags=["tickets"])
def update_ticket_status(
    ticket_id: int,
    payload: TicketStatusUpdate,
    workspace_id: int = Depends(get_workspace_id),
    db: Session = Depends(get_db),
) -> Ticket:
    """Update a ticket status after validating the ticket and allowed value."""

    ticket = db.scalar(select(Ticket).where(Ticket.id == ticket_id, Ticket.workspace_id == workspace_id))
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = payload.status
    db.commit()
    db.refresh(ticket)
    return ticket
