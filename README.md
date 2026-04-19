# LuxeCart - E-Commerce Platform

![LuxeCart](images/product-laptop.png) *(Note: Replace with your actual project logo/screenshot if available)*

LuxeCart is a premium, modern e-commerce web application. It was originally developed as part of the WAD Homework L2 2025/2026 for UMBB. The platform features an intuitive, glassmorphism-inspired UI and provides a complete shopping experience from product catalog navigation to cart management and simulated checkout.

## ✨ Features

- **Authentication System:** Secure login page with client-side validation and local storage session management (with server-side PHP integration available).
- **Dynamic Product Catalog:** Categorized product listings including Electronics, Clothing, and Books.
- **Cart Management:** Fully functional shopping cart that persists across page reloads using `localStorage`. Users can add, modify quantities, and remove items.
- **Checkout Process:** Simulated checkout flow that computes totals and sends order data to the backend via AJAX/Fetch API.
- **Modern UI/UX:** Responsive design, glassmorphism aesthetics, dynamic aside cart summaries, and interactive toast notifications.
- **Database Driven:** Integrated with a MySQL database to handle products, accounts, customers, and orders.

## 🛠️ Tech Stack

- **Frontend:** HTML5, modern CSS3 (Flexbox/Grid, Glassmorphism, animations), Vanilla JavaScript (ES6)
- **Backend:** PHP (Form handling, session management, order processing API)
- **Database:** MySQL
- **Storage:** Browser `localStorage` for Cart and temporary Auth State

## 📂 Project Structure

```text
E_Commerce_Project/
├── db_setup.sql         # MySQL database schema and initial test data
├── index.html           # Authentication / Login page
├── main.html            # Main store dashboard
├── electronics.html     # Category view for Electronics
├── clothing.html        # Category view for Clothing
├── books.html           # Category view for Books
├── cart.html            # Dedicated shopping cart and checkout page
├── style.css            # Main stylesheet for all pages
├── script.js            # Core JavaScript for UI, Cart, and Auth logic
├── login.php            # Server-side authentication script
├── logout.php           # Server-side logout script
├── save_order.php       # API endpoint to handle order placements
└── images/              # Product and UI images
```

## 🚀 Setup & Installation

To run this project locally with full backend capability:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/LuxeCart.git
   cd LuxeCart
   ```

2. **Web Server Setup (XAMPP / MAMP / WAMP):**
   - Place the `E_Commerce_Project` folder into your local server's document root (e.g., `htdocs` for XAMPP).
   - Ensure Apache and MySQL services are running.

3. **Database Configuration:**
   - Open your MySQL administration tool (e.g., phpMyAdmin).
   - Import the `db_setup.sql` file to create the `ecommerce_db` database, necessary tables, and seed data.
   - *Note: You may need to configure your database credentials inside the `.php` files if your local setup uses a different username/password than the default (usually `root` with no password).*

4. **Launch the App:**
   - Navigate your browser to: `http://localhost/E_Commerce_Project/index.html`

## 🧪 Testing the Application

For demonstration purposes, the database is seeded with test accounts. You can use the following credentials to access the storefront:

- **Admin Account:** User: `admin` | Pass: `admin123`
- **Customer Account:** User: `customer1` | Pass: `pass1234`

*Note: Since this is a homework assignment, passwords are currently handled in plain text for simplicity. In a production environment, always use secure password hashing.*

## 🎓 Academic Context

This project was developed for the **Web Application Development (WAD)** class at **UMBB** (L2 2025/2026). It serves to demonstrate proficiency in connecting a multi-page dynamic frontend with a robust relational database backend.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
