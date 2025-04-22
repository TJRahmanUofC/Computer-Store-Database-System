document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.getElementById("product-container").innerHTML = "<p>Product ID not provided.</p>";
        return;
    }

    // Fetch product details from the backend API
    fetch(`http://127.0.0.1:5000/api/products/${productId}`, {
        method: 'GET',
        credentials: 'include' // Include cookies for session management
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.product) {
                const product = data.product;

                // Update product details
                // Construct absolute path from server root based on Flask static config
                // Check if IMAGE_URL already includes 'assets/'
                let mainImageUrl = product.IMAGE_URL || 'images/default.jpg';
                const mainImagePath = mainImageUrl.startsWith('assets/') ? `/${mainImageUrl}` : `/assets/${mainImageUrl}`;
                document.getElementById("product-image").src = mainImagePath;
                document.getElementById("product-name").textContent = product.NAME;
                document.getElementById("product-category").textContent = `Category: ${product.CATEGORY_NAME}`;
                document.getElementById("product-price").textContent = `$${product.PRICE}`;
                document.getElementById("product-stock").textContent = `Stock: ${product.NO_OF_PRODUCTS > 0 ? "In Stock" : "Out of Stock"}`;
                document.getElementById("product-description").textContent = "High-quality component for optimal performance.";

                // Add product locations to the product page
                const locations = product.LOCATION;
                document.getElementById("product-locations").innerHTML = `<strong>Available at:</strong> ${locations}`;

                // Update "Add to Cart" button
                const addToCartButton = document.getElementById("add-to-cart");
                if (product.NO_OF_PRODUCTS === 0) {
                    addToCartButton.disabled = true;
                    addToCartButton.textContent = "Out of Stock";
                } else {
                    addToCartButton.addEventListener("click", function () {
                        addToCart(product.PRODUCTID);
                    });
                }

                // Load related products (same category)
                const relatedProducts = data.related_products;
                const relatedProductsGrid = document.getElementById("related-products-grid");

                relatedProducts.forEach(relatedProduct => {
                    // Construct absolute path for related product images
                    let relatedImageUrl = relatedProduct.IMAGE_URL || 'images/default.jpg';
                    const relatedImagePath = relatedImageUrl.startsWith('assets/') ? `/${relatedImageUrl}` : `/assets/${relatedImageUrl}`;
                    relatedProductsGrid.innerHTML += `
                        <div class="product-card">
                            <img src="${relatedImagePath}" alt="${relatedProduct.NAME}">
                            <h3>${relatedProduct.NAME}</h3>
                            <p>Category: ${relatedProduct.CATEGORY_NAME}</p>
                            <p class="price">$${relatedProduct.PRICE}</p>
                            <a href="product.html?id=${relatedProduct.PRODUCTID}" class="view-button">View Details</a>
                        </div>
                    `;
                });

                // Update cart count on page load
                updateCartCount();
            } else {
                document.getElementById("product-container").innerHTML = "<p>Product not found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching product details:", error);
            document.getElementById("product-container").innerHTML = "<p>Error loading product details. Please try again later.</p>";
        });
});

// Function to add product to cart (via backend API)
function addToCart(productId) {
    fetch('http://127.0.0.1:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Product added to cart!");
                updateCartCount(); // Update cart count in header
            } else {
                alert(data.message || "Failed to add product to cart.");
            }
        })
        .catch(error => {
            console.error("Error adding product to cart:", error);
        });
}

// Function to update cart count (via backend API)
function updateCartCount() {
    fetch('http://127.0.0.1:5000/api/cart/count', {
        method: 'GET',
        credentials: 'include' // Include cookies for session management
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch cart count");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById("cart-count").textContent = `Cart (${data.count})`;
            }
        })
        .catch(error => {
            console.error("Error fetching cart count:", error);
        });
}
