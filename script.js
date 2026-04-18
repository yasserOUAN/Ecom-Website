/* ============================================================
   E-Commerce Platform — Master JavaScript
   WAD Homework L2 2025/2026 — UMBB
   ============================================================
   Handles: Authentication, Cart (localStorage), Checkout,
   Dynamic aside updates, Toast notifications.
   ============================================================ */

// ============================================================
// SECTION 1: CONFIGURATION & CONSTANTS
// ============================================================

/**
 * Hardcoded user accounts for client-side authentication.
 * In production, authentication is handled server-side via login.php.
 */
const VALID_ACCOUNTS = [
  { login: 'admin',     password: 'admin123' },
  { login: 'customer1', password: 'pass1234' }
];

/** LocalStorage key used to persist cart data across page reloads */
const CART_STORAGE_KEY = 'ecommerce_cart';

/** LocalStorage key to track authenticated user */
const AUTH_STORAGE_KEY = 'ecommerce_auth';

// ============================================================
// SECTION 2: CART MANAGEMENT (localStorage)
// ============================================================

/**
 * Retrieves the current cart from localStorage.
 * @returns {Array} Array of cart item objects
 */
function getCart() {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading cart from localStorage:', error);
    return [];
  }
}

/**
 * Saves the cart array to localStorage.
 * @param {Array} cart - The cart items array to save
 */
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

/**
 * Adds a product to the cart or updates its quantity if already present.
 * @param {number} productId - The unique product ID
 * @param {string} name - Product name
 * @param {number} price - Product unit price
 * @param {string} image - Product image path
 * @param {number} quantity - Quantity to add
 */
function addToCart(productId, name, price, image, quantity) {
  const cart = getCart();

  // Check if product already exists in cart
  const existingIndex = cart.findIndex(item => item.productId === productId);

  if (existingIndex !== -1) {
    // Update quantity if product already in cart
    cart[existingIndex].quantity += quantity;
  } else {
    // Add new item to cart
    cart.push({
      productId: productId,
      name: name,
      price: parseFloat(price),
      image: image,
      quantity: quantity
    });
  }

  saveCart(cart);
  updateCartBadge();    // Update nav badge count
  updateCartAside();    // Update aside summary on category pages
  showToast(`${name} added to cart!`, 'success');
}

/**
 * Removes an item from the cart by its product ID.
 * @param {number} productId - The product ID to remove
 */
function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.productId !== productId);
  saveCart(cart);
  updateCartBadge();
  updateCartAside();
  renderCartPage(); // Re-render the cart page if we're on it
}

/**
 * Updates the quantity of a specific cart item.
 * @param {number} productId - The product ID to update
 * @param {number} newQuantity - The new quantity value
 */
function updateCartItemQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);

  if (item) {
    item.quantity = Math.max(1, parseInt(newQuantity) || 1);
    saveCart(cart);
    updateCartBadge();
    updateCartAside();
    renderCartPage();
  }
}

/**
 * Calculates the total number of items in the cart.
 * @returns {number} Total item count
 */
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculates the grand total price of all items in the cart.
 * @returns {number} Grand total price
 */
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadge();
  updateCartAside();
}

// ============================================================
// SECTION 3: UI UPDATES
// ============================================================

/**
 * Updates the cart badge count in the navigation bar.
 * Looks for element with class 'cart-badge' and updates its text.
 */
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = getCartItemCount();

  badges.forEach(badge => {
    badge.textContent = count;
    // Hide badge if cart is empty, show if items exist
    badge.style.display = count > 0 ? 'inline-block' : 'none';
  });
}

/**
 * Updates the cart summary in the aside section on category pages.
 * Shows item count and total price dynamically.
 */
function updateCartAside() {
  const asideSummary = document.getElementById('aside-cart-summary');
  if (!asideSummary) return; // Not on a category page

  const cart = getCart();
  const itemCount = getCartItemCount();
  const total = getCartTotal();

  asideSummary.innerHTML = `
    <div class="summary-row">
      <span>Items in cart:</span>
      <span>${itemCount}</span>
    </div>
    <div class="summary-row">
      <span>Total:</span>
      <span>$${total.toFixed(2)}</span>
    </div>
  `;
}

/**
 * Displays a toast notification message.
 * @param {string} message - The message to display
 * @param {string} type - Toast type: 'success', 'error', or default
 */
function showToast(message, type = '') {
  // Create toast container if it doesn't exist
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Auto-remove toast after animation completes
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================================
// SECTION 4: AUTHENTICATION
// ============================================================

/**
 * Handles the login form submission.
 * Validates credentials against VALID_ACCOUNTS array.
 * On success: stores auth state and redirects to main.html
 * On failure: shows error message with shake animation
 */
function handleLogin(event) {
  event.preventDefault(); // Prevent default form submission

  const loginInput = document.getElementById('login-input');
  const passwordInput = document.getElementById('password-input');
  const errorMessage = document.getElementById('error-message');

  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();

  // Validate that fields are not empty
  if (!login || !password) {
    errorMessage.textContent = 'Please enter both login and password.';
    errorMessage.classList.add('visible');
    return;
  }

  // Check credentials against valid accounts
  const validUser = VALID_ACCOUNTS.find(
    account => account.login === login && account.password === password
  );

  if (validUser) {
    // Store authentication state in localStorage
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
      login: validUser.login,
      loggedInAt: new Date().toISOString()
    }));

    // Redirect to main catalog page
    window.location.href = 'main.html';
  } else {
    // Show error message
    errorMessage.textContent = 'Invalid login or password. Please try again.';
    errorMessage.classList.remove('visible');
    // Force reflow to restart animation
    void errorMessage.offsetWidth;
    errorMessage.classList.add('visible');

    // Clear password field for security
    passwordInput.value = '';
    passwordInput.focus();
  }
}

/**
 * Checks if the user is authenticated.
 * Redirects to login page if not authenticated.
 */
function checkAuth() {
  const auth = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!auth) {
    window.location.href = 'index.html';
  }
}

/**
 * Logs the user out by clearing auth state and redirecting.
 */
function handleLogout() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.location.href = 'index.html';
}

// ============================================================
// SECTION 5: PRODUCT CARD — ADD TO CART HANDLER
// ============================================================

/**
 * Handles the "Add to Cart" button click on product cards.
 * Reads product data from data-* attributes and quantity input.
 * @param {HTMLElement} button - The clicked button element
 */
function handleAddToCart(button) {
  // Read product data from data attributes
  const productId = parseInt(button.dataset.id);
  const name = button.dataset.name;
  const price = parseFloat(button.dataset.price);
  const image = button.dataset.image;

  // Get quantity from the associated input (sibling in the same .product-card-actions)
  const actionsDiv = button.closest('.product-card-actions');
  const qtyInput = actionsDiv.querySelector('.qty-input');
  const quantity = parseInt(qtyInput.value) || 1;

  // Add to cart
  addToCart(productId, name, price, image, quantity);

  // Visual feedback — change button text briefly
  const originalText = button.innerHTML;
  button.innerHTML = '✓ Added!';
  button.classList.add('added');

  setTimeout(() => {
    button.innerHTML = originalText;
    button.classList.remove('added');
  }, 1500);

  // Reset quantity input to 1
  qtyInput.value = 1;
}

// ============================================================
// SECTION 6: CART PAGE RENDERING
// ============================================================

/**
 * Renders the cart page with all items from localStorage.
 * Called when cart.html loads and after any cart modifications.
 */
function renderCartPage() {
  const cartContainer = document.getElementById('cart-items-container');
  if (!cartContainer) return; // Not on cart page

  const cart = getCart();

  // Show empty state if cart has no items
  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products and come back!</p>
        <a href="main.html" class="category-card-link" style="margin-top: 1rem; display: inline-flex;">
          ← Continue Shopping
        </a>
      </div>
    `;

    // Hide total section
    const totalSection = document.querySelector('.cart-total-section');
    if (totalSection) totalSection.style.display = 'none';
    return;
  }

  // Build cart table HTML
  let tableHTML = `
    <table class="cart-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Name</th>
          <th>Price</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;

  cart.forEach(item => {
    const subtotal = (item.price * item.quantity).toFixed(2);
    tableHTML += `
      <tr>
        <td><img src="${item.image}" alt="${item.name}" class="cart-item-img"></td>
        <td class="cart-item-name">${item.name}</td>
        <td class="cart-item-price">$${item.price.toFixed(2)}</td>
        <td>
          <input type="number" min="1" value="${item.quantity}"
                 class="qty-input cart-item-qty"
                 onchange="updateCartItemQuantity(${item.productId}, this.value)"
                 id="qty-${item.productId}">
        </td>
        <td class="cart-item-price">$${subtotal}</td>
        <td>
          <button class="btn-remove" onclick="removeFromCart(${item.productId})"
                  id="remove-${item.productId}">
            ✕ Remove
          </button>
        </td>
      </tr>
    `;
  });

  tableHTML += `
      </tbody>
    </table>
  `;

  cartContainer.innerHTML = tableHTML;

  // Update grand total
  const totalSection = document.querySelector('.cart-total-section');
  if (totalSection) {
    totalSection.style.display = 'flex';
    const grandTotal = document.getElementById('grand-total');
    if (grandTotal) {
      grandTotal.textContent = `$${getCartTotal().toFixed(2)}`;
    }
  }
}

// ============================================================
// SECTION 7: CHECKOUT
// ============================================================

/**
 * Handles the checkout process.
 * Calculates the final total, displays it in the footer,
 * and sends order data to save_order.php via fetch.
 */
function handleCheckout() {
  const cart = getCart();

  // Validate cart is not empty
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const total = getCartTotal();

  // Display final total in footer
  const footerCheckout = document.getElementById('footer-checkout');
  if (footerCheckout) {
    footerCheckout.textContent = `🎉 Order Confirmed! Final Total: $${total.toFixed(2)}`;
    footerCheckout.classList.add('visible');
  }

  // Attempt to save order to server (PHP backend)
  saveOrderToServer(cart, total);

  // Show success notification
  showToast(`Order placed! Total: $${total.toFixed(2)}`, 'success');

  // Clear cart after successful checkout
  setTimeout(() => {
    clearCart();
    renderCartPage();
  }, 2000);
}

/**
 * Sends the order data to the PHP backend for database storage.
 * Falls back gracefully if the server is not available.
 * @param {Array} cart - The cart items
 * @param {number} total - The grand total
 */
function saveOrderToServer(cart, total) {
  // Get the authenticated user info
  const auth = localStorage.getItem(AUTH_STORAGE_KEY);
  const user = auth ? JSON.parse(auth) : { login: 'guest' };

  // Prepare order data
  const orderData = {
    customer_login: user.login,
    items: cart.map(item => ({
      product_id: item.productId,
      quantity: item.quantity,
      total_price: (item.price * item.quantity).toFixed(2)
    })),
    grand_total: total.toFixed(2),
    order_date: new Date().toISOString()
  };

  // Send order to PHP backend via POST
  fetch('save_order.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Order saved to database successfully:', data);
    } else {
      console.warn('Order save response:', data);
    }
  })
  .catch(error => {
    // Graceful fallback — order is still confirmed client-side
    console.warn('Could not save order to server (PHP backend may not be running):', error.message);
  });
}

// ============================================================
// SECTION 8: PAGE INITIALIZATION
// ============================================================

/**
 * Initializes the page based on which page is currently loaded.
 * Runs on DOMContentLoaded event.
 */
document.addEventListener('DOMContentLoaded', function () {

  // --- Authentication Page ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    // Don't check auth on login page
    return;
  }

  // --- All Other Pages: Check authentication ---
  // (Comment out the line below if you want to test pages without logging in)
  // checkAuth();

  // --- Update cart badge on every page load ---
  updateCartBadge();

  // --- Category Pages: Update aside summary ---
  updateCartAside();

  // --- Cart Page: Render cart items ---
  renderCartPage();

  // --- Checkout button handler ---
  const checkoutBtn = document.getElementById('btn-checkout');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleCheckout);
  }

  // --- Category page checkout buttons ---
  const categoryCheckoutBtn = document.getElementById('btn-category-checkout');
  if (categoryCheckoutBtn) {
    categoryCheckoutBtn.addEventListener('click', handleCheckout);
  }

  // --- Add to Cart buttons (event delegation for all product cards) ---
  document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', function () {
      handleAddToCart(this);
    });
  });

  // --- Logout button ---
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogout();
    });
  }
});
