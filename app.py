import os
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import datetime # Needed for order dates etc.

app = Flask(__name__)
CORS(app, supports_credentials=True) # Enable CORS for all routes, allow credentials for sessions

# Secret key for session management
# In a production environment, use a strong, randomly generated key stored securely
app.config['SECRET_KEY'] = os.urandom(24) # Generates a random key each time the app starts

# MySQL configurations
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'qwerty'
app.config['MYSQL_DB'] = 'Computer_Hardware_Store'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor' # Return results as dictionaries

mysql = MySQL(app)

@app.route('/')
def index():
    # Check if user is logged in
    if 'email' in session:
        return f"Flask backend is running! Logged in as: {session['email']}"
    return "Flask backend is running! Not logged in."

# --- User Authentication ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    ssn = data.get('ssn') # Assuming SSN is provided during registration for PERSON table
    name = data.get('name')
    phone = data.get('phone')
    address = data.get('address')
    email = data.get('email')
    password = data.get('password')

    if not all([ssn, name, address, email, password]):
        return jsonify({"error": "Missing required fields (SSN, Name, Address, Email, Password)"}), 400

    hashed_password = generate_password_hash(password)

    try:
        cur = mysql.connection.cursor()

        # Check if SSN or Email already exists
        cur.execute("SELECT SSN FROM PERSON WHERE SSN = %s", (ssn,))
        if cur.fetchone():
            cur.close()
            return jsonify({"error": "SSN already registered"}), 409 # Conflict
        cur.execute("SELECT EMAIL FROM CUSTOMER WHERE EMAIL = %s", (email,))
        if cur.fetchone():
            cur.close()
            return jsonify({"error": "Email already registered"}), 409 # Conflict

        # Insert into PERSON (assuming password is not stored here, but linked via CUSTOMER)
        cur.execute("INSERT INTO PERSON (SSN, NAME, PHONE, ADDRESS) VALUES (%s, %s, %s, %s)",
                    (ssn, name, phone, address))

        # Insert into CUSTOMER (Store hashed password here - NOTE: Schema doesn't have password field, adding conceptually)
        # !!! IMPORTANT: The current CUSTOMER table schema lacks a password field.
        # For this example, I'll proceed as if it existed. You MUST add a password column (e.g., VARCHAR(255)) to the CUSTOMER table.
        # Example ALTER statement: ALTER TABLE CUSTOMER ADD COLUMN password_hash VARCHAR(255) NOT NULL;
        # Assuming 'password_hash' column exists:
        # cur.execute("INSERT INTO CUSTOMER (EMAIL, SSN, password_hash) VALUES (%s, %s, %s)",
        #             (email, ssn, hashed_password))
        # If no password column, insert without it (LOGIN WILL NOT WORK):
        cur.execute("INSERT INTO CUSTOMER (EMAIL, SSN) VALUES (%s, %s)", (email, ssn))


        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Registration successful. Please add a 'password_hash' column to CUSTOMER table for login."}), 201

    except Exception as e:
        mysql.connection.rollback() # Rollback in case of error
        cur.close()
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    try:
        cur = mysql.connection.cursor()
        # !!! IMPORTANT: Adjust this query based on where the password hash is stored.
        # Assuming it's added to CUSTOMER table as 'password_hash':
        # cur.execute("SELECT C.EMAIL, C.SSN, P.NAME, C.password_hash FROM CUSTOMER C JOIN PERSON P ON C.SSN = P.SSN WHERE C.EMAIL = %s", (email,))

        # If password hash is NOT stored, login cannot be securely verified.
        # This query just checks if the email exists:
        cur.execute("SELECT EMAIL, SSN FROM CUSTOMER WHERE EMAIL = %s", (email,))
        user = cur.fetchone()
        cur.close()

        # --- Password Verification (Requires 'password_hash' column) ---
        # if user and check_password_hash(user['password_hash'], password):
        #     session['email'] = user['EMAIL']
        #     session['ssn'] = user['SSN']
        #     session['name'] = user['NAME'] # Store name from PERSON if needed
        #     return jsonify({"message": "Login successful", "email": user['EMAIL']}), 200
        # else:
        #     return jsonify({"error": "Invalid credentials"}), 401
        # --- End Password Verification ---

        # --- Placeholder Login (If no password hash column) ---
        if user:
             session['email'] = user['EMAIL']
             session['ssn'] = user['SSN']
             # Cannot fetch name without JOIN and password hash column doesn't exist for proper query yet
             return jsonify({"message": "Login successful (Placeholder - No Password Check)", "email": user['EMAIL']}), 200
        else:
             return jsonify({"error": "Invalid credentials (Placeholder)"}), 401
        # --- End Placeholder Login ---


    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('email', None)
    session.pop('ssn', None)
    session.pop('name', None)
    session.pop('cart', None) # Clear cart on logout
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/session', methods=['GET'])
def get_session():
    if 'email' in session:
        return jsonify({
            "logged_in": True,
            "email": session.get('email'),
            "ssn": session.get('ssn'),
            "name": session.get('name')
        }), 200
    else:
        return jsonify({"logged_in": False}), 200


# --- Product Endpoints ---

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        cur = mysql.connection.cursor()
        # Fetch relevant details for product listing
        cur.execute("""
            SELECT p.PRODUCTID, p.NAME, p.PRICE, p.NO_OF_PRODUCTS, c.CATEGORY_NAME
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.CATEGORY_NAME = c.CATEGORY_NAME
        """)
        products = cur.fetchall()
        cur.close()
        return jsonify(products)
    except Exception as e:
        cur.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_details(product_id):
    try:
        cur = mysql.connection.cursor()
        # Fetch more details for a single product page
        cur.execute("""
            SELECT p.PRODUCTID, p.NAME, p.PRICE, p.NO_OF_PRODUCTS, c.CATEGORY_NAME, c.GENERATION
            FROM PRODUCT p
            LEFT JOIN CATEGORY c ON p.CATEGORY_NAME = c.CATEGORY_NAME
            WHERE p.PRODUCTID = %s
        """, (product_id,))
        product = cur.fetchone()
        cur.close()
        if product:
            return jsonify(product)
        else:
            return jsonify({"error": "Product not found"}), 404
    except Exception as e:
        cur.close()
        return jsonify({"error": str(e)}), 500


# --- Cart Endpoints ---

@app.route('/api/cart', methods=['GET', 'POST'])
def handle_cart():
    # Initialize cart in session if it doesn't exist
    if 'cart' not in session:
        session['cart'] = {} # {product_id: quantity}

    if request.method == 'POST':
        # Add item to cart
        data = request.get_json()
        product_id = str(data.get('product_id')) # Use string keys for JSON compatibility
        quantity = int(data.get('quantity', 1))

        if not product_id or quantity <= 0:
            return jsonify({"error": "Invalid product ID or quantity"}), 400

        # Check product stock (optional but recommended)
        # try:
        #     cur = mysql.connection.cursor()
        #     cur.execute("SELECT NO_OF_PRODUCTS FROM PRODUCT WHERE PRODUCTID = %s", (product_id,))
        #     product = cur.fetchone()
        #     cur.close()
        #     if not product or product['NO_OF_PRODUCTS'] < quantity:
        #         return jsonify({"error": "Insufficient stock or product not found"}), 400
        # except Exception as e:
        #     return jsonify({"error": f"Database error checking stock: {str(e)}"}), 500

        # Add/Update item in cart
        current_quantity = session['cart'].get(product_id, 0)
        session['cart'][product_id] = current_quantity + quantity
        session.modified = True # Mark session as modified
        return jsonify({"message": "Item added to cart", "cart": session['cart']}), 200

    elif request.method == 'GET':
        # Get cart contents with product details
        cart_items = []
        total_price = 0
        if session['cart']:
            product_ids = list(session['cart'].keys())
            # Create placeholders for the query
            placeholders = ','.join(['%s'] * len(product_ids))
            try:
                cur = mysql.connection.cursor()
                cur.execute(f"SELECT PRODUCTID, NAME, PRICE FROM PRODUCT WHERE PRODUCTID IN ({placeholders})", product_ids)
                products = {str(p['PRODUCTID']): p for p in cur.fetchall()} # Map by ID for easy lookup
                cur.close()

                for product_id, quantity in session['cart'].items():
                    product_details = products.get(product_id)
                    if product_details:
                        item_total = product_details['PRICE'] * quantity
                        cart_items.append({
                            "product_id": product_id,
                            "name": product_details['NAME'],
                            "price": product_details['PRICE'],
                            "quantity": quantity,
                            "item_total": item_total
                        })
                        total_price += item_total
                    else:
                        # Product might have been removed from DB, remove from cart?
                        # Or just skip displaying it. Let's skip for now.
                        pass

            except Exception as e:
                 return jsonify({"error": f"Database error fetching cart details: {str(e)}"}), 500

        return jsonify({"items": cart_items, "total_price": total_price})


@app.route('/api/cart/update', methods=['POST'])
def update_cart_item():
    if 'cart' not in session:
        session['cart'] = {}

    data = request.get_json()
    product_id = str(data.get('product_id'))
    quantity = int(data.get('quantity'))

    if not product_id or quantity < 0: # Allow 0 quantity to remove item
         return jsonify({"error": "Invalid product ID or quantity"}), 400

    if product_id in session['cart']:
        if quantity == 0:
            del session['cart'][product_id]
        else:
            # Optional: Check stock before updating
            session['cart'][product_id] = quantity
        session.modified = True
        return jsonify({"message": "Cart updated", "cart": session['cart']}), 200
    else:
        return jsonify({"error": "Product not found in cart"}), 404


@app.route('/api/cart/remove', methods=['POST'])
def remove_cart_item():
    if 'cart' not in session:
        session['cart'] = {}

    data = request.get_json()
    product_id = str(data.get('product_id'))

    if not product_id:
        return jsonify({"error": "Product ID required"}), 400

    if product_id in session['cart']:
        del session['cart'][product_id]
        session.modified = True
        return jsonify({"message": "Item removed from cart", "cart": session['cart']}), 200
    else:
        return jsonify({"error": "Product not found in cart"}), 404


# --- Checkout & Order Endpoints ---

@app.route('/api/checkout', methods=['POST'])
def checkout():
    if 'email' not in session:
        return jsonify({"error": "User not logged in"}), 401

    if 'cart' not in session or not session['cart']:
        return jsonify({"error": "Cart is empty"}), 400

    data = request.get_json()
    payment_type = data.get('payment_type', 'Unknown') # Get payment type from request

    cart = session['cart']
    product_ids = list(cart.keys())
    placeholders = ','.join(['%s'] * len(product_ids))
    total_amount = 0
    products_in_cart_details = {}

    cur = None # Initialize cursor variable
    try:
        cur = mysql.connection.cursor()

        # 1. Get product details and calculate total amount from DB
        cur.execute(f"SELECT PRODUCTID, NAME, PRICE, NO_OF_PRODUCTS FROM PRODUCT WHERE PRODUCTID IN ({placeholders})", product_ids)
        db_products = cur.fetchall()

        if len(db_products) != len(product_ids):
             # Handle case where some products in cart might not exist in DB anymore
             missing_ids = set(product_ids) - set(str(p['PRODUCTID']) for p in db_products)
             cur.close()
             return jsonify({"error": f"Products not found: {', '.join(missing_ids)}"}), 404

        for p in db_products:
            product_id_str = str(p['PRODUCTID'])
            quantity_in_cart = cart[product_id_str]
            if p['NO_OF_PRODUCTS'] < quantity_in_cart:
                cur.close()
                return jsonify({"error": f"Insufficient stock for {p['NAME']} (Available: {p['NO_OF_PRODUCTS']}, Requested: {quantity_in_cart})"}), 400
            products_in_cart_details[product_id_str] = p
            total_amount += p['PRICE'] * quantity_in_cart

        # --- Start Transaction ---
        # 2. Create ORDER record
        order_date = datetime.date.today()
        customer_email = session['email']
        # Assuming EMPLOYEE_ID is optional or handled differently
        cur.execute("INSERT INTO ORDERS (ORDER_DATE, EMAIL) VALUES (%s, %s)", (order_date, customer_email))
        new_order_id = cur.lastrowid # Get the ID of the newly inserted order

        # 3. Create PAYMENT record
        payment_date = datetime.date.today()
        cur.execute("INSERT INTO PAYMENT (PAYMENT_TYPE, AMOUNT, DATE) VALUES (%s, %s, %s)",
                    (payment_type, total_amount, payment_date))
        new_payment_no = cur.lastrowid

        # 4. Create MAKES_PAYMENT record (linking order, payment, customer)
        cur.execute("INSERT INTO MAKES_PAYMENT (PAYMENT_NO, ORDER_ID, EMAIL) VALUES (%s, %s, %s)",
                    (new_payment_no, new_order_id, customer_email))

        # 5. Update PRODUCT records (Decrease stock and assign ORDER_ID_CONTAINS)
        #    !!! This part is problematic due to the schema design !!!
        #    It assumes PRODUCTID is globally unique and assigns the order to that one row.
        #    It doesn't handle multiple rows for the same conceptual product well.
        for product_id_str, quantity in cart.items():
            product_id_int = int(product_id_str)
            # Decrease stock and set order ID for the specific product row fetched earlier
            cur.execute("""
                UPDATE PRODUCT
                SET NO_OF_PRODUCTS = NO_OF_PRODUCTS - %s,
                    ORDER_ID_CONTAINS = %s
                WHERE PRODUCTID = %s
            """, (quantity, new_order_id, product_id_int))
            # Check if update affected rows? Optional.

        # --- Commit Transaction ---
        mysql.connection.commit()
        cur.close()

        # 6. Clear the cart from session
        session.pop('cart', None)

        # 7. Return order confirmation
        return jsonify({"message": "Checkout successful", "order_id": new_order_id}), 200

    except Exception as e:
        if cur: # Ensure cursor is closed even on error
             cur.close()
        mysql.connection.rollback() # Rollback transaction on any error
        # Log the error e for debugging
        print(f"Checkout error: {e}")
        return jsonify({"error": f"An error occurred during checkout: {str(e)}"}), 500


@app.route('/api/orders', methods=['GET'])
def get_orders():
    if 'email' not in session:
        return jsonify({"error": "User not logged in"}), 401

    customer_email = session['email']
    orders_summary = []

    try:
        cur = mysql.connection.cursor()
        # Get basic order info linked to the customer
        cur.execute("""
            SELECT o.ORDER_ID, o.ORDER_DATE, p.AMOUNT, p.PAYMENT_TYPE
            FROM ORDERS o
            JOIN MAKES_PAYMENT mp ON o.ORDER_ID = mp.ORDER_ID
            JOIN PAYMENT p ON mp.PAYMENT_NO = p.PAYMENT_NO
            WHERE o.EMAIL = %s
            ORDER BY o.ORDER_DATE DESC
        """, (customer_email,))
        orders = cur.fetchall()
        cur.close()
        return jsonify(orders)

    except Exception as e:
        if cur: cur.close()
        return jsonify({"error": f"Database error fetching orders: {str(e)}"}), 500


@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order_details(order_id):
    if 'email' not in session:
        return jsonify({"error": "User not logged in"}), 401

    customer_email = session['email']

    try:
        cur = mysql.connection.cursor()

        # Verify the order belongs to the logged-in user
        cur.execute("SELECT ORDER_ID, ORDER_DATE, EMAIL FROM ORDERS WHERE ORDER_ID = %s AND EMAIL = %s", (order_id, customer_email))
        order_info = cur.fetchone()

        if not order_info:
            cur.close()
            return jsonify({"error": "Order not found or access denied"}), 404

        # Get products associated with this order via PRODUCT.ORDER_ID_CONTAINS
        # This will only fetch products where ORDER_ID_CONTAINS was set to this order_id during checkout.
        # It doesn't represent quantity well if multiple of the same item were ordered.
        cur.execute("""
            SELECT p.PRODUCTID, p.NAME, p.PRICE
            FROM PRODUCT p
            WHERE p.ORDER_ID_CONTAINS = %s
        """, (order_id,))
        products_in_order = cur.fetchall()

        # Get payment details for the order
        cur.execute("""
            SELECT p.PAYMENT_NO, p.PAYMENT_TYPE, p.AMOUNT, p.DATE
            FROM PAYMENT p
            JOIN MAKES_PAYMENT mp ON p.PAYMENT_NO = mp.PAYMENT_NO
            WHERE mp.ORDER_ID = %s AND mp.EMAIL = %s
        """,(order_id, customer_email))
        payment_info = cur.fetchone()

        cur.close()

        return jsonify({
            "order_info": order_info,
            "items": products_in_order, # Note: Quantity is missing due to schema limitation
            "payment_info": payment_info
        })

    except Exception as e:
        if cur: cur.close()
        return jsonify({"error": f"Database error fetching order details: {str(e)}"}), 500


# --- Admin Endpoints (Placeholders) ---
# Add similar endpoints for admin login, product management, order management etc.


if __name__ == '__main__':
    # Make sure your MySQL server is running before starting the Flask app
    # You might need to load the Computer_Hardware_Store.sql data into your MySQL server first
    # Example command: mysql -u root -p qwerty Computer_Hardware_Store < Computer_Hardware_Store.sql
    # !!! REMEMBER TO ADD 'password_hash' COLUMN TO CUSTOMER TABLE !!!
    # Example: ALTER TABLE CUSTOMER ADD COLUMN password_hash VARCHAR(255);
    app.run(debug=True, port=5000) # Runs on http://localhost:5000
