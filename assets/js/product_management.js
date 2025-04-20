document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category-select");
    const productListContainer = document.getElementById("product-list-container");

    let categories = [];
    let products = [];

    
    function fetchData() {
        fetch("../mockup.json")
            .then(response => response.json())
            .then(data => {
                categories = [...new Set(data.PRODUCT.map(product => product.CATEGORY_NAME))]; // Unique categories
                products = data.PRODUCT;
                // call dynamic update function
                populateCategoryDropdown();
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

                product.NO_OF_PRODUCTS = newStock;
                console.log("Updated Product Stock:", product);

                alert("Stock updated successfully!");
            });

            // remove product functionality
            removeProductButton.addEventListener("click", function () {
                if (confirm(`Are you sure you want to remove ${product.NAME}?`)) {
                    const productIndex = products.findIndex(p => p.PRODUCTID === product.PRODUCTID);
                    products.splice(productIndex, 1);
                    console.log("Updated Products List:", products);

                    alert("Product removed successfully!");
                    productDiv.remove();

                    // Refresh categories in case the removed product was the last in its category
                    categories = [...new Set(products.map(product => product.CATEGORY_NAME))];
                    populateCategoryDropdown();
                }
            });

            productListContainer.appendChild(productDiv);
        });
    });

    // Initial fetch of data
    fetchData();
});
