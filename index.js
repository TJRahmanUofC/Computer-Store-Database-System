document.addEventListener("DOMContentLoaded", function () {
    // Update cart count on page load
    updateCartCount();

    fetch('mockup.json') // Ensure the correct path
        .then(response => response.json())
        .then(data => {
            let products = data.PRODUCT.slice(0, 6); // Get first 6 products
            let newArrivalsContainer = document.getElementById("new-arrivals");

            newArrivalsContainer.innerHTML = ""; // Clear existing content

            products.forEach(product => {
                // Construct image path safely (Ensure no spaces/issues)
                let imageName = product.NAME.toLowerCase().replace(/ /g, "_") + ".jpg";
                let imagePath = `assets/images/${imageName}`;

                newArrivalsContainer.innerHTML += `
                    <div class="product-card">
                        <img src="${imagePath}" alt="${product.NAME}" onerror="this.onerror=null; this.src='assets/images/default.jpg';">
                        <h3>${product.NAME}</h3>
                        <p>Category: ${product.CATEGORY_NAME}</p>
                        <p class="price">$${product.PRICE}</p>
                        <a href="customer/product.html?id=${product.PRODUCTID}" class="view-button">View Details</a>
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error("Error loading new arrivals:", error);
            document.getElementById("new-arrivals").innerHTML = "<p>Failed to load new arrivals.</p>";
        });
});

// Function to update cart count across pages
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    let cartCountElement = document.getElementById("cart-count");

    if (cartCountElement) {
        cartCountElement.textContent = `Cart (${cartCount})`;
    }
}
