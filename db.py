import sqlite3
from datetime import datetime

database_name = "Computer Store"

def create_PERSON_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PERSON(
                   SSN INTEGER PRIMARY KEY,
                   NAME VARCHAR(255),
                   PHONE INTEGER UNIQUE,
                   ADDRESS VARCHAR(255)
                   )
    ''')
    conn.commit()
    conn.close()

def create_CUST_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS CUSTOMER(
                   EMAIL VARCHAR(255) PRIMARY KEY,
                   SSN INTEGER UNIQUE,
                   FOREIGN KEY (SSN) REFERENCES PERSON (SSN)
                   )
    ''')
    conn.commit()
    conn.close()

def create_EMP_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS EMPLOYEE( 
                   EMPLOYEE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                   SSN INTEGER UNIQUE,
                   ROLE VARCHAR(50),
                   STOREID INTEGER,
                   PRIMARY KEY(SSN, EMPLOYEE_ID),
                   FOREIGN KEY (SSN) REFERENCES PERSON (SSN),
                   FOREIGN KEY (STOREID) REFERENCES STORE (STOREID)
                   )
    ''')
    conn.commit()
    conn.close()

def create_ORDER_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS ORDERS(
                   ORDER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                   ORDER_DATE DATE TEXT,
                   EMAIL VARCHAR(255),
                   EMPLOYEE_ID INTEGER,
                   FOREIGN KEY (EMAIL) REFERENCES CUSTOMER (EMAIL),
                   FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE (EMPLOYEE_ID)
                   )
    ''')    
    conn.commit()
    conn.close()

def create_PROD_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PRODUCT(
                   PRODUCTID INTEGER PRIMARY KEY AUTOINCREMENT,
                   NAME VARCHAR(255),
                   PRICE INTEGER,
                   ORDER_ID_CONTAINS INTEGER,
                   CATEGORY_NAME VARCHAR(255),
                   STOREID INTEGER,
                   SUPPLIER_ID INTEGER,
                   DELIVERY_NO INTEGER,
                   NO_OF_PRODUCTS INTEGER,
                   FOREIGN KEY (ORDER_ID_CONTAINS) REFERENCES ORDERS (ORDER_ID),
                   FOREIGN KEY (CATEGORY_NAME) REFERENCES CATEGORY (CATEGORY_NAME),
                   FOREIGN KEY (STOREID) REFERENCES STORE (STOREID),
                   FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER (SUPPLIER_ID),
                   FOREIGN KEY (DELIVERY_NO) REFERENCES SUPPLIER_DELIVERY (DELIVERY_NO)
                   )
    ''')    
    conn.commit()
    conn.close()

def create_CAT_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS CATEGORY(
                   CATEGORY_NAME VARCHAR(255) PRIMARY KEY,
                   GENERATION INTEGER
                   )
    ''')    
    conn.commit()
    conn.close()

def create_SUPP_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS SUPPLIER(
                   SUPPLIER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                   NAME VARCHAR(255)
                   )
    ''')    
    conn.commit()
    conn.close()

def create_STORE_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS STORE(
                   STOREID INTEGER PRIMARY KEY AUTOINCREMENT,
                   LOCATION VARCHAR(255),
                   NAME VARCHAR(255),
                   PHONE INTEGER UNIQUE,
                   EMPLOYEE_ID INTEGER,
                   FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE (EMPLOYEE_ID)
                   )
    ''')    
    conn.commit()
    conn.close()

def create_PAY_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS PAYMENT(
                   PAYMENT_NO INTEGER PRIMARY KEY AUTOINCREMENT,
                   PAYMENT VARCHAR(255),
                   AMOUNT INTEGER,
                   DATE DATE TEXT
                   )
    ''')    
    conn.commit()
    conn.close()

def create_SUPD_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS SUPPLIER_DELIVERY(
                   DELIVERY_NO INTEGER PRIMARY KEY AUTOINCREMENT,
                   SUPPLIER_ID INTEGER UNIQue,
                   STATUS VARCHAR(255),
                   DELIVERY_DATE DATE TEXT,
                   FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER (SUPPLIER_ID)
                   )
    ''')    
    conn.commit()
    conn.close()


def create_INV_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS INVENTORY(
                   INVENTORY_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                   STOCK_LEVEL INTEGER,
                   LAST_UPDATED VARCHAR(255)
                   )
    ''')    
    conn.commit()
    conn.close()

def create_MP_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS MAKES PAYMENT(
                   PAYMENT_NO INTEGER,
                   ORDER_ID INTEGER,
                   EMAIL VARCHAR(255),
                   PRIMARY KEY (PAYMENT_NO, ORDER_ID, EMAIL),
                   FOREIGN KEY (ORDER_ID) REFERENCES ORDERS (ORDER_ID),
                   FOREIGN KEY (PAYMENT_NO) REFERENCES PAYMENT (PAYMENT_NO),
                   FOREIGN KEY (EMAIL) REFERENCES CUSTOMER (EMAIL)
                   )
    ''')    
    conn.commit()
    conn.close()

def create_UPDATE_table(database_name):
    conn = sqlite3.connect(database_name)
    cursor=conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS UPDATES(
                   EMPLOYEE_ID INTEGER,
                   INVENTORY_ID INTEGER,
                   SUPPLIER_ID INTEGER,
                   DELIVERY_NO INTEGER,
                   PRIMARY KEY(EMPLOYEE_ID, INVENTORY_ID, SUPPLIER_ID, DELIVERY_NO),
                   FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE (EMPLOYEE_ID),
                   FOREIGN KEY (INVENTORY_ID) REFERENCES INVENTORY (INVENTORY_ID),
                   FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER (SUPPLIER_ID),
                   FOREIGN KEY (DELIVERY_NO) REFERENCES SUPPLIER_DELIVERY (DELIVERY_NO)
                   )
    ''')    
    conn.commit()
    conn.close()