-- ============================================================
-- E-Commerce Platform — Database Setup
-- WAD Homework L2 2025/2026 — UMBB
-- ============================================================
-- Run this file in phpMyAdmin or MySQL CLI to create the
-- database, tables, and seed data.
-- ============================================================

-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS ecommerce_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ecommerce_db;

-- ============================================================
-- TABLE 1: account
-- Stores login credentials for authentication
-- ============================================================
CREATE TABLE IF NOT EXISTS account (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  login      VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 2: customer
-- Stores customer profile information
-- ============================================================
CREATE TABLE IF NOT EXISTS customer (
  customer_id  INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  address      VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20)  NOT NULL,
  email        VARCHAR(100) NOT NULL UNIQUE,
  account_id   INT,
  FOREIGN KEY (account_id) REFERENCES account(id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 3: product
-- Stores product catalog information
-- ============================================================
CREATE TABLE IF NOT EXISTS product (
  product_id   INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  category     VARCHAR(50)  NOT NULL,
  image        VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 4: orders
-- Stores placed orders linked to customers and products
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id     INT AUTO_INCREMENT PRIMARY KEY,
  customer_id  INT NOT NULL,
  product_id   INT NOT NULL,
  quantity     INT NOT NULL DEFAULT 1,
  order_date   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_price  DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (product_id)  REFERENCES product(product_id)
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA — Test Accounts
-- Password is stored as plain text for homework simplicity.
-- In production, always use password_hash().
-- ============================================================
INSERT INTO account (login, password) VALUES
  ('admin',    'admin123'),
  ('customer1','pass1234');

-- ============================================================
-- SEED DATA — Customers
-- ============================================================
INSERT INTO customer (name, address, phone_number, email, account_id) VALUES
  ('Admin User',     '123 Admin Street, Algiers',   '+213 555 0001', 'admin@store.com',     1),
  ('Ahmed Benali',   '45 University Blvd, Boumerdes','+213 555 0002', 'ahmed.b@student.com', 2);

-- ============================================================
-- SEED DATA — Products (3 per category = 9 total)
-- ============================================================

-- Electronics (IDs 1-3)
INSERT INTO product (name, price, category, image, description) VALUES
  ('ProMax Smartphone',   699.99, 'Electronics', 'images/product-smartphone.png',
   'Flagship smartphone with 6.7" AMOLED display, 128GB storage, 50MP triple camera, and all-day battery life.'),
  ('UltraBook Pro 15',   1299.99, 'Electronics', 'images/product-laptop.png',
   'Ultra-thin 15" laptop with Intel i7, 16GB RAM, 512GB SSD, and stunning 4K display for professionals.'),
  ('AuraSound X7 Headphones', 249.99, 'Electronics', 'images/product-headphones.png',
   'Premium wireless noise-cancelling headphones with 40-hour battery, Hi-Res Audio, and ultra-comfortable memory foam.');

-- Clothing (IDs 4-6)
INSERT INTO product (name, price, category, image, description) VALUES
  ('Heritage Leather Jacket', 189.99, 'Clothing', 'images/product-jacket.png',
   'Handcrafted genuine leather jacket with quilted lining. Classic biker style meets modern sophistication.'),
  ('Aurora Designer Sneakers', 129.99, 'Clothing', 'images/product-sneakers.png',
   'Lightweight designer sneakers with responsive cushioning, premium knit upper, and gold accent detailing.'),
  ('Chrono Elegance Watch',   349.99, 'Clothing', 'images/product-watch.png',
   'Swiss-inspired chronograph watch with sapphire crystal, leather strap, and water resistance to 100m.');

-- Books (IDs 7-9)
INSERT INTO product (name, price, category, image, description) VALUES
  ('Echoes of Tomorrow',      24.99, 'Books', 'images/product-scifi.png',
   'Award-winning sci-fi novel exploring humanity''s first contact with an ancient interstellar civilization. 480 pages.'),
  ('The Art of Modern Cuisine', 39.99, 'Books', 'images/product-cooking.png',
   'A beautifully illustrated cookbook with 200+ gourmet recipes from Michelin-starred chefs around the world.'),
  ('Code & Craft: Python Mastery', 44.99, 'Books', 'images/product-programming.png',
   'Comprehensive guide to Python programming — from fundamentals to AI/ML — with 500+ hands-on exercises.');
