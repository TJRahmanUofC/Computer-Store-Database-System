document.addEventListener("DOMContentLoaded", function () {
    let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    let cartContainer = document.getElementById("cart-items");
    let cartCountElement = document.getElementById("cart-count");

    console.log("Cart Items from localStorage:", cartItems); // Debugging statement

    if (!cartContainer) {
        console.error("Error: cart-items container not found!");
        return;
    }

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartContainer.innerHTML = ""; // Clear existing content

        cartItems.forEach((product, index) => {
            cartContainer.innerHTML += `
                <div class="cart-item">
                    <h3>${product.NAME}</h3>
                    <p>Category: ${product.CATEGORY_NAME}</p>
                    <p class="price">Price: $${product.PRICE.toFixed(2)}</p>
                    <p>Quantity: 
                        <button class="quantity-btn" onclick="decreaseQuantity(${index})">-</button>
                        <span>${product.quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${index})">+</button>
                    </p>
                    <p>Total: $${(product.quantity * product.PRICE).toFixed(2)}</p>
                    <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
        });

        // Add total price at the bottom
        const totalPrice = cartItems.reduce((total, item) => total + item.quantity * item.PRICE, 0);
        cartContainer.innerHTML += `
            <div class="cart-total">
                <h3>Total Price: $${totalPrice.toFixed(2)}</h3>
            </div>
        `;
    }

    // Ensure cart count updates on page load
    updateCartCount();

    // Add event listener for the checkout button
    const checkoutButton = document.getElementById("checkout-btn");
    if (checkoutButton) {
        checkoutButton.addEventListener("click", function () {
            let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
            if (cartItems.length === 0) {
                alert("Your cart is empty. Please add items to proceed to checkout.");
            } else {
                // Redirect to the checkout page
                window.location.href = "checkout.html";
            }
        });
    } else {
        console.error("Checkout button not found!");
    }
});

// Function to decrease quantity of an item
function decreaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1; // Decrease quantity by 1
    } else {
        cart.splice(index, 1); // If quantity is 1, remove the item entirely
    }
    localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
    updateCartCount();
    location.reload(); // Refresh cart page
}

// Function to increase quantity of an item
function increaseQuantity(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart[index].quantity += 1; // Increase quantity by 1
    localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
    updateCartCount();
    location.reload(); // Refresh cart page
}

// Function to remove item from cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1); // Remove item at given index
    localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
    updateCartCount();
    location.reload(); // Refresh cart page
}

// Function to update cart count in header
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    let cartCountElement = document.getElementById("cart-count");

    if (cartCountElement) {
        cartCountElement.textContent = `Cart (${cartCount})`;
    }
}
