-- Computer_Hardware_Store_FULL_DATABASE.sql
-- Contains: Schema, Sample Data, Indexes, Triggers, and Security

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- 1. Database Setup
DROP DATABASE IF EXISTS Computer_Hardware_Store;
CREATE DATABASE Computer_Hardware_Store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Computer_Hardware_Store;

-- =====================
-- 2. SCHEMA DEFINITION
-- =====================

CREATE TABLE STORE(
    STOREID INTEGER PRIMARY KEY,
    LOCATION VARCHAR(255),
    NAME VARCHAR(255) NOT NULL,
    PHONE INTEGER UNIQUE,
    MANAGER_ID INTEGER
);

CREATE TABLE PERSON(
    SSN INTEGER PRIMARY KEY COMMENT 'For non-SSN users: SHA256(email)[:9] converted to integer',
    NAME VARCHAR(255) NOT NULL,
    PHONE INTEGER UNIQUE,
    ADDRESS VARCHAR(255) NOT NULL,
    is_synthetic_ssn BOOLEAN DEFAULT FALSE COMMENT 'TRUE for auto-generated SSNs'
);

CREATE TABLE CUSTOMER(
    EMAIL VARCHAR(255) PRIMARY KEY,
    SSN INTEGER NOT NULL,
    PASSWORD_HASH VARCHAR(512) NOT NULL COMMENT 'Raw SHA-256 hash',
    FOREIGN KEY (SSN) REFERENCES PERSON (SSN)
);

CREATE TABLE EMPLOYEE( 
    EMPLOYEE_ID INTEGER PRIMARY KEY,
    SSN INTEGER NOT NULL,
    ROLE VARCHAR(50),
    STOREID INTEGER,
    PASSWORD_HASH VARCHAR(512), -- Raw SHA-256 hash
    FOREIGN KEY (SSN) REFERENCES PERSON (SSN),
    FOREIGN KEY (STOREID) REFERENCES STORE (STOREID)
);

CREATE TABLE ORDERS(
    ORDER_ID INTEGER PRIMARY KEY AUTO_INCREMENT, -- Added AUTO_INCREMENT
    ORDER_DATE DATE NOT NULL,
    ORDER_NUMBER VARCHAR(20) UNIQUE NOT NULL COMMENT 'User-facing unique random order identifier', -- ORDER_NUMBER FOR CUSTOMER ORDER HISTORY
    EMAIL VARCHAR(255),
    EMPLOYEE_ID INTEGER,
    STATUS VARCHAR(20) DEFAULT 'Pending',
    FOREIGN KEY (EMAIL) REFERENCES CUSTOMER (EMAIL),
    FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE (EMPLOYEE_ID)
);

-- CREATE TABLE CATEGORY(
-- 	CATEGORY_ID INTEGER PRIMARY KEY,
--     CATEGORY_NAME VARCHAR(255),
--     GENERATION INTEGER
-- );

CREATE TABLE SUPPLIER(
    SUPPLIER_ID INTEGER PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL
);

CREATE TABLE SUPPLIER_DELIVERY(
    DELIVERY_NO INTEGER PRIMARY KEY,
    SUPPLIER_ID INTEGER,
    STATUS VARCHAR(255),
    DELIVERY_DATE DATE NOT NULL,
    FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER (SUPPLIER_ID)
);

CREATE TABLE PRODUCT(
    PRODUCTID INTEGER PRIMARY KEY,
    NAME VARCHAR(255),
    PRICE DECIMAL(10,2),
    CATEGORY_NAME VARCHAR(255),
    STOREID INTEGER NOT NULL,
    SUPPLIER_ID INTEGER NOT NULL,
    DELIVERY_NO INTEGER NOT NULL,
    NO_OF_PRODUCTS INTEGER,
    IMAGE_URL VARCHAR(255), -- Added IMAGE_URL column
    -- FOREIGN KEY (ORDER_ID_CONTAINS) REFERENCES ORDERS (ORDER_ID) ON DELETE CASCADE, -- Removed FK
    -- FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORY (CATEGORY_ID),
    FOREIGN KEY (STOREID) REFERENCES STORE (STOREID),
    FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER (SUPPLIER_ID),
    FOREIGN KEY (DELIVERY_NO) REFERENCES SUPPLIER_DELIVERY (DELIVERY_NO) ON DELETE CASCADE
);

-- Added ORDER_ITEMS table
CREATE TABLE ORDER_ITEMS (
    ORDER_ITEM_ID INTEGER PRIMARY KEY AUTO_INCREMENT,
    ORDER_ID INTEGER NOT NULL,
    PRODUCTID INTEGER NOT NULL,
    QUANTITY INTEGER NOT NULL,
    PRICE_AT_PURCHASE DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ORDER_ID) REFERENCES ORDERS(ORDER_ID) ON DELETE CASCADE,
    FOREIGN KEY (PRODUCTID) REFERENCES PRODUCT(PRODUCTID)
    -- Note: No FK to PRODUCT on delete cascade, as we might want historical order items even if product is deleted
);


CREATE TABLE PAYMENT(
    PAYMENT_NO INTEGER PRIMARY KEY AUTO_INCREMENT, -- Added AUTO_INCREMENT
    PAYMENT_TYPE VARCHAR(255) NOT NULL,
    AMOUNT DECIMAL(10,2) NOT NULL,
    DATE DATE,
    STATUS VARCHAR(20) DEFAULT 'Pending'
);

CREATE TABLE INVENTORY(
    INVENTORY_ID INTEGER PRIMARY KEY,
    STOCK_LEVEL INTEGER,
    LAST_UPDATED TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MAKES_PAYMENT(
    PAYMENT_NO INTEGER,
    ORDER_ID INTEGER,
    EMAIL VARCHAR(255),
    PRIMARY KEY (PAYMENT_NO, ORDER_ID, EMAIL),
    FOREIGN KEY (ORDER_ID) REFERENCES ORDERS (ORDER_ID) ON DELETE CASCADE,
    FOREIGN KEY (PAYMENT_NO) REFERENCES PAYMENT (PAYMENT_NO),
    FOREIGN KEY (EMAIL) REFERENCES CUSTOMER (EMAIL)
);

CREATE TABLE UPDATES(
    EMPLOYEE_ID INTEGER,
    INVENTORY_ID INTEGER,
    SUPPLIER_ID INTEGER,
    DELIVERY_NO INTEGER,
    PRIMARY KEY(EMPLOYEE_ID, INVENTORY_ID, SUPPLIER_ID, DELIVERY_NO),
    FOREIGN KEY (EMPLOYEE_ID) REFERENCES EMPLOYEE (EMPLOYEE_ID),
    FOREIGN KEY (INVENTORY_ID) REFERENCES INVENTORY (INVENTORY_ID),
    FOREIGN KEY (SUPPLIER_ID) REFERENCES SUPPLIER (SUPPLIER_ID),
    FOREIGN KEY (DELIVERY_NO) REFERENCES SUPPLIER_DELIVERY (DELIVERY_NO) ON DELETE CASCADE
);

-- =====================
-- 3. SAMPLE DATA
-- =====================

-- PERSON (with real and synthetic SSNs)
INSERT INTO PERSON (SSN, NAME, PHONE, ADDRESS, is_synthetic_ssn) VALUES
(54128, 'Jane Doe', 123456789, '12th DoLittle St, Calgary, AB', FALSE),
(54529, 'John Smith', 213456789, '2nd Roosevelt Lane, Vancouver, BC', FALSE),
(89758, 'Jane Doe', 784596321, 'Jackson Avenue, Salt Lake City, Texas', FALSE),
(74159, 'Matthew Masters', 852417936, 'James Earl Jones Boulevard, Astera, NW', FALSE),
(96415, 'Farhan Dullahan', 159753248, 'Loc Lac St, Port Tanzania, OW', FALSE),
(25479, 'Marjaneh Imani', 300120040, 'Kunafa Tower, Akihabara', FALSE),
(98526, 'Sin Cos Tanjim', NULL, 'Grove St, Los Santos, San Andreas', FALSE),
(85479, 'Ash Ketchum', 745632189, 'Hellfire Gala, Krakoa', FALSE),
(74512, 'Arthur Penumbra', NULL, 'Earth St, Flint County, Oregon', FALSE),
(85296, 'Bren Shyo', 741852963, 'Thinking Side Lane, Fracture, Florida', FALSE),
(95478, 'Chet Potter', 654321987, 'Loud Kru Port, Leviatan, Wonderland', FALSE),
(20157, 'FNS Som', NULL, 'Elgado, Monster Hunter Rise, Sunbreak', FALSE),
(03589, 'Demon Com', 654421987, 'Astera Kamura St, Seliana Village, World', FALSE),
(15069, 'Bradley Wong', 854321667, '3520, Moga Village, Deserted Island', FALSE),
(39045, 'Kratos', 20148596, 'Rosewood Rd, Rosewood Borrough, Rockport', FALSE),
(45698, 'Brawk Mada', 9025863, '741, Masjid Rd, Babylon', FALSE),
(63214, 'Levothyroxine Sodium', NULL, '12B, Garden Tower, Island of Time', FALSE),
(63204, 'Alma Frost', NULL, 'School of Gifted Children, Suja, Forbidden Lands', FALSE),
(40236, 'Zeus Thor', 10258963, 'Tin Tran Lane, Eura Silva, Lavaland', FALSE),
(98505, 'Diva Diver', 966009, '31 Raven, Mechanical Tower, Hanging Gardens of Babylon', FALSE),
(20145, 'Las Valentino Venturas', NULL, 'Library of Alexandria, Alexandria', FALSE),
(41001, 'Link Hyrule', 789456123, 'Castle Town, Hyrule Field, Hyrule', FALSE),
(20014, 'Zelda Nohansen', NULL, 'Royal Palace, Hyrule Castle, Hyrule', FALSE),
(31040, 'Samus Aran', 987654321, 'Galactic Federation HQ, Zebes', FALSE),
(12312, 'Lara Croft', 456789123, 'Croft Manor, Surrey, England', FALSE),
(32132, 'Joel Miller', 123123123, 'Jackson City, Wyoming', FALSE),
(41008, 'Ellie Williams', NULL, 'Salt Lake Quarantine Zone, Utah', FALSE),
(41009, 'Geralt of Rivia', 741258963, 'Kaer Morhen, The Continent', FALSE),
(101101, 'Solid Snake', 321456987, 'Outer Heaven HQ, Zanzibar Land', FALSE),
(50206, 'Big Boss', 852963741, 'Mother Base, Seychelles Waters', FALSE),
(78501, 'Tifa Lockhart', 963852741, 'Seventh Heaven, Sector 7 Slums, Midgar', FALSE),
(1111, 'Cloud Strife', NULL, 'Shinra Building, Midgar, Gaia', FALSE),
(51025, 'Sora Kingdom', 147258369, 'Destiny Islands, Sea of Dreams', FALSE),
(61250, 'Aloy Nora', 159357486, 'Mother’s Embrace, Nora Sacred Lands', FALSE),
(85205, 'Jill Valentine', NULL, 'Raccoon City Police HQ, Raccoon City', FALSE),
(752014, 'Leon S. Kennedy', 741963852, 'Safehouse, Washington D.C.', FALSE),
(632014, 'Nathan Drake', 258741963, 'Adventurer’s Lodge, Madagascar', FALSE),
-- Synthetic SSNs (auto-generated for customers without SSN):
(100000001, 'Alex NoSSN', 551112222, '123 Virtual Rd, Digital City', TRUE),
(100000002, 'Taylor Online', 553334444, '456 Cloud Ave, Webville', TRUE);

-- CUSTOMER (Using raw SHA2 for consistency with app.py's hashlib.sha256)
INSERT INTO CUSTOMER (EMAIL, SSN, PASSWORD_HASH) VALUES
('jane.doe@hotmail.com', 54128, SHA2('password123', 256)),
('john.smith@gmail.com', 54529, SHA2('smith1234', 256)),
('m.masters@gmail.com', 74159, SHA2('mattpass', 256)),
('drdullahan@ucalgary.ca', 96415, SHA2('dullahan123', 256)),
('marjaneh.imani@inbox.com', 25479, SHA2('kunafa123', 256)),
('sincostan@mathmail.com', 98526, SHA2('sincos123', 256)),
('arthur@penumbra.org', 74512, SHA2('darkside', 256)),
('chet.potter@hogwarts.edu', 95478, SHA2('loudkru987', 256)),
('kratos@ghostwarrior.com', 39045, SHA2('boy2025', 256)),
('diva.diver@aqua.net', 98505, SHA2('deepblue', 256)),
('zeus.thor@olympus.com', 40236, SHA2('lightninghammer', 256)),
('las.venturas@library.org', 20145, SHA2('alexandria123', 256)),
('ash.ketchum@krakoa.com', 85479, SHA2('pikapass', 256)),
('bren.shyo@fracture.org', 85296, SHA2('fracturedtech', 256)),
('fns.som@elgado.co', 20157, SHA2('hunterrise', 256)),
('demon.com@seliana.net', 3589, SHA2('demonscape', 256)),
('brawk.mada@babylon.gov', 45698, SHA2('loudmasjid', 256)),
('levothyroxine@time.is', 63214, SHA2('medwizard', 256)),
('alma.frost@forbidden.edu', 63204, SHA2('frostyteach', 256)),
('zelda.nohansen@hyrule.org', 20014, SHA2('triforce', 256)),
('lara.croft@adventure.uk', 12312, SHA2('tombraider', 256)),
('joel.miller@jackson.org', 32132, SHA2('lastofpass', 256)),
('ellie.williams@fireflies.com', 41008, SHA2('ellieellie', 256)),
('geralt.rivia@witchernet.com', 41009, SHA2('whitewolf', 256)),
('solid.snake@outerheaven.co', 101101, SHA2('tacticalespionage', 256)),
('big.boss@motherbase.net', 50206, SHA2('phantompain', 256)),
('aloy.nora@gaia.earth', 61250, SHA2('horizonzero', 256)),
('leon.kennedy@rpd.gov', 752014, SHA2('residentforce', 256)),
('nathan.drake@uncharted.org', 632014, SHA2('treasurehunt', 256)),
('no_ssn1@example.com', 100000001, SHA2('secure123', 256)),
('no_ssn2@example.com', 100000002, SHA2('mypassword', 256));


-- STORE
INSERT INTO STORE (STOREID, LOCATION, NAME, PHONE, MANAGER_ID) VALUES
(50, 'Castle Schrade, OW', 'Fatalis Corp', 5624189, NULL),
(100, 'Biotechnica Building, Night City', 'Viktor Industries', 74185279, NULL),
(255, '255 University Drive, Calgary, AB', 'Victor Von Doom Hardwares', 123459876, NULL),
(874, 'Nook Plaza, Animal Village', 'Rocket Retail', 87451236, NULL),
(562, 'Asgard, Knowhere', 'Shinra Tech Depot', 74125896, NULL),
(419, 'Hyrule Castle Town, Hyrule', 'Not MC Store', 78945612, NULL),
(683, 'Kamura Village, Monster Hunter World', 'Kamura Armory', 85296374, NULL),
(102, 'Vault 101, Capital Wasteland', 'Fall Out Supplies', 96385274, NULL),
(948, 'Rapture Central Plaza, Atlantic Ocean', 'Hello I M UNDER ZA WATER', 95175348, NULL),
(737, '88 Double Fantasy Zone', 'Open Hearts', 98712345, NULL),
(358, 'Smasher St, Blackhand City', 'Silverhand Tech', 74136985, NULL),
(295, 'Green Hill Zone, South Island', 'Sonic Speed Electronics', 75395148, NULL),
(610, 'Pelican Town, Stardew Valley', 'Jojo Bizarre Machinations', 86942015, NULL),
(342, 'Timeless Falls', 'Baptized in Computers', 987654321, NULL),
(829, 'Yharnam Cathedral Ward, Hemwick', 'Hunter’s Dream Technologies', 963852741, NULL),
(781, 'Southside, Dogtown', 'Eudodyne Machines Inc.', 987321654, NULL),
(220, 'Timeless Falls', 'Chrono Artifacts', 741963852, NULL),
(355, 'Grove St, Los Santos, San Andreas', 'Ballas Group', 369258147, NULL),
(677, 'Hellfire Gala, Krakoa', 'X-Men Tech', 789456123, NULL),
(912, 'Kamura Village, Shrine Ruins', 'Tatsujin Tech', 258369147, NULL),
(488, '88 Double Fantasy Zone', 'Annhilate Sunshine Enterprises', 159753486, NULL),
(529, '255 University Drive, Calgary, AB', 'Rivers in the Desert', 147258369, NULL);

-- EMPLOYEE (Using raw SHA2 for consistency with app.py's hashlib.sha256)
INSERT INTO EMPLOYEE (EMPLOYEE_ID, SSN, ROLE, STOREID, PASSWORD_HASH) VALUES
(148, 96415, 'Customer Service', 100, SHA2('emp148pass', 256)),
(500, 89758, 'Floor Supervisor', 50, SHA2('supv500', 256)),
(1000, 54128, 'Manager', 255, SHA2('manager1000', 256)),
(2000, 25479, 'Supervisor', 100, SHA2('emp2000', 256)),
(2001, 20014, 'Trainer', 255, SHA2('ketchum25', 256)),
(3005, 85296, 'Tech Support', 50, SHA2('shyotech', 256)),
(5001, 752014, 'Trainee', 874, SHA2('demonmode', 256)),
(5002, 15069, 'Analyst', 874, SHA2('bradpass', 256)),
(9000, 63214, 'forklift operator', 562, SHA2('levo123', 256)),
(9876, 632014, 'Manager', 419, SHA2('almafrost', 256)),
(8372, 85479, 'Manager', 683, SHA2('pokeemp', 256)),
(1923, 12312, 'Tech Support', 419, SHA2('shyobackend', 256)),
(4938, 20157, 'Courier', 255, SHA2('somtracker', 256)),
(2841, 3589, 'Customer Service Representative', 102, SHA2('demonops', 256)),
(3056, 45698, 'Security', 683, SHA2('securitymada', 256)),
(7392, 1111, 'Customer Service Representative', 948, SHA2('levoinv', 256)),
(8410, 63204, 'Customer Service Representative', 737, SHA2('almateach', 256)),
(9281, 41001, 'Sales Associate', 358, SHA2('hyrulian', 256)),
(1576, 31040, 'Sales Associate', 295, SHA2('chozocode', 256)),
(6023, 78501, 'Inventory Clerk', 255, SHA2('tifatech', 256)),
(4620, 51025, 'Customer Service', 295, SHA2('sorasmile', 256)),
(1098, 61250, 'Sales Associate', 610, SHA2('aloyscout', 256)),
(3784, 85205, 'Manager', 342, SHA2('jillsave', 256));

-- Update Store Managers
UPDATE STORE SET MANAGER_ID = 500 WHERE STOREID = 50;
UPDATE STORE SET MANAGER_ID = 1000 WHERE STOREID = 255;
UPDATE STORE SET MANAGER_ID = 2000 WHERE STOREID = 100;
UPDATE STORE SET MANAGER_ID = 5001 WHERE STOREID = 874;
UPDATE STORE SET MANAGER_ID = 9000 WHERE STOREID = 562;
UPDATE STORE SET MANAGER_ID = 9876 WHERE STOREID = 419;
UPDATE STORE SET MANAGER_ID = 8372 WHERE STOREID = 683;
UPDATE STORE SET MANAGER_ID = 2841 WHERE STOREID = 102;
UPDATE STORE SET MANAGER_ID = 7392 WHERE STOREID = 948;
UPDATE STORE SET MANAGER_ID = 8410 WHERE STOREID = 737;
UPDATE STORE SET MANAGER_ID = 9281 WHERE STOREID = 358;
UPDATE STORE SET MANAGER_ID = 1576 WHERE STOREID = 295;
UPDATE STORE SET MANAGER_ID = 1098 WHERE STOREID = 610;
UPDATE STORE SET MANAGER_ID = 3784 WHERE STOREID = 342;

-- CATEGORY
-- INSERT INTO CATEGORY (CATEGORY_ID, CATEGORY_NAME, GENERATION) VALUES
-- (1,'Processor', 13),
-- (25,'Processor', 7),
-- (2,'Motherboard', 5),
-- (23,'Motherboard', 4),
-- (3,'Graphics Card', 4),
-- (4,'Graphics Card', 5),
-- (5,'Laptop', 3),
-- (27,'Laptop', 2),
-- (6,'Desktop', 4),
-- (7,'Tab', 2),
-- (8,'Desktop', 5),
-- (9,'RAM', 4),
-- (10,'HDD', 2),
-- (11,'SSD', 3),
-- (12,'PSU', 4),
-- (26,'PSU', 5),
-- (13,'Fans', 10),
-- (14,'Water Cooling System', 3),
-- (15,'Mouse', 1),
-- (24,'Mouse', 2),
-- (16,'Keyboard', 15),
-- (17,'Controller', 5),
-- (18,'Gaming Console', 5),
-- (19,'Microphone', 2),
-- (20,'Monitor', 12),
-- (21,'Earbuds', 5),
-- (22,'Headphones', 5);

-- SUPPLIER
INSERT INTO SUPPLIER (SUPPLIER_ID, NAME) VALUES
(15, 'Arasaka'),
(7, 'Dell'),
(19, 'Guild'),
(741, 'AMD'),
(158, 'MSI'),
(251, 'Stark Industries'),
(252, 'Baxter'),
(368, 'Sony'),
(444, 'Quantum'),
(229, 'Militech'),
(302, 'Zetatech'),
(500, 'Night Corps'),
(489, 'Asus'),
(105, 'Intel'),
(777, 'Umbrella'),
(666, 'Cyberdyne Systems'),
(2, 'Nvidia'),
(1, 'Bismillah Tech'),
(156, 'Razer'),
(963, 'Wayne Enterprise'),
(99, 'Gigabyte'),
(505, 'Nintendo'),
(12, 'Moga');

-- SUPPLIER_DELIVERY
INSERT INTO SUPPLIER_DELIVERY (DELIVERY_NO, SUPPLIER_ID, STATUS, DELIVERY_DATE) VALUES
(2, 741, 'Delivered', '2023-01-15'),
(4, 7, 'Delivered', '2023-02-20'),
(103, 15, 'Delivered', '2023-01-05'),
(212, 741, 'Delivered', '2023-01-15'),
(305, 158, 'Pending', '2025-01-28'),
(117, 7, 'Delivered', '2023-02-20'),
(198, 19, 'Pending', '2024-03-10'),
(24, 251, 'Arrived', '2023-03-25'),
(311, 252, 'Delivered', '2023-04-02'),
(409, 368, 'Arrived', '2023-04-15'),
(187, 444, 'Delivered', '2023-04-20'),
(228, 229, 'Arrived', '2022-05-01'),
(312, 302, 'Delivered', '2023-05-10'),
(129, 500, 'Arrived', '2021-05-18'),
(401, 489, 'Delivered', '2016-06-01'),
(314, 105, 'Delivered', '2023-06-15'),
(277, 777, 'Arrived', '2020-06-30'),
(351, 666, 'Pending', '2023-07-05'),
(209, 2, 'Delivered', '2023-07-20'),
(144, 1, 'Delivered', '2023-08-02'),
(476, 156, 'Arrived', '2023-08-10'),
(330, 963, 'Delivered', '2023-08-20'),
(360, 99, 'Delivered', '2023-09-01'),
(173, 12, 'Pending', '2023-09-15'),
(5, 19, 'Pending', '2023-03-10');


-- Add new delivery / -- This should be Update no?
-- INTO SUPPLIER_DELIVERY (SUPPLIER_ID, STATUS, DELIVERY_DATE)
-- VALUES (15, 'Arrived', '2023-03-15');

-- PRODUCT (Removed ORDER_ID_CONTAINS)
INSERT INTO PRODUCT (PRODUCTID, NAME, PRICE, CATEGORY_NAME, STOREID, SUPPLIER_ID, DELIVERY_NO, NO_OF_PRODUCTS, IMAGE_URL) VALUES
(1, 'Core i7-13700K', 399.99, 'Processor', 255, 19, 198, 25, 'assets/static/Core i7-13700K.jpg'),  
(2, 'RTX 4090', 1599.99, 'Graphics Card', 100, 19, 5, 10, 'assets/static/RTX 4090.jpg'),  
(3, 'Dell XPS 15', 1499.99, 'Laptop', 50, 7, 4, 15, 'assets/static/Dell XPS 15.jpg'),  
(4, 'MSI MPG Z790 Edge', 259.99, 'Motherboard', 874, 158, 305, 20, 'assets/static/MSI MPG Z790 EDGE.jpg'),  
(5, 'Sony WH-1000XM5', 349.99, 'Headphones', 562, 368, 409, 20, 'assets/static/SONY WH-1000XM5.jpg'),  
(6, 'DeathAdder V2', 49.99, 'Mouse', 419, 156, 476, 8, 'assets/static/DeathAdder V2.jpg'),  
(7, 'RTX 4080', 1299.99, 'Graphics Card', 683, 489, 401, 8, 'assets/static/RTX 4080.jpg'),  
(8, 'Core i9-13900K', 599.99, 'Processor', 102, 105, 314, 12, 'assets/static/Core i9-13900K.jpg'),  
(9, 'Gigabyte AORUS Elite AX', 199.99, 'Motherboard', 948, 99, 360, 18, 'assets/static/Gigabyte AORUS Elite AX.jpg'),  
(10, 'Cyberdyne Liquid Cooler', 119.99, 'Water Cooling', 737, 666, 351, 5, 'assets/static/CYBERDYNE LIQUID COOLER.jpg'),  
(11, 'WayneTech Ultra Slim Monitor', 299.99, 'Monitor', 358, 963, 330, 12, 'assets/static/WAYNETECH ULTRA SLIM MONITOR.jpg'),  
(12, 'AMD Ryzen 9 7900X', 479.99, 'Processor', 295, 741, 212, 20, 'assets/static/AMD RYZEN 9 7900X.jpg'),  
(13, 'Zetatech Gaming Console X', 499.99, 'Gaming Console', 610, 302, 312, 5, 'assets/static/ZETATECH GAMING CONSOLE.jpg'),  
(14, 'Night Corps Quantum PSU', 139.99, 'PSU', 342, 500, 129, 20, 'assets/static/NIGHT CORPS QUANTUM PSU.jpeg'),  
(15, 'Umbrella Gaming Desktop', 89.99, 'Desktop', 419, 777, 277, 15, 'assets/static/UMBRELLA GAMING DESKTOP.jpeg'),  
(16, 'Nintendo Joy-Con Controller', 69.99, 'Controller', 562, 741, 2, 10, 'assets/static/NINTENDO JOY-CON CONTROLLER.jpg'),  
(17, 'Dell G15 Gaming Laptop', 899.99, 'Laptop', 912, 7, 117, 12, 'assets/static/DELL G15 GAMING LAPTOP.jpg'),  
(18, 'Arasaka Nano RAM 32GB', 179.99, 'RAM', 529, 15, 103, 20, 'assets/static/ARASAKA NANO RAM 32GB - RAM.jpg'),  
(19, 'Baxter HDD 16TB', 11129.99, 'HDD', 102, 252, 311, 15, 'assets/static/BAXTER HDD 16TB - HDD.jpg'),  
(20, 'Quantum QuantumDrive SSD 2TB', 1199.99, 'SSD', 829, 444, 187, 17, 'assets/static/QUANTUM QUANTUMDRIVE SSD 2TB.jpg'),  
(21, 'Stark Arc Reactor PSU', 249.99, 'PSU', 781, 251, 24, 10, 'assets/static/STARK ARC REACTOR PSU.jpg'),  
(22, 'Militech Combat Mouse', 39.99, 'Mouse', 220, 229, 228, 8, 'assets/static/MILITECH COMBAT MOUSE.jpg'),  
(23, 'Moga Mini Notebook', 499.99, 'Tab', 355, 12, 173, 2, 'assets/static/MOGA MINI NOTEBOOK.jpg'),  
(24, 'RTX 5090', 2999.99, 'Graphics Card', 677, 2, 209, 5, 'assets/static/RTX 5090.jpg'),  
(25, 'MSI Gaming Keyboard', 2999.99, 'Keyboard', 488, 2, 209, 5, 'assets/static/MSI GAMING KEYBOARD.jpg'),  
(26, 'Bismillah Tech Mic Pro', 59.99, 'Microphone', 100, 1, 144, 2, 'assets/static/BISMILLAH TECH MIC PRO.jpg');

SELECT *
FROM PRODUCT
WHERE STOREID NOT IN
(SELECT STOREID
FROM STORE);

-- INVENTORY
INSERT INTO INVENTORY (INVENTORY_ID, STOCK_LEVEL) VALUES
(1, 25),
(2, 10),
(3, 15),
(4, 20),
(5, 20),
(6, 8),
(7, 8),
(8, 12),
(9, 18),
(10, 5),
(11, 12),
(12, 20),
(13, 5),
(14, 20),
(15, 15),
(16, 10),
(17, 12),
(18, 20),
(19, 15),
(20, 17),
(21, 10),
(22, 8),
(23, 2),
(24, 5),
(25, 2);

-- ORDERS (Added sample ORDER_NUMBER)
INSERT INTO ORDERS (ORDER_ID, ORDER_DATE, ORDER_NUMBER, EMAIL, EMPLOYEE_ID, STATUS) VALUES
(1001, '2023-01-20', 'ORD-846291', 'jane.doe@hotmail.com', 148, 'Completed'),
(1002, '2023-02-25', 'ORD-173504', 'john.smith@gmail.com', 500, 'Pending'),-- Changed status to Pending
(1003, '2023-03-10', 'ORD-645820', 'm.masters@gmail.com', 1000, 'Completed'),
(1004, '2023-04-12', 'ORD-983756', 'drdullahan@ucalgary.ca', 2000, 'Pending'),
(1005, '2023-05-05', 'ORD-928374', 'marjaneh.imani@inbox.com', 2001, 'Pending'),
(1006, '2023-06-22', 'ORD-372849', 'sincostan@mathmail.com', 3005, 'Completed'),
(1007, '2023-07-18', 'ORD-275849', 'arthur@penumbra.org', 5001, 'Completed'),
(1008, '2023-08-02', 'ORD-239483', 'chet.potter@hogwarts.edu', 9000, 'Pending'),
(1009, '2023-09-15', 'ORD-348592', 'kratos@ghostwarrior.com', 9876, 'Pending'),
(1010, '2023-10-11', 'ORD-562738', 'diva.diver@aqua.net', 8372, 'Completed'),
(1011, '2023-11-23', 'ORD-928734', 'zeus.thor@olympus.com', 2841, 'Pending'),
(1012, '2023-12-05', 'ORD-637483', 'las.venturas@library.org', 7392, 'Completed'),
(1013, '2024-01-10', 'ORD-483920', 'las.venturas@library.org', 9281, 'Pending'),
(1014, '2024-02-14', 'ORD-284763', 'bren.shyo@fracture.org', 1576, 'Pending'),
(1015, '2024-03-03', 'ORD-374829', 'fns.som@elgado.co', 6023, 'Completed'),
(1016, '2024-04-07', 'ORD-829374', 'demon.com@seliana.net', 4620, 'Pending'),
(1017, '2024-05-25', 'ORD-384756', 'brawk.mada@babylon.gov', 1098, 'Pending'),
(1018, '2024-06-15', 'ORD-283745', 'levothyroxine@time.is', 3784, 'Pending'),
(1019, '2024-07-20', 'ORD-758392', 'alma.frost@forbidden.edu', 148, 'Completed'),
(1020, '2024-07-26', 'ORD-755862', 'alma.frost@forbidden.edu', 4620, 'Completed'),
(1021, '2024-08-30', 'ORD-739283', 'las.venturas@library.org', 8372, 'Completed'); 

-- ORDER_ITEMS (Sample data for the new table)
INSERT INTO ORDER_ITEMS (ORDER_ID, PRODUCTID, QUANTITY, PRICE_AT_PURCHASE) VALUES
(1001, 2, 1, 1599.99), -- Jane bought 1 RTX 4090
(1002, 3, 1, 1499.99), -- John bought 1 Dell XPS 15
(1003, 5, 2, 699.98), -- Matthew bought 2 Sony WH-1000XM5 Headphones
(1004, 6, 1, 49.99), -- Dullahan bought 1 DeathAdder V2 Mouse
(1005, 9, 1, 199.99), -- Marjaneh bought 1 Gigabyte AORUS Elite AX Motherboard
(1006, 8, 1, 599.99), -- Sin bought 1 Core i9-13900K Processor
(1007, 11, 2, 599.98), -- Arthur bought 2 WayneTech Ultra Slim Monitors
(1008, 7, 1, 1299.99), -- Chet bought 1 RTX 4080 Graphics Card
(1009, 10, 1, 119.99), -- Kratos bought 1 Cyberdyne Liquid Cooler
(1010, 12, 1, 479.99), -- Diva bought 1 AMD Ryzen 9 7900X Processor
(1011, 14, 1, 139.99), -- Zeus bought 1 Night Corps Quantum PSU
(1012, 19, 1, 11129.99), -- Las bought 1 Baxter HDD 16TB
(1013, 20, 1, 1199.99), -- Las bought 1 Quantum QuantumDrive SSD 2TB
(1014, 15, 1, 89.99), -- Bren bought 1 Umbrella Gaming Desktop
(1015, 16, 2, 139.99), -- FNS bought 2 Nintendo Joy-Con Controllers
(1016, 18, 2, 359.98), -- Demon bought 2 Arasaka Nano RAM 32GB
(1017, 22, 3, 119.97), -- Brawk bought 3 Militech Combat Mice
(1018, 23, 1, 499.99), -- Levothyroxine bought 1 Moga Mini Notebook
(1019, 24, 1, 2999.99), -- Alma bought 1 RTX 5090 Graphics Card
(1020, 25, 1, 59.99), -- Alma bought 1 Bismillah Tech Mic Pro
(1021, 1, 1, 399.99); -- Las bought 1 Core i7-13700K Processor

-- PAYMENT
INSERT INTO PAYMENT (PAYMENT_NO, PAYMENT_TYPE, AMOUNT, DATE, STATUS) VALUES
(1, 'Credit Card', 1599.99, '2023-01-20', 'Completed'),
(2, 'Debit Card', 1499.99, '2023-02-25', 'Pending'),
(3, 'Credit Card', 699.98, '2023-03-10', 'Completed'),   -- order 1003
(4, 'Credit Card', 49.99, '2023-04-12', 'Pending'),		 -- order 1004
(5, 'Credit Card', 199.99, '2023-05-05', 'Pending'),      -- order 1005
(6, 'Debit Card', 599.99, '2023-06-22', 'Completed'),         -- order 1006
(7, 'Credit Card', 599.98, '2023-07-18', 'Completed'),    -- order 1007
(8, 'Credit Card', 1299.99, '2023-08-02', 'Pending'),           -- order 1008
(9, 'Debit Card', 119.99, '2023-09-15', 'Pending'),      -- order 1009
(10, 'Credit Card', 479.99, '2023-10-11', 'Completed'),   -- order 1010
(11, 'Debit Card', 139.99, '2023-11-23', 'Pending'),     -- order 1011
(12, 'Debit Card', 11129.99, '2023-12-05', 'Completed'),       -- order 1012
(13, 'Debit Card', 1199.99, '2024-01-10', 'Pending'),      -- order 1013
(14, 'Credit Card', 89.99, '2024-02-14', 'Pending'),     -- order 1014
(15, 'Credit Card', 139.99, '2024-03-03', 'Completed'),   -- order 1015
(16, 'Debit Card', 359.98, '2024-04-07', 'Pending'),          -- order 1016
(17, 'Debit Card', 119.97, '2024-05-25', 'Pending'),      -- order 1017
(18, 'Credit Card', 499.99, '2024-06-15', 'Pending'),    -- order 1018
(19, 'Credit Card', 2999.99, '2024-07-20', 'Completed'),        -- order 1019
(20, 'Debit Card', 59.99, '2024-07-26', 'Completed'),   -- order 1020
(21, 'Credit Card', 399.99, '2024-08-30', 'Completed');  -- order 1021;

-- MAKES_PAYMENT
INSERT INTO MAKES_PAYMENT (PAYMENT_NO, ORDER_ID, EMAIL) VALUES
(1, 1001, 'jane.doe@hotmail.com'),
(2, 1002, 'john.smith@gmail.com'),
(3, 1003, 'm.masters@gmail.com'),
(4, 1004, 'drdullahan@ucalgary.ca'),
(5, 1005, 'marjaneh.imani@inbox.com'),
(6, 1006, 'sincostan@mathmail.com'),
(7, 1007, 'arthur@penumbra.org'),
(8, 1008, 'chet.potter@hogwarts.edu'),
(9, 1009, 'kratos@ghostwarrior.com'),
(10, 1010, 'diva.diver@aqua.net'),
(11, 1011, 'zeus.thor@olympus.com'),
(12, 1012, 'las.venturas@library.org'),
(13, 1013, 'las.venturas@library.org'),
(14, 1014, 'bren.shyo@fracture.org'),
(15, 1015, 'fns.som@elgado.co'),
(16, 1016, 'demon.com@seliana.net'),
(17, 1017, 'brawk.mada@babylon.gov'),
(18, 1018, 'levothyroxine@time.is'),
(19, 1019, 'alma.frost@forbidden.edu'),
(20, 1020, 'alma.frost@forbidden.edu'),
(21, 1021, 'las.venturas@library.org');

-- UPDATES
INSERT INTO UPDATES (EMPLOYEE_ID, INVENTORY_ID, SUPPLIER_ID, DELIVERY_NO) VALUES
(148, 1, 15, 2),
(500, 2, 19, 5),
(1000, 3, 741, 212),
(2000, 4, 7, 117),
(2001, 5, 251, 24),
(3005, 6, 368, 409),
(5001, 7, 444, 187),
(5002, 8, 229, 228),
(9000, 9, 302, 312),
(9876, 10, 500, 129),
(8372, 11, 105, 314),
(1923, 12, 777, 277),
(4938, 13, 666, 351),
(2841, 14, 2, 209),
(3056, 15, 1, 144),
(7392, 16, 156, 476),
(8410, 17, 963, 330),
(9281, 18, 99, 360),
(1576, 19, 12, 173),
(6023, 20, 741, 103),
(4620, 21, 7, 4),
(1098, 22, 368, 409),
(3784, 23, 158, 305);

-- =====================
-- 4. INDEXES
-- =====================
CREATE INDEX idx_product_name ON PRODUCT(NAME);
CREATE INDEX idx_product_category ON PRODUCT(CATEGORY_NAME);
CREATE INDEX idx_order_date ON ORDERS(ORDER_DATE);
CREATE INDEX idx_order_number ON ORDERS(ORDER_NUMBER); -- Added index for ORDER_NUMBER

-- =====================
-- 5. SECURITY FEATURES
-- =====================
-- Password history tracking
CREATE TABLE PASSWORD_HISTORY (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES CUSTOMER(EMAIL)
);

-- Registration procedure with auto-SSN
DELIMITER //
CREATE PROCEDURE register_customer(
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_phone INT,
    IN p_address VARCHAR(255)
)
BEGIN
    DECLARE temp_ssn INT;
    
    -- Generate synthetic SSN (first 9 digits of SHA256 hash)
    SET temp_ssn = CONV(SUBSTRING(SHA2(p_email, 256), 1, 8), 16, 10) % 1000000000;
    
    -- Insert with synthetic SSN
    INSERT INTO PERSON (SSN, NAME, PHONE, ADDRESS, is_synthetic_ssn)
    VALUES (temp_ssn, p_name, p_phone, p_address, TRUE);
    
    -- Insert customer with hashed password (raw SHA2)
    INSERT INTO CUSTOMER (EMAIL, SSN, PASSWORD_HASH)
    VALUES (p_email, temp_ssn, SHA2(p_password, 256));
    
    -- Log password (raw SHA2)
    INSERT INTO PASSWORD_HISTORY (email, password_hash)
    VALUES (p_email, SHA2(p_password, 256));
END//
DELIMITER ;

-- Note: User creation/password management should be handled securely outside this script.
-- The following lines were removed:
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'qwerty';
-- FLUSH PRIVILEGES;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
