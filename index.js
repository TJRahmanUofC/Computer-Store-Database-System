document.addEventListener("DOMContentLoaded", function () {
    // Update cart count on page load
    updateCartCount();

    // Fetch new arrivals from the backend
    fetch('http://127.0.0.1:5000/api/products?limit=6', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let products = data.products; // Get first 6 products
                let newArrivalsContainer = document.getElementById("new-arrivals");

                newArrivalsContainer.innerHTML = ""; // Clear existing content

                products.forEach(product => {
                    // Use IMAGE_URL from API and construct correct absolute path
                    let imageUrl = product.IMAGE_URL || 'images/default.jpg'; // Use default if IMAGE_URL is missing
                    const imagePath = imageUrl.startsWith('assets/') ? `/${imageUrl}` : `/assets/${imageUrl}`;

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
            } else {
                console.error("Failed to load new arrivals:", data.message);
                document.getElementById("new-arrivals").innerHTML = "<p>Failed to load new arrivals.</p>";
            }
        })
        .catch(error => {
            console.error("Error loading new arrivals:", error);
            document.getElementById("new-arrivals").innerHTML = "<p>Failed to load new arrivals.</p>";
        });
});

// Function to update cart count across pages
function updateCartCount() {
    // Fetch cart count from the backend
    fetch('http://127.0.0.1:5000/api/cart/count', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let cartCountElement = document.getElementById("cart-count");
                if (cartCountElement) {
                    cartCountElement.textContent = `Cart (${data.count})`;
                }
            } else {
                console.error("Failed to fetch cart count:", data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching cart count:", error);
        });
}
