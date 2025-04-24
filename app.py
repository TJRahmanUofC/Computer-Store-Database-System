# This is a Flask application that serves as a backend for a computer hardware store.
# It includes user authentication, product management, order processing, and admin functionalities.
# The application uses MySQL for data storage and supports CORS for cross-origin requests.
# It also includes connection pooling for efficient database access and uses environment variables for configuration.

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import hashlib 
import os
from dotenv import load_dotenv 
from datetime import datetime
import random
import hashlib
import mysql.connector
from mysql.connector import pooling 
from flask import send_from_directory 

load_dotenv() # Load environment variables from .env file

# Configure Flask App: static_url_path='/assets' means requests starting with /assets
# will be served from the static_folder='assets' directory.
app = Flask(__name__, static_url_path='/assets', static_folder='assets')

CORS(app, supports_credentials=True)

# MySQL Configuration - Load from environment variables
app.config['MYSQL_HOST'] = os.getenv('MYSQL_HOST', 'localhost')
app.config['MYSQL_USER'] = os.getenv('MYSQL_USER', 'root')
app.config['MYSQL_PASSWORD'] = os.getenv('MYSQL_PASSWORD')
app.config['MYSQL_DB'] = os.getenv('MYSQL_DB', 'Computer_Hardware_Store')
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

# Check if essential DB config is missing
if not app.config['MYSQL_PASSWORD']:
    raise ValueError("Missing required environment variable: MYSQL_PASSWORD")

# Session configuration
app.secret_key = os.urandom(24)

# Helper function to execute SQL queries
dbconfig = {
    "host": app.config['MYSQL_HOST'],
    "user": app.config['MYSQL_USER'],
    "password": app.config['MYSQL_PASSWORD'],
    "database": app.config['MYSQL_DB']
}

# Create a connection pool for MySQL
# This allows multiple connections to be reused, improving performance.
cnxpool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=10,  
    **dbconfig
)

# --- Helper function using connection pool ---
def execute_query(query, params=None, fetch_all=False, commit=False):
    connection = None
    cursor = None
    try:
        connection = cnxpool.get_connection()
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())

        if commit:
            connection.commit()
            result = cursor.lastrowid
            # Consume any potential leftover results after commit
            # This handles cases where UPDATE/INSERT might implicitly return something
            # or if stored procedures are used.
            while cursor.nextset(): pass
            return result
        elif fetch_all:
            result = cursor.fetchall()
            return result
        else:
            result = cursor.fetchone()
            # If fetchone() was used, normally it consumes the row.
            # No explicit consumption needed here unless error persists.
            return result

    except Exception as e:
        print(f"Database error: {e}")
        return None

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

# --- HTML Serving Routes ---

@app.route('/')
def serve_index():
    # Serve index.html from the project root
    # This is the main entry point for the application.
    # It can be used to serve the main HTML file for the application.
    return send_from_directory('.', 'index.html')

@app.route('/customer/<path:filename>')
def serve_customer_html(filename):
    # Serves HTML files from the customer directory
    # This is used to serve customer-specific HTML files.
    # The filename is passed as a parameter to the function.
    return send_from_directory('customer', filename)

@app.route('/admin/<path:filename>')
def serve_admin_html(filename):
    # Serves HTML files from the admin directory
    return send_from_directory('admin', filename)

# --- API Routes ---

# Authentication and User Management Routes

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone') or None
    address = data.get('address')
    
    # Check if email already exists
    existing_user = execute_query("SELECT * FROM CUSTOMER WHERE EMAIL = %s", [email])
    if existing_user:
        return jsonify({"success": False, "message": "Email already registered"}), 400


    synthetic_ssn_str = hashlib.sha256(email.encode()).hexdigest()[:8]
    synthetic_ssn = int(synthetic_ssn_str, 16) % 1000000000 # Convert hex substring to int

    # Hash the password using SHA-256 (Less secure than Werkzeug's salted hash)
    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()

    try:
        # Insert into PERSON table first
        person_id = execute_query(
            "INSERT INTO PERSON (SSN, NAME, PHONE, ADDRESS, is_synthetic_ssn) VALUES (%s, %s, %s, %s, %s)",
            [synthetic_ssn, name, phone, address, True],
            commit=True
        )
        
        # Insert into CUSTOMER table
        customer_id = execute_query(
            "INSERT INTO CUSTOMER (EMAIL, SSN, PASSWORD_HASH) VALUES (%s, %s, %s)",
            [email, synthetic_ssn, hashed_password],
            commit=True
        )
        
        # Note: Password history logging removed as it was tied to the stored procedure
        
        return jsonify({"success": True, "message": "Registration successful"}), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        # Check for duplicate SSN specifically if that's a constraint violation
        if 'Duplicate entry' in str(e) and 'for key \'PRIMARY\'' in str(e) and 'PERSON' in str(e):
             return jsonify({"success": False, "message": "Failed to generate unique identifier. Please try again or contact support."}), 500
        elif 'Duplicate entry' in str(e) and 'for key \'PRIMARY\'' in str(e) and 'CUSTOMER' in str(e):
             return jsonify({"success": False, "message": "Email already registered."}), 400
        return jsonify({"success": False, "message": f"An internal error occurred: {str(e)}"}), 500

# --- Login and Logout Routes ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # Get customer with email
    customer = execute_query("""
        SELECT c.EMAIL, c.PASSWORD_HASH, p.NAME, p.PHONE, p.ADDRESS 
        FROM CUSTOMER c
        JOIN PERSON p ON c.SSN = p.SSN
        WHERE c.EMAIL = %s
    """, [email])

    # --- Debugging ---
    print(f"Login attempt for: {email}")
    if customer:
        print(f"Found customer. Stored hash: {customer.get('PASSWORD_HASH')}")
        # Verify password using SHA-256
        provided_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
        hash_check_result = (customer['PASSWORD_HASH'] == provided_hash)
        print(f"Password check result: {hash_check_result}")
    else:
        print("Customer not found in database.")
    # --- End Debugging ---

    # Verify password using SHA-256
    if customer and customer['PASSWORD_HASH'] == hashlib.sha256(password.encode('utf-8')).hexdigest():
        # Store user info in session
        session['user'] = {
            'email': customer['EMAIL'],
            'name': customer['NAME']
        }
        return jsonify({
            "success": True, 
            "user": {
                "email": customer['EMAIL'],
                "name": customer['NAME'],
                "phone": customer['PHONE'],
                "address": customer['ADDRESS']
            }
        })
    
    return jsonify({"success": False, "message": "Invalid email or password"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({"success": True})

#User routes
@app.route('/api/user', methods=['GET'])
def get_user():
    if 'user' in session:
        return jsonify({"success": True, "user": session['user']})
    return jsonify({"success": False, "message": "Not logged in"}), 401


@app.route('/api/user/change-password', methods=['POST'])
def user_change_password():
    if 'user' not in session:
        return jsonify({"success": False, "message": "Login required"}), 401

    data = request.json
    current_pw = data.get('current_password')
    new_pw = data.get('new_password')
    email = session['user']['email']

    user = execute_query("SELECT PASSWORD_HASH FROM CUSTOMER WHERE EMAIL = %s", [email])
    if not user or user['PASSWORD_HASH'] != hashlib.sha256(current_pw.encode('utf-8')).hexdigest():
        return jsonify({"success": False, "message": "Current password incorrect"}), 403

    new_hash = hashlib.sha256(new_pw.encode('utf-8')).hexdigest()
    execute_query("UPDATE CUSTOMER SET PASSWORD_HASH = %s WHERE EMAIL = %s", [new_hash, email], commit=True)
    
    return jsonify({"success": True, "message": "Password changed successfully"})


# Product Routes

@app.route('/api/products', methods=['GET'])
def get_products():
    limit = request.args.get('limit', type=int)
    category = request.args.get('category') # Get category from query params
    
    params = []
    query = """
        SELECT p.PRODUCTID, p.NAME, p.PRICE, p.CATEGORY_NAME, p.NO_OF_PRODUCTS, p.IMAGE_URL
        FROM PRODUCT p
    """
    
    # Add WHERE clause if category is specified and not 'All'
    if category and category.lower() != 'all':
        query += " WHERE p.CATEGORY_NAME = %s"
        params.append(category)
        
    query += " ORDER BY p.PRODUCTID DESC" # Always order
    
    # Add LIMIT clause if specified
    if limit:
        query += " LIMIT %s"
        params.append(limit)
        
    products = execute_query(query, params, fetch_all=True)

    return jsonify({"success": True, "products": products})

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = execute_query("""
        SELECT p.PRODUCTID, p.NAME, p.PRICE, p.CATEGORY_NAME, p.NO_OF_PRODUCTS, p.IMAGE_URL,
               s.LOCATION, s.NAME as STORE_NAME
        FROM PRODUCT p
        JOIN STORE s ON p.STOREID = s.STOREID
        WHERE p.PRODUCTID = %s
    """, [product_id])
    
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404
    
    # Get related products (same category)
    related_products = execute_query("""
        SELECT p.PRODUCTID, p.NAME, p.PRICE, p.CATEGORY_NAME, p.NO_OF_PRODUCTS,  p.IMAGE_URL
        FROM PRODUCT p
        WHERE p.CATEGORY_NAME = %s AND p.PRODUCTID != %s
        LIMIT 4
    """, [product['CATEGORY_NAME'], product_id], fetch_all=True)
    
    return jsonify({
        "success": True,
        "product": product,
        "related_products": related_products
    })

@app.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
def admin_delete_product(product_id):
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401

    try:
        execute_query("DELETE FROM PRODUCT WHERE PRODUCTID = %s", [product_id], commit=True)
        return jsonify({"success": True, "message": "Product deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Cart and Order Routes

@app.route('/api/categories', methods=['GET'])
def get_categories():
    # Fetch distinct category names from the PRODUCT table
    categories = execute_query("""
        SELECT DISTINCT CATEGORY_NAME
        FROM PRODUCT
        ORDER BY CATEGORY_NAME
    """, fetch_all=True)
    # ... (error handling and response) ...
    return jsonify({"success": True, "categories": categories})

@app.route('/api/orders', methods=['POST'])
def create_order():
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please login to place an order"}), 401

    # Get cart from session
    session_cart = session.get('cart', [])
    if not session_cart:
        return jsonify({"success": False, "message": "Cart is empty"}), 400

    # Get shipping and payment info from request (though not fully used by current schema)
    data = request.json
    shipping_info = data.get('shipping_info', {}) # Currently unused for order storage
    payment_info = data.get('payment_info', {})
    # Get the actual payment_type sent from the frontend
    payment_type = payment_info.get('payment_type', 'Unknown') # Default to 'Unknown' if not provided

    email = session['user']['email']
    order_date_str = datetime.now().strftime('%Y-%m-%d')

    # --- Database Interaction (Ideally within a transaction) ---
    connection = None
    cursor = None
    try:
        connection = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB']
        )
        cursor = connection.cursor(dictionary=True)
        # connection.start_transaction() # Start transaction

        # 1. Fetch product details and validate stock
        product_ids = [item['productId'] for item in session_cart]
        if not product_ids: # Should be caught earlier, but double-check
             return jsonify({"success": False, "message": "Cart contains no valid product IDs"}), 400

        placeholders = ','.join(['%s'] * len(product_ids))
        query = f"SELECT PRODUCTID, NAME, PRICE, NO_OF_PRODUCTS FROM PRODUCT WHERE PRODUCTID IN ({placeholders})"
        cursor.execute(query, product_ids)
        products_in_db = {p['PRODUCTID']: p for p in cursor.fetchall()}

        total_amount = 0
        items_to_process = []

        for item in session_cart:
            product_id = item['productId']
            quantity_requested = item['quantity']
            product_db = products_in_db.get(product_id)

            if not product_db:
                raise ValueError(f"Product ID {product_id} not found in database.")
            if product_db['NO_OF_PRODUCTS'] < quantity_requested:
                raise ValueError(f"Insufficient stock for product '{product_db['NAME']}' (Requested: {quantity_requested}, Available: {product_db['NO_OF_PRODUCTS']}).")

            item_total = product_db['PRICE'] * quantity_requested
            total_amount += item_total
            items_to_process.append({
                'productId': product_id,
                'quantity': quantity_requested,
                'price': product_db['PRICE'] # Use fetched price
            })

        # 2. Generate unique ORDER_NUMBER and Create ORDERS record
        while True:
            random_digits = str(random.randint(100000, 999999))
            order_number = f"ORD-{random_digits}"
            # Check if order_number already exists (unlikely but good practice)
            cursor.execute("SELECT 1 FROM ORDERS WHERE ORDER_NUMBER = %s", [order_number])
            if not cursor.fetchone():
                break # Unique number found

        cursor.execute(
            "INSERT INTO ORDERS (ORDER_DATE, ORDER_NUMBER, EMAIL, STATUS) VALUES (%s, %s, %s, %s)",
            [order_date_str, order_number, email, 'Pending'] # Use generated order_number, set status to Pending
        )
        order_id = cursor.lastrowid # Internal DB ID
        if not order_id:
             raise Exception("Failed to create order record.")

        # 3. Create PAYMENT record
        cursor.execute(
            "INSERT INTO PAYMENT (PAYMENT_TYPE, AMOUNT, DATE, STATUS) VALUES (%s, %s, %s, %s)",
            [payment_type, total_amount, order_date_str, 'Completed'] # Assume payment is completed
        )
        payment_no = cursor.lastrowid
        if not payment_no:
             raise Exception("Failed to create payment record.")

        # 4. Create MAKES_PAYMENT record
        cursor.execute(
            "INSERT INTO MAKES_PAYMENT (PAYMENT_NO, ORDER_ID, EMAIL) VALUES (%s, %s, %s)",
            [payment_no, order_id, email]
        )

        # 5. Insert into ORDER_ITEMS and Update PRODUCT stock
        for item_proc in items_to_process:
            # Insert into ORDER_ITEMS
            cursor.execute(
                """INSERT INTO ORDER_ITEMS (ORDER_ID, PRODUCTID, QUANTITY, PRICE_AT_PURCHASE)
                   VALUES (%s, %s, %s, %s)""",
                [order_id, item_proc['productId'], item_proc['quantity'], item_proc['price']]
            )
            
            # Decrement stock in PRODUCT table
            cursor.execute(
                """UPDATE PRODUCT
                   SET NO_OF_PRODUCTS = NO_OF_PRODUCTS - %s
                   WHERE PRODUCTID = %s AND NO_OF_PRODUCTS >= %s""",
                [item_proc['quantity'], item_proc['productId'], item_proc['quantity']]
            )
            if cursor.rowcount == 0:
                # This means stock changed between check and update, or initial check failed somehow
                raise ValueError(f"Failed to update stock for product ID {item_proc['productId']} (likely became insufficient).")

        # connection.commit() # Commit transaction should happen here in a real transactional setup

        # 6. Clear cart from session AFTER successful commit
        session.pop('cart', None)
        session.modified = True

        return jsonify({
            "success": True,
            "message": "Order placed successfully",
            "order_id": order_id, # Internal ID
            "order_number": order_number # User-facing ID
        })
    except ValueError as ve: # Specific error for stock/validation issues
        # connection.rollback() # Rollback transaction
        print(f"Order validation error: {ve}")
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as e:
        # connection.rollback() # Rollback transaction
        print(f"Order creation error: {e}")
        return jsonify({"success": False, "message": f"An internal error occurred: {str(e)}"}), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.commit()
            connection.close()


@app.route('/api/orders', methods=['GET'])
def get_orders():
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please login to view orders"}), 401
    
    email = session['user']['email']
    
    orders = execute_query("""
        SELECT o.ORDER_ID, o.ORDER_NUMBER, o.ORDER_DATE, o.STATUS, p.PAYMENT_TYPE, p.AMOUNT
        FROM ORDERS o
        JOIN MAKES_PAYMENT mp ON o.ORDER_ID = mp.ORDER_ID
        JOIN PAYMENT p ON mp.PAYMENT_NO = p.PAYMENT_NO
        WHERE o.EMAIL = %s
        ORDER BY o.ORDER_DATE DESC
    """, [email], fetch_all=True)

    if orders is None: # Handle potential database error from execute_query
        return jsonify({"success": False, "message": "Failed to retrieve orders from database."}), 500
    
    # Get products for each order using the new ORDER_ITEMS table
    for order in orders:
        # Convert AMOUNT to float before processing items
        if order.get('AMOUNT') is not None:
            try:
                order['AMOUNT'] = float(order['AMOUNT'])
            except (ValueError, TypeError):
                print(f"Warning: Could not convert order AMOUNT {order.get('AMOUNT')} to float for order ID {order.get('ORDER_ID')}")
                order['AMOUNT'] = 0.0 # Default or handle as appropriate

        order_items = execute_query("""
            SELECT oi.QUANTITY, oi.PRICE_AT_PURCHASE, p.PRODUCTID, p.NAME, p.CATEGORY_NAME
            FROM ORDER_ITEMS oi
            JOIN PRODUCT p ON oi.PRODUCTID = p.PRODUCTID
            WHERE oi.ORDER_ID = %s
        """, [order['ORDER_ID']], fetch_all=True)
        
        # Reformat to match frontend expectation and convert PRICE_AT_PURCHASE to float
        order['products'] = []
        if order_items: # Check if order_items were fetched successfully
            for item in order_items:
                try:
                    price_float = float(item['PRICE_AT_PURCHASE'])
                except (ValueError, TypeError):
                     print(f"Warning: Could not convert PRICE_AT_PURCHASE {item.get('PRICE_AT_PURCHASE')} to float for product ID {item.get('PRODUCTID')} in order ID {order.get('ORDER_ID')}")
                     price_float = 0.0 # Default or handle as appropriate

                order['products'].append({
                    'PRODUCTID': item['PRODUCTID'],
                    'NAME': item['NAME'],
                    'PRICE': price_float, # Send as float
                    'CATEGORY_NAME': item['CATEGORY_NAME'],
                    'quantity': item['QUANTITY']
                })
        # If order_items fetch failed, order['products'] will remain empty
    
    return jsonify({"success": True, "orders": orders})

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please login to view order details"}), 401
    
    email = session['user']['email']
    
    order = execute_query("""
        SELECT o.ORDER_ID, o.ORDER_NUMBER, o.ORDER_DATE, o.STATUS, p.PAYMENT_TYPE, p.AMOUNT
        FROM ORDERS o
        JOIN MAKES_PAYMENT mp ON o.ORDER_ID = mp.ORDER_ID
        JOIN PAYMENT p ON mp.PAYMENT_NO = p.PAYMENT_NO
        WHERE o.ORDER_ID = %s AND o.EMAIL = %s
    """, [order_id, email])
    
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404

    # Convert AMOUNT to float
    if order.get('AMOUNT') is not None:
        try:
            order['AMOUNT'] = float(order['AMOUNT'])
        except (ValueError, TypeError):
            print(f"Warning: Could not convert order AMOUNT {order.get('AMOUNT')} to float for order ID {order_id}")
            order['AMOUNT'] = 0.0 # Default or handle as appropriate
            
    # Get products for this order using ORDER_ITEMS
    order_items = execute_query("""
        SELECT oi.QUANTITY, oi.PRICE_AT_PURCHASE, p.PRODUCTID, p.NAME, p.CATEGORY_NAME
        FROM ORDER_ITEMS oi
        JOIN PRODUCT p ON oi.PRODUCTID = p.PRODUCTID
        WHERE oi.ORDER_ID = %s
    """, [order_id], fetch_all=True)

    # Reformat to match frontend expectation and convert PRICE_AT_PURCHASE to float
    order['products'] = []
    if order_items: # Check if order_items were fetched successfully
        for item in order_items:
            try:
                price_float = float(item['PRICE_AT_PURCHASE'])
            except (ValueError, TypeError):
                print(f"Warning: Could not convert PRICE_AT_PURCHASE {item.get('PRICE_AT_PURCHASE')} to float for product ID {item.get('PRODUCTID')} in order ID {order_id}")
                price_float = 0.0 # Default or handle as appropriate

            order['products'].append({
                'PRODUCTID': item['PRODUCTID'],
                'NAME': item['NAME'],
                'PRICE': price_float, # Send as float
                'CATEGORY_NAME': item['CATEGORY_NAME'],
                'quantity': item['QUANTITY']
            })
    # If order_items fetch failed, order['products'] will remain empty

    return jsonify({"success": True, "order": order})

@app.route('/api/cart', methods=['POST'])
def add_to_cart():
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please log in to add items to the cart"}), 401

    data = request.json
    product_id = data.get('productId')

    # Get quantity from request, default to 1 if not provided or invalid
    try:
        quantity_to_add = int(data.get('quantity', 1))
        if quantity_to_add <= 0:
            quantity_to_add = 1 # Ensure at least 1 is added
    except (ValueError, TypeError):
        quantity_to_add = 1
 
     # Check if the product exists
    product = execute_query("SELECT PRODUCTID, NAME, NO_OF_PRODUCTS FROM PRODUCT WHERE PRODUCTID = %s", [product_id])
    if not product:
         return jsonify({"success": False, "message": "Product not found"}), 404

    # Initialize cart in session if not already present
    if 'cart' not in session:
        session['cart'] = []

    # Check if the product is already in the cart
    cart = session['cart']
    current_cart_quantity = 0
    item_found = False


    for item in cart:
        if item['productId'] == product_id:
            current_cart_quantity = item['quantity']
            item_found = True
            break
    
        # Check stock availability (requested quantity + current cart quantity vs available stock)
    total_quantity_needed = current_cart_quantity + quantity_to_add
    if product['NO_OF_PRODUCTS'] < total_quantity_needed:
         available_stock = product['NO_OF_PRODUCTS']
         can_add = available_stock - current_cart_quantity
         message = f"Insufficient stock for {product['NAME']}. Available: {available_stock}. You have {current_cart_quantity} in cart."
         if can_add > 0:
              message += f" You can add {can_add} more."
         else:
              message += " Cannot add more."
         return jsonify({"success": False, "message": message}), 400
 
     # Update quantity if item exists, otherwise add new item
    if item_found:
         for item in cart:
             if item['productId'] == product_id:
                 item['quantity'] += quantity_to_add
                 break
    else:
         cart.append({"productId": product_id, "quantity": quantity_to_add})
    

    # Add new product to the cart
    
    session.modified = True
    return jsonify({"success": True, "message": f"{quantity_to_add} item(s) added/updated in cart"})


@app.route('/api/cart/count', methods=['GET'])
def get_cart_count():
    # Check if the user is logged in
    if 'user' not in session:
        # User is not logged in, return count as 0
        return jsonify({'success': True, 'count': 0})
    
    try:
        # Fetch the cart from the session
        cart = session.get('cart', [])
        # Calculate the total count of items in the cart
        cart_count = sum(item['quantity'] for item in cart)
        return jsonify({'success': True, 'count': cart_count})
    except Exception as e:
        # Handle any unexpected errors
        return jsonify({'success': False, 'message': f"An error occurred: {str(e)}"}), 500

@app.route('/api/cart', methods=['GET'])
def get_cart():
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please log in to view cart"}), 401

    cart = session.get('cart', [])
    product_ids = [item['productId'] for item in cart]

    # Fetch product details for items in the cart
    if not product_ids:
        return jsonify({"success": True, "cart": []})

    query = "SELECT * FROM PRODUCT WHERE PRODUCTID IN (%s)" % ','.join(['%s'] * len(product_ids))
    products = execute_query(query, product_ids, fetch_all=True)

    # Merge product details with quantities
    cart_details = []
    for item in cart:
        for product in products:
            if product['PRODUCTID'] == item['productId']:
                cart_details.append({
                    "productId": product['PRODUCTID'],
                    "name": product['NAME'],
                    "price": product['PRICE'],
                    "quantity": item['quantity']
                })

    return jsonify({"success": True, "cart": cart_details})

@app.route('/api/cart/<int:product_id>', methods=['PUT'])
def update_cart_item(product_id):
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please log in to update cart"}), 401

    data = request.json
    new_quantity = data.get('quantity')

    if new_quantity is None or not isinstance(new_quantity, int) or new_quantity <= 0:
        return jsonify({"success": False, "message": "Invalid quantity provided"}), 400

    cart = session.get('cart', [])
    item_found = False
    for item in cart:
        if item['productId'] == product_id:
            item['quantity'] = new_quantity
            item_found = True
            break

    if not item_found:
        return jsonify({"success": False, "message": "Item not found in cart"}), 404

    session.modified = True
    return jsonify({"success": True, "message": "Cart item updated"})

@app.route('/api/cart/<int:product_id>', methods=['DELETE'])
def remove_cart_item(product_id):
    if 'user' not in session:
        return jsonify({"success": False, "message": "Please log in to remove items from cart"}), 401

    cart = session.get('cart', [])
    initial_length = len(cart)
    
    # Create a new list excluding the item to remove
    new_cart = [item for item in cart if item['productId'] != product_id]

    if len(new_cart) == initial_length:
        return jsonify({"success": False, "message": "Item not found in cart"}), 404

    session['cart'] = new_cart
    session.modified = True
    return jsonify({"success": True, "message": "Item removed from cart"})

# Admin Routes
@app.route('/api/admin/profile', methods=['GET'])
def get_admin_profile():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401

    return jsonify({
        "success": True,
        "admin": session['admin']
    })

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json
    employee_id = data.get('employee_id')
    password = data.get('password')
    
    employee = execute_query("""
        SELECT e.EMPLOYEE_ID, e.PASSWORD_HASH, e.ROLE, p.NAME, e.STOREID
        FROM EMPLOYEE e
        JOIN PERSON p ON e.SSN = p.SSN
        WHERE e.EMPLOYEE_ID = %s
    """, [employee_id])
    
    # Verify password using SHA-256
    if employee and employee['PASSWORD_HASH'] == hashlib.sha256(password.encode('utf-8')).hexdigest():
        session['admin'] = {
            'employee_id': employee['EMPLOYEE_ID'],
            'name': employee['NAME'],
            'role': employee['ROLE'],
            'store_id': employee['STOREID']
        }
        return jsonify({
            "success": True,
            "admin": {
                "employee_id": employee['EMPLOYEE_ID'],
                "name": employee['NAME'],
                "role": employee['ROLE'],
                "store_id": employee['STOREID']
            }
        })
    
    return jsonify({"success": False, "message": "Invalid employee ID or password"}), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin', None)
    return jsonify({"success": True})

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
    
    # Get recent orders
    recent_orders = execute_query("""
        SELECT o.ORDER_ID, o.ORDER_DATE, o.STATUS, c.EMAIL, p.AMOUNT
        FROM ORDERS o
        JOIN MAKES_PAYMENT mp ON o.ORDER_ID = mp.ORDER_ID
        JOIN PAYMENT p ON mp.PAYMENT_NO = p.PAYMENT_NO
        JOIN CUSTOMER c ON o.EMAIL = c.EMAIL
        ORDER BY o.ORDER_DATE DESC
        LIMIT 10
    """, fetch_all=True)
    
    # Get product inventory summary
    inventory = execute_query("""
        SELECT p.CATEGORY_NAME, COUNT(*) as product_count, SUM(p.NO_OF_PRODUCTS) as total_stock
        FROM PRODUCT p
        GROUP BY p.CATEGORY_NAME
    """, fetch_all=True)
    
    # Get recent deliveries
    deliveries = execute_query("""
        SELECT sd.DELIVERY_NO, s.NAME as SUPPLIER_NAME, sd.STATUS, sd.DELIVERY_DATE
        FROM SUPPLIER_DELIVERY sd
        JOIN SUPPLIER s ON sd.SUPPLIER_ID = s.SUPPLIER_ID
        ORDER BY sd.DELIVERY_DATE DESC
        LIMIT 10
    """, fetch_all=True)
    
    return jsonify({
        "success": True,
        "admin": session['admin'],
        "recent_orders": recent_orders,
        "inventory": inventory,
        "recent_deliveries": deliveries
    })

@app.route('/api/admin/products', methods=['GET'])
def admin_products():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
    
    products = execute_query("""
        SELECT p.PRODUCTID, p.NAME, p.PRICE, p.CATEGORY_NAME, p.NO_OF_PRODUCTS,
               s.NAME as SUPPLIER_NAME, st.NAME as STORE_NAME
        FROM PRODUCT p
        JOIN SUPPLIER s ON p.SUPPLIER_ID = s.SUPPLIER_ID
        JOIN STORE st ON p.STOREID = st.STOREID
        ORDER BY p.CATEGORY_NAME, p.NAME
    """, fetch_all=True)
    
    return jsonify({"success": True, "products": products})

@app.route('/api/admin/products', methods=['POST'])
def admin_add_product():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
        
    data = request.json
    name = data.get('name')
    price = data.get('price')
    category = data.get('category')
    supplier_id = data.get('supplier_id')
    delivery_no = data.get('delivery_no')
    quantity = data.get('quantity', 0)
    store_id = session['admin']['store_id']
    
    product_id = execute_query(
        """INSERT INTO PRODUCT 
           (NAME, PRICE, CATEGORY_NAME, STOREID, SUPPLIER_ID, DELIVERY_NO, NO_OF_PRODUCTS)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        [name, price, category, store_id, supplier_id, delivery_no, quantity],
        commit=True
    )
    
    return jsonify({
        "success": True, 
        "message": "Product added successfully", 
        "product_id": product_id
    })

@app.route('/api/admin/products/<int:product_id>', methods=['PUT'])
def admin_update_product(product_id):
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
        
    data = request.json
    name = data.get('name')
    price = data.get('price')
    quantity = data.get('quantity')
    
    execute_query(
        "UPDATE PRODUCT SET NAME = %s, PRICE = %s, NO_OF_PRODUCTS = %s WHERE PRODUCTID = %s",
        [name, price, quantity, product_id],
        commit=True
    )
    
    return jsonify({"success": True, "message": "Product updated successfully"})

@app.route('/api/admin/orders', methods=['GET'])
def admin_get_orders():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401

    orders = execute_query("""
        SELECT ORDER_ID, ORDER_DATE, ORDER_NUMBER, EMAIL, STATUS
        FROM ORDERS
        ORDER BY ORDER_DATE DESC
    """, fetch_all=True)

    for order in orders:
        order_id = order['ORDER_ID']

        # Calculate amount dynamically
        total = execute_query("""
            SELECT SUM(p.PRICE * oi.QUANTITY) AS total
            FROM ORDER_ITEMS oi
            JOIN PRODUCT p ON oi.PRODUCTID = p.PRODUCTID
            WHERE oi.ORDER_ID = %s
        """, [order_id])
        order['AMOUNT'] = total['total'] if total and total['total'] else 0

        # Attach product list
        products = execute_query("""
            SELECT oi.PRODUCTID, p.NAME, p.PRICE, oi.QUANTITY
            FROM ORDER_ITEMS oi
            JOIN PRODUCT p ON oi.PRODUCTID = p.PRODUCTID
            WHERE oi.ORDER_ID = %s
        """, [order_id], fetch_all=True)
        order['products'] = products

    return jsonify({"success": True, "orders": orders})


@app.route('/api/admin/orders/<int:order_id>', methods=['PUT'])
def admin_update_order(order_id):
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401

    data = request.json
    status = data.get('status')

    # Assign the current employee to the order & update its status
    execute_query("""
        UPDATE ORDERS 
        SET STATUS = %s, EMPLOYEE_ID = %s 
        WHERE ORDER_ID = %s
    """, [status, session['admin']['employee_id'], order_id], commit=True)

    return jsonify({"success": True, "message": "Order updated"})

@app.route('/api/admin/suppliers', methods=['GET'])
def admin_suppliers():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
    
    suppliers = execute_query("SELECT * FROM SUPPLIER", fetch_all=True)
    return jsonify({"success": True, "suppliers": suppliers})

@app.route('/api/admin/deliveries', methods=['GET'])
def admin_deliveries():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
    
    deliveries = execute_query("""
        SELECT sd.DELIVERY_NO, s.NAME as SUPPLIER_NAME, sd.STATUS, sd.DELIVERY_DATE
        FROM SUPPLIER_DELIVERY sd
        JOIN SUPPLIER s ON sd.SUPPLIER_ID = s.SUPPLIER_ID
        ORDER BY sd.DELIVERY_DATE DESC
    """, fetch_all=True)
    
    return jsonify({"success": True, "deliveries": deliveries})

@app.route('/api/admin/deliveries', methods=['POST'])
def admin_add_delivery():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
        
    data = request.json
    supplier_id = data.get('supplier_id')
    status = data.get('status', 'Pending')
    delivery_date = data.get('delivery_date')
    
    delivery_no = execute_query(
        "INSERT INTO SUPPLIER_DELIVERY (SUPPLIER_ID, STATUS, DELIVERY_DATE) VALUES (%s, %s, %s)",
        [supplier_id, status, delivery_date],
        commit=True
    )
    
    # Create inventory record
    inventory_id = execute_query(
        "INSERT INTO INVENTORY (STOCK_LEVEL, LAST_UPDATED) VALUES (0, NOW())",
        commit=True
    )
    
    # Link employee to inventory update
    execute_query(
        "INSERT INTO UPDATES (EMPLOYEE_ID, INVENTORY_ID, SUPPLIER_ID, DELIVERY_NO) VALUES (%s, %s, %s, %s)",
        [session['admin']['employee_id'], inventory_id, supplier_id, delivery_no],
        commit=True
    )
    
    return jsonify({
        "success": True, 
        "message": "Delivery added successfully", 
        "delivery_no": delivery_no
    })

@app.route('/api/admin/deliveries/<int:delivery_no>', methods=['PUT'])
def admin_update_delivery(delivery_no):
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Admin login required"}), 401
        
    data = request.json
    status = data.get('status')
    
    execute_query(
        "UPDATE SUPPLIER_DELIVERY SET STATUS = %s WHERE DELIVERY_NO = %s",
        [status, delivery_no],
        commit=True
    )
    
    # If status is "Delivered", update inventory
    if status == 'Delivered':
        # Find the inventory entry linked to this delivery
        inventory_update = execute_query("""
            SELECT INVENTORY_ID, SUPPLIER_ID FROM UPDATES 
            WHERE DELIVERY_NO = %s
        """, [delivery_no])
        
        if inventory_update:
            # Get products from this delivery
            products = execute_query("""
                SELECT PRODUCTID, NO_OF_PRODUCTS FROM PRODUCT
                WHERE DELIVERY_NO = %s
            """, [delivery_no], fetch_all=True)
            
            # Update inventory stock level
            total_products = sum(p['NO_OF_PRODUCTS'] for p in products) if products else 0
            execute_query(
                "UPDATE INVENTORY SET STOCK_LEVEL = %s, LAST_UPDATED = NOW() WHERE INVENTORY_ID = %s",
                [total_products, inventory_update['INVENTORY_ID']],
                commit=True
            )
    
    return jsonify({"success": True, "message": "Delivery status updated"})

@app.route('/api/admin/employees', methods=['GET'])
def admin_get_employees():
    if 'admin' not in session or session['admin']['role'].lower() != 'manager':
        return jsonify({"success": False, "message": "Admin login required"}), 401

    try:
        employees = execute_query("""
            SELECT e.EMPLOYEE_ID, e.ROLE, e.STOREID, p.SSN, p.NAME, p.PHONE, p.ADDRESS
            FROM EMPLOYEE e
            JOIN PERSON p ON e.SSN = p.SSN
        """, fetch_all=True)

        return jsonify(employees)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/admin/employees', methods=['POST'])
def admin_add_employee():
    if 'admin' not in session or session['admin']['role'].lower() != 'manager':
        return jsonify({"success": False, "message": "Manager role required"}), 403

    data = request.json
    ssn = data.get('SSN')
    role = data.get('ROLE')
    employee_id = data.get('EMPLOYEE_ID')
    store_id = data.get('STOREID')

    # Basic validation (only for required fields)
    if not all([ssn, role, employee_id, store_id]):
        return jsonify({"success": False, "message": "Missing required employee fields"}), 400

    # Optional fields
    password = "password"
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()

    connection = None
    cursor = None
    try:
        connection = cnxpool.get_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()

        # Check if the SSN exists in PERSON table first
        cursor.execute("SELECT SSN FROM PERSON WHERE SSN = %s", [ssn])
        existing_person = cursor.fetchone()
        if not existing_person:
            connection.rollback()
            return jsonify({"success": False, "message": f"SSN {ssn} does not exist in PERSON table. Please add person first."}), 400

        # Now insert into EMPLOYEE only
        cursor.execute(
            "INSERT INTO EMPLOYEE (EMPLOYEE_ID, SSN, ROLE, STOREID, PASSWORD_HASH) VALUES (%s, %s, %s, %s, %s)",
            [employee_id, ssn, role, store_id, password_hash]
        )

        connection.commit()
        return jsonify({"success": True, "message": "Employee added successfully (linked to existing person). Default password is 'password'."})

    except mysql.connector.Error as err:
        if connection: connection.rollback()
        if err.errno == 1062:
            if 'EMPLOYEE_ID' in err.msg:
                return jsonify({"success": False, "message": f"Employee ID {employee_id} already exists."}), 409
        print(f"MySQL error: {err}")
        return jsonify({"success": False, "message": f"MySQL error: {err.msg}"}), 500
    except Exception as e:
        if connection: connection.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({"success": False, "message": f"Unexpected error: {str(e)}"}), 500
    finally:
        if cursor: cursor.close()
        if connection: connection.close()


@app.route('/api/admin/employees/<int:employee_id>', methods=['DELETE'])
def admin_remove_employee(employee_id):
    if 'admin' not in session or session['admin']['role'].lower() != 'manager':
        return jsonify({"success": False, "message": "Manager role required"}), 403

    connection = None
    cursor = None
    try:
        connection = cnxpool.get_connection()
        cursor = connection.cursor(dictionary=True)
        connection.start_transaction()

        # Step 1: Get SSN of the employee
        cursor.execute("SELECT SSN FROM EMPLOYEE WHERE EMPLOYEE_ID = %s", [employee_id])
        employee = cursor.fetchone()
        if not employee:
            connection.rollback()
            return jsonify({"success": False, "message": "Employee not found"}), 404

        ssn = employee['SSN']

        # Step 2: Nullify foreign keys that reference EMPLOYEE_ID (if nullable)
        cursor.execute("UPDATE ORDERS SET EMPLOYEE_ID = NULL WHERE EMPLOYEE_ID = %s", [employee_id])
        cursor.execute("UPDATE UPDATES SET EMPLOYEE_ID = NULL WHERE EMPLOYEE_ID = %s", [employee_id])

        # Step 3: Delete from EMPLOYEE
        cursor.execute("DELETE FROM EMPLOYEE WHERE EMPLOYEE_ID = %s", [employee_id])
        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({"success": False, "message": "Failed to delete employee"}), 500

        # Step 4: Check if SSN is used in CUSTOMER
        cursor.execute("SELECT 1 FROM CUSTOMER WHERE SSN = %s", [ssn])
        customer_exists = cursor.fetchone()

        if not customer_exists:
            # Only delete PERSON if not used in CUSTOMER
            cursor.execute("DELETE FROM PERSON WHERE SSN = %s", [ssn])
            if cursor.rowcount == 0:
                print(f"Warning: PERSON with SSN {ssn} not deleted")

        connection.commit()
        return jsonify({"success": True, "message": "Employee deleted successfully"})

    except mysql.connector.Error as err:
        if connection: connection.rollback()
        print(f"Database error: {err}")
        return jsonify({"success": False, "message": f"MySQL error: {err.msg}"}), 500
    except Exception as e:
        if connection: connection.rollback()
        print(f"Unexpected error: {e}")
        return jsonify({"success": False, "message": f"Unexpected error: {str(e)}"}), 500
    finally:
        if cursor: cursor.close()
        if connection: connection.close()


@app.route('/api/admin/change-password', methods=['POST'])
def admin_change_password():
    if 'admin' not in session:
        return jsonify({"success": False, "message": "Login required"}), 401

    data = request.json
    current_pw = data.get('current_password')
    new_pw = data.get('new_password')

    employee_id = session['admin']['employee_id']
    
    # Get current hash
    employee = execute_query("SELECT PASSWORD_HASH FROM EMPLOYEE WHERE EMPLOYEE_ID = %s", [employee_id])

    current_hash = hashlib.sha256(current_pw.encode('utf-8')).hexdigest()
    if not employee or employee['PASSWORD_HASH'] != current_hash:
        return jsonify({"success": False, "message": "Current password is incorrect"}), 403

    new_hash = hashlib.sha256(new_pw.encode('utf-8')).hexdigest()
    execute_query("UPDATE EMPLOYEE SET PASSWORD_HASH = %s WHERE EMPLOYEE_ID = %s", [new_hash, employee_id], commit=True)

    return jsonify({"success": True, "message": "Password updated successfully"})



@app.route('/api/health', methods=['GET'])
def health_check():
    try:
        # Test database connection
        query = "SELECT 1"
        execute_query(query)  # If this fails, the database is not connected
        return jsonify({"success": True, "message": "Database is connected"})
    except Exception as e:
        return jsonify({"success": False, "message": f"Database connection failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
