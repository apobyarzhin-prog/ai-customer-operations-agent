from decimal import Decimal

from sqlalchemy import select

from app.db.session import SessionLocal, init_db
from app.models import Customer, Order, Ticket


def seed_demo_data() -> None:
    """Insert a small, repeatable dataset for local demos."""

    init_db()
    db = SessionLocal()
    try:
        if db.scalar(select(Customer).where(Customer.email == "anna@example.com")):
            print("Demo data already exists.")
            return

        anna = Customer(email="anna@example.com", full_name="Anna Petrova")
        michael = Customer(email="michael@example.com", full_name="Michael Brown")
        db.add_all([anna, michael])
        db.flush()

        db.add_all(
            [
                Order(
                    customer_id=anna.id,
                    status="delivered",
                    total_amount=Decimal("129.99"),
                    shipping_address="15 Main Street",
                ),
                Order(
                    customer_id=michael.id,
                    status="shipped",
                    total_amount=Decimal("79.50"),
                    shipping_address="22 Park Avenue",
                ),
                Ticket(
                    customer_id=anna.id,
                    subject="Damaged package",
                    description="The headphones arrived with a damaged box.",
                    status="open",
                ),
                Ticket(
                    customer_id=michael.id,
                    subject="Delivery question",
                    description="The customer wants to know the expected delivery date.",
                    status="in_progress",
                ),
            ]
        )
        db.commit()
        print("Inserted 2 customers, 2 orders, and 2 tickets.")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
