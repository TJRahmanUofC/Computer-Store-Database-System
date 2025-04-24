# Computer Store Database System - User Manual

## Table of Contents

1.  [Introduction](#introduction)
2.  [Installation and Setup](#installation-and-setup)
    *   [Prerequisites](#prerequisites)
    *   [Setup Steps](#setup-steps)
    *   [Running the Application](#running-the-application)
    *   [Stopping the Application](#stopping-the-application)
3.  [Customer Guide](#customer-guide)
    *   [Accessing the Store](#accessing-the-store)
    *   [Registration](#registration)
    *   [Login](#login)
    *   [Browsing Products](#browsing-products)
    *   [Viewing Product Details](#viewing-product-details)
    *   [Managing the Shopping Cart](#managing-the-shopping-cart)
    *   [Checkout Process](#checkout-process)
    *   [Viewing Order History](#viewing-order-history)
    *   [Managing Your Profile](#managing-your-profile)
    *   [Logout](#logout)
4.  [Admin Guide](#admin-guide)
    *   [Accessing the Admin Panel](#accessing-the-admin-panel)
    *   [Admin Login](#admin-login)
    *   [Admin Dashboard](#admin-dashboard)
    *   [Product Management](#product-management)
    *   [Order Management](#order-management)
    *   [Supplier Management](#supplier-management)
    *   [Employee Management (Manager Role Only)](#employee-management-manager-role-only)
    *   [Managing Admin Profile](#managing-admin-profile)
    *   [Admin Logout](#admin-logout)

---

## 1. Introduction

Welcome to the Computer Store Database System! This application provides a web interface for customers to browse computer hardware products, manage their shopping cart, place orders, and view their order history. It also includes an administrative backend for managing products, orders, suppliers, deliveries, and employees.

This manual guides you through the installation process and explains how to use the various features available to both customers and administrators.

---

## 2. Installation and Setup

This section details the steps required to set up and run the application locally.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

1.  **Python 3**: Download and install Python 3 from [python.org](https://www.python.org/). Verify the installation by running `python --version` or `python3 --version` in your terminal.
2.  **pip**: Python's package installer. It usually comes with Python 3. Verify by running `pip --version` or `pip3 --version`.
3.  **MySQL Server**: Download and install MySQL Community Server from [dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/). During installation, remember the root password you set.
4.  **Git**: (Optional, but recommended for cloning) Download and install Git from [git-scm.com](https://git-scm.com/).

### Setup Steps

1.  **Get the Code:**
    *   If you have a Git repository URL:
        ```bash
        git clone <repository_url>
        cd Computer-Store-Database-System
        ```
        *(Replace `<repository_url>` with the actual URL)*
    *   If you have a ZIP file, extract it and navigate into the `Computer-Store-Database-System` directory in your terminal.

2.  **Create and Activate a Virtual Environment:**
    It's highly recommended to use a virtual environment.
    *   **Windows (cmd/powershell):**
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *   **macOS/Linux (bash/zsh):**
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    Your terminal prompt should now start with `(venv)`.

3.  **Install Python Dependencies:**
    ```bash
    pip install -r requirement.txt
    ```

4.  **Set up the MySQL Database:**
    *   Log in to your MySQL server (e.g., using the command line):
        ```bash
        mysql -u root -p
        ```
        Enter your MySQL root password.
    *   Create the database:
        ```sql
        CREATE DATABASE Computer_Hardware_Store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        ```
    *   (Optional but Recommended) Create a dedicated user:
        ```sql
        -- Replace 'your_db_user' and 'your_db_password'
        CREATE USER 'your_db_user'@'localhost' IDENTIFIED BY 'your_db_password';
        GRANT ALL PRIVILEGES ON Computer_Hardware_Store.* TO 'your_db_user'@'localhost';
        FLUSH PRIVILEGES;
        EXIT;
        ```
    *   Import the database schema and data. Make sure you are in the project's root directory (`Computer-Store-Database-System`) in your terminal:
        ```bash
        # Use 'root' or 'your_db_user' depending on your setup
        mysql -u root -p Computer_Hardware_Store < Computer_Hardware_Store.sql
        # OR
        # mysql -u your_db_user -p Computer_Hardware_Store < Computer_Hardware_Store.sql
        ```
        Enter the appropriate password when prompted.

5.  **Create `.env` Configuration File:**
    In the project's root directory (`Computer-Store-Database-System`), create a file named `.env` and add the following lines, replacing the placeholders with your actual MySQL details:
    ```env
    MYSQL_HOST=localhost
    MYSQL_USER=your_db_user  # Or 'root'
    MYSQL_PASSWORD=your_db_password # Your MySQL user's password
    MYSQL_DB=Computer_Hardware_Store
    ```

### Running the Application

1.  Ensure your virtual environment is activated (`(venv)` should be visible in the prompt).
2.  Make sure you are in the project's root directory.
3.  Run the Flask application:
    *   **Windows:** `python app.py`
    *   **macOS/Linux:** `python3 app.py`
4.  The terminal will show output like:
    ```
     * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
     ...
    ```
5.  **Access the Application:** Open your web browser and go to the URL provided, usually `http://127.0.0.1:5000/` or `http://localhost:5000/`.

### Stopping the Application

Press `CTRL+C` in the terminal where the application is running. To deactivate the virtual environment later, simply type `deactivate`.

---

## 3. Customer Guide

This section explains how customers can interact with the online store.

### Accessing the Store

Open your web browser and navigate to the application's URL (e.g., `http://localhost:5000/`). You will land on the homepage (`index.html`).

### Registration

1.  Click the "Register" link, usually found in the navigation bar. This will take you to the registration page.
2.  Fill in the required fields: Name, Email, Password, Address, and optionally Phone.
3.  Click the "Register" button.
4.  If successful, you'll receive a confirmation message. If the email is already in use or another error occurs, an error message will be displayed.

### Login

1.  Click the "Login" link in the navigation bar to go to the login page
2.  Enter your registered Email and Password.
3.  Click the "Login" button.
4.  Upon successful login, you will typically be redirected to the homepage or your profile, and the navigation bar will update to show you are logged in (e.g., displaying your name and a logout option).

### Browsing Products

*   **Homepage (`index.html`):** Displays featured products or categories.
*   **Product Listing (`customer/product-listing.html`):**
    *   Accessible via a "Products" or "Shop" link.
    *   Shows a list of available products.
    *   You can filter products by category using a dropdown.
    *   You can search for products as well in the search bar.
    *   Each product listing typically shows an image, name, price, and an "Add to Cart" button.

### Viewing Product Details

*   Click on a product's name or image from the listing page.
*   This takes you to the product detail page.
*   Here you can see more details about the product, including description (if available), price, stock status, category, and potentially related products.
*   You can usually add the product to your cart from this page as well, often specifying a quantity.

### Managing the Shopping Cart

1.  **Adding Items:** Click the "Add to Cart" button on product listing or detail pages. You need to be logged in.
2.  **Viewing Cart:** Click the "Cart" icon or link (usually in the navigation bar, often showing the number of items). This takes you to the cart page.
3.  **Cart Page:**
    *   Displays all items currently in your cart.
    *   Shows the name, price, quantity, and subtotal for each item.
    *   Allows you to update the quantity of items (enter a new number and click an "Update" button or similar).
    *   Allows you to remove items from the cart (click a "Remove" or "Delete" button).
    *   Displays the total price for all items in the cart.
    *   Provides a button to proceed to checkout.

### Checkout Process

1.  From the cart page, click the "Proceed to Checkout" button. This takes you to the checkout page.
2.  **Review Order:** The page will display a summary of the items being purchased and the total amount.
3.  **Shipping Information:** Enter information.
4.  **Payment Information:** Select a payment method (e.g., Credit Card, Debit Card). Enter necessary payment details.
5.  **Place Order:** Click the "Place Order" button.
6.  **Order Confirmation:** If the order is successful (items are in stock, payment details are valid), you will be redirected to an order confirmation page displaying your order is confirmed. Your cart will be emptied. If there's an issue (e.g., insufficient stock), an error message will be shown.

### Viewing Order History

1.  Ensure you are logged in.
2.  Click on your profile name or an "Order History" link in the navigation or profile section. This takes you to the order history page.
3.  This page lists all your past orders, showing the Order Number, Date, Total Amount, and Status.

### Managing Your Profile

1.  Ensure you are logged in.
2.  Access your profile page  via a link in the navigation bar (often under your name).
3.  **View Details:** Displays your registered information (Name, Email, Phone, Address).
4.  **Change Password:** There should be a section or button to change your password. You will typically need to enter your current password and the new password twice.

### Logout

*   Click the "Logout" link, usually found in the navigation bar when you are logged in.
*   This will clear your session, and you will be logged out of the customer account.

---

## 4. Admin Guide

This section explains how administrators (employees) can manage the store via the admin panel. Access levels vary based on role. All employees have access to Order Management, Product Management and Employee Management. Only Manager will have additional access to Employee Management.

### Accessing the Admin Panel

Navigate to the admin login page with the button in the homepage footer.

### Admin Login

1.  Enter your assigned Employee ID and Password.
2.  Click the "Login" button.
3.  Upon successful login, you will be redirected to the Admin Dashboard.
(Note: Employee ID and Password will be assigned to each employee. For Testing:
    1. Manager:
    Employee ID: 1000 
    Password: manager1000

    2. Supervisor
    Employee ID: 2000
    Password: emp2000  
)

### Admin Dashboard

*   The central hub for administrators
*   Gives employees access links to different workflow.

### Product Management

*   Accessible via a "Product Management" link. Main work is to maintain the stock level of the products.
*   **View Products:** Lists all products by category.
*   **Update Product:**
    *   Allows increase and decrease of stocks.
*   **Delete Product:**
    *   Allows removing products from the store. Click a "Delete" button next to a product.

### Order Management

*   Accessible via an "Orders" or "Order Management" link (`admin/order_management.html`).
*   **View Orders:** Lists all customer orders with details like Order ID, Date, Customer Email, Total Amount, and Status.
*   **Update Order Status:**
    *   Allows changing the status of an order (e.g., from 'Pending' to 'Shipped', 'Delivered', 'Cancelled').
    *   Select a new status from a dropdown and click an "Update" button. The system records which employee updated the order.

### Supplier Management

*   Accessible via a "Suppliers" or "Supplier Management" link.
*   **View Deliveries:** Lists incoming deliveries from suppliers, showing Delivery Number, Supplier Name, Status (e.g., 'Pending', 'Shipped', 'Delivered'), and Date.
*   **Update Delivery Status:** Allows changing the status of a delivery. When marked as 'Delivered', the system may automatically update the stock levels of products associated with that delivery (if products were added linked to this delivery number).

### Employee Management (Manager Role Only)

*   Accessible via an "Employees" or "Employee Management" link. Requires the logged-in admin to have the 'Manager' role.
*   **View Employees:** Lists all employees with their ID, Name and Role.
*   **Add Employee:**
    *   Allows adding new employees. Requires linking to an existing person record (identified by SSN) in the `PERSON` table.
    *   Assigns Employee ID, Role, Store ID, and sets a default password (e.g., 'password'). The person (Name, Phone, Address) must be added separately or exist beforehand.
*   **Remove Employee:** Allows deleting employee records. 

### Managing Admin Profile

*   Accessible via a "Profile" link.
*   **View Details:** Shows the logged-in employee's information (ID, Name, Role, Store ID).
*   **Change Password:** Allows the admin to change their own login password. Requires entering the current password and the new password twice.

### Admin Logout

*   Click the "Logout" link, usually found in the admin panel's navigation.
*   This clears the admin session, logging the employee out.

---

