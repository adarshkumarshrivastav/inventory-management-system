from fastapi import FastAPI, Depends, HTTPException, status
# 1. Add this import at the top
from fastapi.middleware.cors import CORSMiddleware 
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API")

# 2. Paste this CORS configuration block right here:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",    # Standard Vite local address
        "http://127.0.0.1:5173"     # Alternative local loopback address
    ],
    allow_credentials=True,
    allow_methods=["*"],            # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],            # Allows all configuration headers
)

# ==========================================
# PRODUCT ENDPOINTS & BUSINESS LOGIC
# ==========================================

@app.post("/products", response_model=schemas.Product, status_code=status.HTTP_201_CREATED)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Check if SKU already exists to satisfy the unique SKU requirement
    db_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products", response_model=List[schemas.Product])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.get("/products/{id}", response_model=schemas.Product)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.put("/products/{id}", response_model=schemas.Product)
def update_product(id: int, product_update: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update fields
    for key, value in product_update.model_dump().items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return None

# ==========================================
# CUSTOMER ENDPOINTS
# ==========================================

@app.post("/customers", response_model=schemas.Customer, status_code=status.HTTP_201_CREATED)
def create_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    # Enforce unique email requirement
    db_customer = db.query(models.Customer).filter(models.Customer.email == customer.email).first()
    if db_customer:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")

    new_customer = models.Customer(**customer.model_dump())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@app.get("/customers", response_model=List[schemas.Customer])
def get_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Customer).offset(skip).limit(limit).all()

@app.get("/customers/{id}", response_model=schemas.Customer)
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@app.delete("/customers/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(id: int, db: Session = Depends(get_db)):
    db_customer = db.query(models.Customer).filter(models.Customer.id == id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(db_customer)
    db.commit()
    return None

# ==========================================
# ORDER ENDPOINTS & BUSINESS LOGIC
# ==========================================

@app.post("/orders", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    # 1. Validate Customer exists
    customer = db.query(models.Customer).filter(models.Customer.id == order.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    total_amount = 0.0
    processed_items = []

    # 2. Validate Products and Inventory (Business Logic)
    for item in order.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found")

        # Prevent order if inventory is insufficient
        if product.quantity < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient inventory for product '{product.name}'. Requested: {item.quantity}, Available: {product.quantity}"
            )

        # Automatically calculate total amount
        total_amount += product.price * item.quantity

        # Stage data for saving
        processed_items.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.price
        })

    # 3. Create the Order shell
    new_order = models.Order(customer_id=order.customer_id, total_amount=total_amount)
    db.add(new_order)
    db.flush() # Flush to get the new_order.id before committing

    # 4. Deduct Inventory and Save Order Items
    for p_item in processed_items:
        # Deduct stock automatically
        p_item["product"].quantity -= p_item["quantity"]

        # Create the bridge table entry
        order_item = models.OrderItem(
            order_id=new_order.id,
            product_id=p_item["product"].id,
            quantity=p_item["quantity"],
            unit_price=p_item["unit_price"]
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order

@app.get("/orders", response_model=List[schemas.Order])
def get_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Order).offset(skip).limit(limit).all()

@app.get("/orders/{id}", response_model=schemas.Order)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.delete("/orders/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(id: int, db: Session = Depends(get_db)):
    db_order = db.query(models.Order).filter(models.Order.id == id).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Delete order items first to prevent foreign key constraint errors
    for item in db_order.items:
        db.delete(item)

    db.delete(db_order)
    db.commit()
    return None

# ==========================================
# DASHBOARD HELPER ENDPOINT
# ==========================================
# The frontend requires a dashboard with summary data. 
# This endpoint aggregates that data to make the frontend simpler to build.

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    
    # Define "low stock" as anything with fewer than 10 items remaining
    low_stock_products = db.query(models.Product).filter(models.Product.quantity < 10).count() 

    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": low_stock_products
    }