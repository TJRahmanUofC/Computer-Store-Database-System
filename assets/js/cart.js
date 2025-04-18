document.addEventListener("DOMContentLoaded", function () {
    const cartContainer = document.getElementById("cart-items");

    // Fetch cart items from the backend
    fetch('http://127.0.0.1:5000/api/cart', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const cartItems = data.cart;

                if (cartItems.length === 0) {
                    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
                } else {
                    cartContainer.innerHTML = ""; // Clear existing content

                    cartItems.forEach(item => {
                            // Ensure price is treated as a number
                            const price = parseFloat(item.price) || 0;
                            const quantity = parseInt(item.quantity) || 0;
                            const totalItemPrice = (price * quantity).toFixed(2);

                            cartContainer.innerHTML += `
                                <div class="cart-item" data-product-id="${item.productId}">
                                    <h3>${item.name}</h3>
                                    <p>Price: $${price.toFixed(2)}</p>
                                    <div class="quantity-controls">
                                        <button onclick="decreaseQuantity(${item.productId}, ${quantity})">-</button>
                                        <span>Quantity: ${quantity}</span>
                                        <button onclick="increaseQuantity(${item.productId}, ${quantity})">+</button>
                                    </div>
                                    <p>Total: $${totalItemPrice}</p>
                                    <button class="remove-button" onclick="removeItemFromCart(${item.productId})">Remove</button>
                                </div>
                            `;
                        }); // End of the single forEach loop

                    // Add total price at the bottom
                    const totalPrice = cartItems.reduce((total, item) => total + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0), 0);
                    cartContainer.innerHTML += `
                        <div class="cart-total">
                            <h3>Total Price: $${totalPrice.toFixed(2)}</h3>
                        </div>
                    `;
                }
            } else {
                console.error("Failed to load cart:", data.message);
            }
        })
        .catch(error => console.error("Error loading cart:", error));

    // Add event listener for the checkout button
    const checkoutButton = document.getElementById("checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function() {
            // Redirect to the checkout page
            window.location.href = 'checkout.html'; // Assumes checkout.html is in the same 'customer' directory
        });
    }
});

// Function to decrease quantity of an item
function decreaseQuantity(productId, currentQuantity) {
    const newQuantity = currentQuantity - 1;
    if (newQuantity > 0) {
        updateCartItemQuantity(productId, newQuantity);
    } else {
        // If quantity becomes 0, remove the item
        removeItemFromCart(productId);
    }
}

// Function to increase quantity of an item
function increaseQuantity(productId, currentQuantity) {
    const newQuantity = currentQuantity + 1;
    updateCartItemQuantity(productId, newQuantity);
}

// Helper function to update item quantity via API
function updateCartItemQuantity(productId, quantity) {
    fetch(`http://127.0.0.1:5000/api/cart/${productId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: quantity }),
        credentials: 'include' // Important for session cookies
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Cart updated successfully");
            location.reload(); // Refresh cart page to show changes
        } else {
            console.error("Failed to update cart:", data.message);
            // Optionally display an error message to the user
        }
    })
    .catch(error => console.error("Error updating cart:", error));
}

// Function to remove item from cart via API
function removeItemFromCart(productId) {
    fetch(`http://127.0.0.1:5000/api/cart/${productId}`, {
        method: 'DELETE',
        credentials: 'include' // Important for session cookies
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log("Item removed successfully");
            location.reload(); // Refresh cart page to show changes
        } else {
            console.error("Failed to remove item:", data.message);
            // Optionally display an error message to the user
        }
    })
    .catch(error => console.error("Error removing item:", error));
}


// Function to update cart count in header (fetches from backend)
function updateCartCount() {
    fetch('http://127.0.0.1:5000/api/cart/count', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            let cartCountElement = document.getElementById("cart-count");
            if (cartCountElement) {
                if (data.success) {
                    cartCountElement.textContent = `Cart (${data.count})`;
                } else {
                    // Handle case where user might not be logged in or other error
                    cartCountElement.textContent = `Cart (0)`; 
                    console.error("Failed to get cart count:", data.message);
                }
            }
        })
        .catch(error => {
            console.error("Error fetching cart count:", error);
            let cartCountElement = document.getElementById("cart-count");
            if (cartCountElement) {
                cartCountElement.textContent = `Cart (?)`; // Indicate error
            }
        });
}

// Call updateCartCount on page load as well
document.addEventListener("DOMContentLoaded", updateCartCount);
