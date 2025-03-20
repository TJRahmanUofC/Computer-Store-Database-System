document.addEventListener("DOMContentLoaded", function () {
    fetch('mockup.json') // Ensure the correct path
        .then(response => response.json())
        .then(data => {
            let products = data.PRODUCT.slice(0, 6); // Get first 6 products
            let newArrivalsContainer = document.getElementById("new-arrivals");

            newArrivalsContainer.innerHTML = ""; // Clear existing content

            products.forEach(product => {
                newArrivalsContainer.innerHTML += `
                    <div class="product-card">
                        <img src="assets/images/${product.NAME.toLowerCase().replace(/ /g, "_")}.jpg" alt="${product.NAME}">
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
