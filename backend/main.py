from fastapi import FastAPI, Depends, HTTPException, status
# 1. Add this import at the top
from fastapi.middleware.cors import CORSMiddleware 
from sqlalchemy.orm import Session
from typing import List
from fastapi.responses import HTMLResponse

import models
import schemas
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Inventory & Order Management API")

# 2. Paste this CORS configuration block right here:
app.add_middleware(
    CORSMiddleware,
     allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],            # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],            # Allows all configuration headers
)

@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IMS API - Live Status</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-slate-900 text-slate-100 font-sans flex items-center justify-center min-h-screen p-4">
        <div class="max-w-2xl w-full bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-2xl space-y-6">
            
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-6">
                <div>
                    <h1 class="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <i class="fa-solid fa-cubes text-cyan-400"></i> IMS Engine
                    </h1>
                    <p class="text-sm text-slate-400 mt-1">Inventory Management System core services</p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span> ENGINE ONLINE
                </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-700/30 flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <i class="fa-brands fa-python text-xl"></i>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Framework</p>
                        <p class="text-sm font-semibold text-slate-200">FastAPI (Python)</p>
                    </div>
                </div>
                <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-700/30 flex items-center gap-4">
                    <div class="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                        <i class="fa-brands fa-docker text-xl"></i>
                    </div>
                    <div>
                        <p class="text-xs text-slate-400 uppercase tracking-wider font-medium">Environment</p>
                        <p class="text-sm font-semibold text-slate-200">Docker Containerized</p>
                    </div>
                </div>
            </div>

            <div class="space-y-3">
                <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400">Available Gateways</h3>
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="/docs" target="_blank" class="flex-1 flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-md group">
                        <span class="font-medium text-white flex items-center gap-2">
                            <i class="fa-solid fa-book-open"></i> Interactive API Docs
                        </span>
                        <i class="fa-solid fa-arrow-right transition-transform group-hover:translate-x-1"></i>
                    </a>
                    <a href="/explore/products" class="flex-1 flex items-center justify-between p-4 rounded-xl bg-slate-700/40 hover:bg-slate-700/70 border border-slate-600/30 transition-all group">
                        <span class="font-medium text-slate-200 flex items-center gap-2">
                            <i class="fa-solid fa-boxes-stacked text-cyan-400"></i> Products Catalog
                        </span>
                        <i class="fa-solid fa-arrow-right text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400"></i>
                    </a>
                </div>
            </div>

            <div class="text-center text-xs text-slate-500 border-t border-slate-700/40 pt-4">
                Architecture validated & deployed cleanly to production cloud environments.
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/explore/products", response_class=HTMLResponse)
def explore_products_ui(db: Session = Depends(get_db)):
    products = db.query(models.Product).order_by(models.Product.name).all()
    
    product_cards = ""
    if not products:
        product_cards = """
        <div class="col-span-full text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/60">
            <i class="fa-solid fa-box-open text-5xl text-slate-600 mb-4 block"></i>
            <h3 class="text-lg font-bold text-slate-300">No Inventory Found</h3>
            <p class="text-sm text-slate-500 mt-1">Populate items using your active frontend interface panel.</p>
        </div>
        """
    else:
        for p in products:
            # Dynamic stock badge calculation
            if p.quantity >= 10:
                stock_badge = f'<span class="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">{p.quantity} In Stock</span>'
            else:
                stock_badge = f'<span class="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20 animate-pulse">{p.quantity} Low Stock</span>'
            
            product_cards += f"""
            <div class="bg-slate-800/40 border border-slate-700/40 rounded-xl p-6 hover:border-slate-600/80 transition-all duration-200 shadow-lg flex flex-col justify-between group">
                <div>
                    <div class="flex justify-between items-start gap-4 mb-2">
                        <h3 class="text-lg font-bold text-white tracking-tight group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                        {stock_badge}
                    </div>
                    <p class="text-sm text-slate-400 line-clamp-2 mb-4">{p.description or 'No product description available.'}</p>
                </div>
                <div class="flex justify-between items-center pt-4 border-t border-slate-700/40">
                    <span class="text-xs font-mono text-slate-500 tracking-wider bg-slate-900/60 px-2 py-1 rounded">SKU: {p.sku}</span>
                    <span class="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">${p.price:,.2f}</span>
                </div>
            </div>
            """

    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Product Catalog Showcase</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-slate-900 text-slate-100 font-sans min-h-screen p-4 sm:p-8">
        <div class="max-w-5xl mx-full mx-auto space-y-8">
            
            <div class="flex items-center gap-2 text-sm text-slate-400">
                <a href="/" class="hover:text-cyan-400 transition-colors flex items-center gap-1.5"><i class="fa-solid fa-house text-xs"></i> Engine Root</a>
                <i class="fa-solid fa-chevron-right text-xs text-slate-600"></i>
                <span class="text-slate-200 font-medium">Products Catalog</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 class="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <i class="fa-solid fa-boxes-stacked text-cyan-400"></i> Live Inventory Database
                    </h1>
                    <p class="text-sm text-slate-400 mt-1">Real-time dynamic display extracted directly via SQLAlchemy Core layer mappings.</p>
                </div>
                <div class="text-xs font-mono text-slate-400 bg-slate-800/40 border border-slate-700/40 rounded-lg px-4 py-2.5 self-start sm:self-center flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-cyan-400"></span> Total Loaded: <span class="font-bold text-white">{len(products)}</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {product_cards}
            </div>
            
        </div>
    </body>
    </html>
    """

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