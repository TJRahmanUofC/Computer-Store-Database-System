# Computer Hardware Store E-commerce Platform

This project is a web-based e-commerce platform simulating a computer hardware store. It features separate interfaces for customers and administrators, built using Flask and MySQL.

## Overview

The platform allows customers to browse products, add items to a cart, place orders, and manage their profiles. Administrators have access to a dashboard for managing products, orders, suppliers, deliveries, and employees.

## Features

**Customer Facing:**

*   User registration and login
*   Browse products by category
*   View product details
*   Add/update/remove items from the shopping cart
*   Checkout process
*   View order history
*   Manage user profile (view details, change password)

**Admin Facing:**

*   Admin login
*   Dashboard with summaries (recent orders, inventory, deliveries)
*   Product management (add, update, view, delete)
*   Order management (view orders, update status)
*   Supplier management (view suppliers)
*   Delivery management (add, update status, view deliveries)
*   Employee management (add, remove, view employees - Manager role only)
*   Admin profile management (view details, change password)

## Technology Stack

*   **Backend:** Python 3.x, Flask
*   **Database:** MySQL
*   **Frontend:** HTML, CSS, JavaScript
*   **Libraries:**
    *   Flask-CORS (for Cross-Origin Resource Sharing)
    *   mysql-connector-python (for MySQL database interaction)
    *   python-dotenv (for environment variable management)

## Project Structure

```
.
├── admin/              # Admin HTML templates
├── assets/             # Static files (CSS, JS, images)
│   ├── css/
│   ├── images/
│   ├── js/
│   └── static/         # Product images
├── customer/           # Customer HTML templates
├── .env.example        # Example environment file (create .env from this)
├── .gitignore          # Git ignore file
├── app.py              # Main Flask application file
├── Computer_Hardware_Store.sql # Database schema and initial data
├── index.html          # Main entry point (customer landing page)
├── README.md           # This file
├── requirement.txt     # Python dependencies
└── USER_MANUAL.md      # User manual (if applicable)
```

## Setup and Installation

1.  **Prerequisites:**
    *   Python 3.x installed
    *   MySQL Server installed and running

2.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd Computer-Store-Database-System
    ```

3.  **Create a Virtual Environment (Recommended):**
    ```bash
    python -m venv venv
    # Activate the virtual environment
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```

4.  **Install Dependencies:**
    ```bash
    pip install -r requirement.txt
    ```

5.  **Database Setup:**
    *   Connect to your MySQL server.
    *   Create a database for the project (e.g., `Computer_Hardware_Store`).
        ```sql
        CREATE DATABASE Computer_Hardware_Store;
        ```
    *   Use the created database.
        ```sql
        USE Computer_Hardware_Store;
        ```
    *   Execute the `Computer_Hardware_Store.sql` script to create tables and potentially insert initial data. You might need to use a MySQL client or command line:
        ```bash
        mysql -u <your_mysql_user> -p Computer_Hardware_Store < Computer_Hardware_Store.sql
        ```
        (Enter your MySQL password when prompted)

6.  **Environment Variables:**
    *   Create a `.env` file in the project root directory (you can copy `.env.example` if it exists).
    *   Add your database connection details to the `.env` file:
        ```dotenv
        MYSQL_HOST=localhost
        MYSQL_USER=<your_mysql_user>
        MYSQL_PASSWORD=<your_mysql_password>
        MYSQL_DB=Computer_Hardware_Store
        ```

7.  **Run the Application:**
    ```bash
    python app.py
    ```
    The application will typically start on `http://127.0.0.1:5000/`.

## Usage

*   **Customer Interface:** Access the application by navigating to `http://127.0.0.1:5000/`.
*   **Admin Interface:** Access the admin login page at `http://127.0.0.1:5000/admin/admin_login.html`.
    *   Admin users are created via the `EMPLOYEE` table in the database.
    *   Newly added employees via the admin interface (by a Manager) have a default password of `password`.

## Database

The database schema is defined in the `Computer_Hardware_Store.sql` file. It includes tables for customers, employees, products, orders, payments, suppliers, stores, and their relationships.

---

*This README provides a general guide. Specific configurations might vary based on your environment.*
