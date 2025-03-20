document.addEventListener("DOMContentLoaded", function () {
    // Load cart count from localStorage
    updateCartCount();

    // Fetch product data from mockup.json
    fetch('../mockup.json')
        .then(response => response.json())
        .then(data => {
            let products = data.PRODUCT;
            let productList = document.getElementById("product-list");

            // Function to render products
            function renderProducts(products) {
                productList.innerHTML = ""; // Clear existing content
                products.forEach(product => {
                    productList.innerHTML += `
                        <div class="product-card">
                            <img src="../assets/images/${product.NAME.toLowerCase().replace(/ /g, "_")}.jpg" alt="${product.NAME}">
                            <h3>${product.NAME}</h3>
                            <p>Category: ${product.CATEGORY_NAME}</p>
                            <p class="price">$${product.PRICE}</p>
                            <p class="stock-status">${product.STOCK > 0 ? "In Stock" : "Out of Stock"}</p>
                            <a href="product.html?id=${product.PRODUCTID}" class="view-button">View Details</a>
                            <button class="add-to-cart" data-product-id="${product.PRODUCTID}" ${product.STOCK === 0 ? "disabled" : ""}>
                                ${product.STOCK > 0 ? "Add to Cart" : "Out of Stock"}
                            </button>
                        </div>
                    `;
                });

                // Add event listeners to "Add to Cart" buttons
                document.querySelectorAll(".add-to-cart").forEach(button => {
                    button.addEventListener("click", function () {
                        const productId = parseInt(this.getAttribute("data-product-id"));
                        const product = products.find(p => p.PRODUCTID === productId);
                        addToCart(product);
                    });
                });
            }

            // Initial render of all products
            renderProducts(products);

            // Search and filter functionality
            document.getElementById("apply-filters").addEventListener("click", function () {
                const searchQuery = document.getElementById("search").value.toLowerCase();
                const categoryFilter = document.getElementById("category-filter").value;

                const filteredProducts = products.filter(product => {
                    const matchesSearch = product.NAME.toLowerCase().includes(searchQuery);
                    const matchesCategory = categoryFilter ? product.CATEGORY_NAME === categoryFilter : true;
                    return matchesSearch && matchesCategory;
                });

                renderProducts(filteredProducts);
            });
        })
        .catch(error => console.error("Error loading products:", error));
});

// Function to add product to cart and save in localStorage
function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

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

// Function to update cart count across pages
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById("cart-count").textContent = `Cart (${cartCount})`;
}
