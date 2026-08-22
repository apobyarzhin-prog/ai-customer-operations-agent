from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models import Customer, Order, Ticket
from app.schemas.customer import CustomerCreate, CustomerRead
from app.schemas.order import OrderCreate, OrderRead
from app.schemas.ticket import TicketCreate, TicketRead

router = APIRouter()


@router.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Report whether the API process is running."""

    return {"status": "ok", "service": get_settings().app_name}


@router.post("/customers", response_model=CustomerRead, status_code=status.HTTP_201_CREATED, tags=["customers"])
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)) -> Customer:
    """Create a customer record."""

    existing = db.scalar(select(Customer).where(Customer.email == payload.email))
    if existing:
        raise HTTPException(status_code=409, detail="A customer with this email already exists")

    customer = Customer(email=str(payload.email), full_name=payload.full_name)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("/customers", response_model=list[CustomerRead], tags=["customers"])
def list_customers(
    search: str | None = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
) -> list[Customer]:
    """Return customers, optionally filtered by name or email."""

    query = select(Customer).order_by(Customer.id)
    if search:
        pattern = f"%{search}%"
        query = query.where(Customer.full_name.ilike(pattern) | Customer.email.ilike(pattern))
    return list(db.scalars(query).all())


@router.get("/customers/{customer_id}", response_model=CustomerRead, tags=["customers"])
def get_customer(customer_id: int, db: Session = Depends(get_db)) -> Customer:
    """Return one customer or a 404 response."""

    customer = db.get(Customer, customer_id)
    if customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.post("/orders", response_model=OrderRead, status_code=status.HTTP_201_CREATED, tags=["orders"])
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> Order:
    """Create an order belonging to an existing customer."""

    if db.get(Customer, payload.customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    order = Order(**payload.model_dump())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=list[OrderRead], tags=["orders"])
def list_orders(
    customer_id: int | None = Query(default=None, gt=0),
    order_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
) -> list[Order]:
    """Return orders, optionally filtered by customer and status."""

    query = select(Order).order_by(Order.id)
    if customer_id is not None:
        query = query.where(Order.customer_id == customer_id)
    if order_status:
        query = query.where(Order.status == order_status)
    return list(db.scalars(query).all())


@router.get("/orders/{order_id}", response_model=OrderRead, tags=["orders"])
def get_order(order_id: int, db: Session = Depends(get_db)) -> Order:
    """Return one order or a 404 response."""

    order = db.get(Order, order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/tickets", response_model=TicketRead, status_code=status.HTTP_201_CREATED, tags=["tickets"])
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)) -> Ticket:
    """Create a support ticket for an existing customer."""

    if db.get(Customer, payload.customer_id) is None:
        raise HTTPException(status_code=404, detail="Customer not found")

    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("/tickets", response_model=list[TicketRead], tags=["tickets"])
def list_tickets(
    customer_id: int | None = Query(default=None, gt=0),
    ticket_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
) -> list[Ticket]:
    """Return tickets, optionally filtered by customer and status."""

    query = select(Ticket).order_by(Ticket.id)
    if customer_id is not None:
        query = query.where(Ticket.customer_id == customer_id)
    if ticket_status:
        query = query.where(Ticket.status == ticket_status)
    return list(db.scalars(query).all())


@router.get("/tickets/{ticket_id}", response_model=TicketRead, tags=["tickets"])
def get_ticket(ticket_id: int, db: Session = Depends(get_db)) -> Ticket:
    """Return one support ticket or a 404 response."""

    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket
