document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        document.getElementById("product-container").innerHTML = "<p>Product ID not provided.</p>";
        return;
    }

    fetch('../mockup.json') // Ensure the path is correct
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            const product = data.PRODUCT.find(p => p.PRODUCTID == productId);

            if (product) {
                // Update product details
                document.getElementById("product-image").src = `../assets/${product.NAME.toLowerCase().replace(/ /g, "_")}.jpg`;
                document.getElementById("product-name").textContent = product.NAME;
                document.getElementById("product-category").textContent = `Category: ${product.CATEGORY_NAME}`;
                document.getElementById("product-price").textContent = `$${product.PRICE}`;
                document.getElementById("product-stock").textContent = `Stock: ${product.STOCK > 0 ? "In Stock" : "Out of Stock"}`;
                document.getElementById("product-description").textContent = "High-quality component for optimal performance.";

                // Update "Add to Cart" button
                const addToCartButton = document.getElementById("add-to-cart");
                if (product.STOCK === 0) {
                    addToCartButton.disabled = true;
                    addToCartButton.textContent = "Out of Stock";
                } else {
                    addToCartButton.addEventListener("click", function () {
                        addToCart(product);
                    });
                }

                // Load related products (same category)
                const relatedProducts = data.PRODUCT.filter(p => p.CATEGORY_NAME === product.CATEGORY_NAME && p.PRODUCTID !== product.PRODUCTID);
                const relatedProductsGrid = document.getElementById("related-products-grid");

                relatedProducts.forEach(relatedProduct => {
                    relatedProductsGrid.innerHTML += `
                        <div class="product-card">
                            <img src="../assets/${relatedProduct.NAME.toLowerCase().replace(/ /g, "_")}.jpg" alt="${relatedProduct.NAME}">
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

// Function to add product to cart (stores in localStorage)
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || []; // Get cart or initialize empty array

    // Check if the product already exists in the cart
    let existingProduct = cart.find(item => item.PRODUCTID === product.PRODUCTID);
    if (existingProduct) {
        existingProduct.quantity += 1; // Increment quantity
    } else {
        product.quantity = 1; // Set initial quantity
        cart.push(product);
    }

    localStorage.setItem("cart", JSON.stringify(cart)); // Save updated cart
    updateCartCount();
    alert(`${product.NAME} added to cart!`);
}

// Function to update cart count in the header
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0); // Sum quantities
    document.getElementById("cart-count").textContent = `Cart (${cartCount})`;
}
