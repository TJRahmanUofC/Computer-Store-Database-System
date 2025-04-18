document.addEventListener("DOMContentLoaded", function () {
    // Load cart count from localStorage
    updateCartCount();

    // Fetch product data from the backend
    fetch('http://127.0.0.1:5000/api/products')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const products = data.products;
                const productList = document.getElementById("product-list");

                // Function to render products
                function renderProducts(products) {
                    productList.innerHTML = ""; // Clear existing content
                    products.forEach(product => {
                        const imageName = product.NAME.toLowerCase().replace(/ /g, "_") + ".jpg";
                        const imagePath = `../assets/images/${imageName}`;

                        productList.innerHTML += `
                            <div class="product-card">
                                <img src="${imagePath}" alt="${product.NAME}" 
                                    onerror="this.onerror=null; this.src='../assets/images/default.jpg';">
                                <h3>${product.NAME}</h3>
                                <p>Category: ${product.CATEGORY_NAME}</p>
                                <p class="price">$${product.PRICE}</p>
                                <p class="stock-status">${product.NO_OF_PRODUCTS > 0 ? "In Stock" : "Out of Stock"}</p>
                                <a href="product.html?id=${product.PRODUCTID}" class="view-button">View Details</a>
                                <button class="add-to-cart" data-product-id="${product.PRODUCTID}" ${product.NO_OF_PRODUCTS === 0 ? "disabled" : ""}>
                                    ${product.NO_OF_PRODUCTS > 0 ? "Add to Cart" : "Out of Stock"}
                                </button>
                            </div>
                        `;
                    });

                    // Add event listeners to "Add to Cart" buttons
                    document.querySelectorAll(".add-to-cart").forEach(button => {
                        button.addEventListener("click", function () {
                            const productId = parseInt(this.getAttribute("data-product-id"));
                            addToCart(productId);
                        });
                    });
                }

                // Initial render of all products
                renderProducts(products);
            } else {
                console.error("Failed to load products:", data.message);
            }
        })
        .catch(error => console.error("Error loading products:", error));
});

// Function to add product to cart via backend API
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
