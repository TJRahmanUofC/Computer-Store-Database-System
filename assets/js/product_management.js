document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category-select");
    const productListContainer = document.getElementById("product-list-container");

    let categories = [];
    let products = [];

    
    function fetchData() {
        Promise.all([
            fetch("http://127.0.0.1:5000/api/admin/products", { method: "GET", credentials: "include" }),
            fetch("http://127.0.0.1:5000/api/categories", { method: "GET", credentials: "include" })
        ])
        .then(async ([productRes, categoryRes]) => {
            const productData = await productRes.json();
            const categoryData = await categoryRes.json();
    
            if (productData.success && categoryData.success) {
                products = productData.products;
                categories = categoryData.categories.map(cat => cat.CATEGORY_NAME);
                populateCategoryDropdown();
            } else {
                throw new Error("Failed to fetch product/category data.");
            }
        })
        .catch(error => {
            console.error("Error loading products and categories:", error);
            productListContainer.innerHTML = "<p>Failed to load categories and products.</p>";
        });
    }

    // populate category dropdown, updates if new categories are added or removed
    function populateCategoryDropdown() {
        categorySelect.innerHTML = '<option value="">-- Select a Category --</option>'; // Reset dropdown
        categories.forEach(categoryName => {
            const option = document.createElement("option");
            option.value = categoryName;
            option.textContent = categoryName;
            categorySelect.appendChild(option);
        });
    }

    // Handle category selection
    categorySelect.addEventListener("change", function () {
        const selectedCategory = this.value;

        if (!selectedCategory) {
            productListContainer.innerHTML = "<p>Select a category to view products.</p>";
            return;
        }

        const filteredProducts = products.filter(product => product.CATEGORY_NAME === selectedCategory);

        if (filteredProducts.length === 0) {
            productListContainer.innerHTML = "<p>No products found in this category.</p>";
            return;
        }

        productListContainer.innerHTML = ""; // Clear previous content

        filteredProducts.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.className = "product-item";

            productDiv.innerHTML = `
                <h3>${product.NAME}</h3>
                <p><strong>Price:</strong> $${product.PRICE}</p>
                <p><strong>Stock:</strong> 
                    <input type="number" class="product-stock" value="${product.NO_OF_PRODUCTS}" min="0" />
                    <button class="update-stock-button">Update Stock</button>
                </p>
                <button class="remove-product-button">Remove Product</button>
            `;

            const stockInput = productDiv.querySelector(".product-stock");
            const updateStockButton = productDiv.querySelector(".update-stock-button");
            const removeProductButton = productDiv.querySelector(".remove-product-button");

            // update stock functionality
            updateStockButton.addEventListener("click", function () {
                const newStock = parseInt(stockInput.value);
                if (isNaN(newStock) || newStock < 0) {
                    alert("Please enter a valid stock number.");
                    return;
                }
            
                fetch(`http://127.0.0.1:5000/api/admin/products/${product.PRODUCTID}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        name: product.NAME,
                        price: product.PRICE,
                        quantity: newStock
                    })
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        product.NO_OF_PRODUCTS = newStock;
                        alert("Stock updated successfully!");
                    } else {
                        alert("Failed to update stock: " + data.message);
                    }
                })
                .catch(err => {
                    console.error("Error updating stock:", err);
                    alert("Error updating stock. Try again.");
                });
            });

            // remove product functionality
            removeProductButton.addEventListener("click", function () {
                if (confirm(`Are you sure you want to remove ${product.NAME}?`)) {
                    fetch(`http://127.0.0.1:5000/api/admin/products/${product.PRODUCTID}`, {
                        method: "DELETE",
                        credentials: "include"
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert("Product removed successfully!");
                            productDiv.remove();
            
                            // Update the products array and refresh categories
                            products = products.filter(p => p.PRODUCTID !== product.PRODUCTID);
                            categories = [...new Set(products.map(p => p.CATEGORY_NAME))];
                            populateCategoryDropdown();
                        } else {
                            alert("Failed to remove product: " + data.message);
                        }
                    })
                    .catch(err => {
                        console.error("Error removing product:", err);
                        alert("Error removing product. Try again.");
                    });
                }
            });

            productListContainer.appendChild(productDiv);
        });
    });

    // Initial fetch of data
    fetchData();
});
