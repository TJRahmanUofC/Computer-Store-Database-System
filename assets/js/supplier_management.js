document.addEventListener("DOMContentLoaded", function () {
    const supplierDeliveriesContainer = document.getElementById("supplier-deliveries");
    const acceptedDeliveriesContainer = document.getElementById("accepted-deliveries");

    // fetch supplier deliveries from mockup.json
    fetch("../mockup.json")
        .then(response => response.json())
        .then(data => {
            const deliveries = data.SUPPLIER_DELIVERY;
            const suppliers = data.SUPPLIER;

            supplierDeliveriesContainer.innerHTML = ""; // clear loading message

            deliveries.forEach(delivery => {
                const supplier = suppliers.find(s => s.SUPPLIER_ID === delivery.SUPPLIER_ID);

                // Skip deliveries that are already delivered
                if (delivery.STATUS.toLowerCase() === "delivered") {
                    const acceptedBlock = document.createElement("div");
                    acceptedBlock.className = "delivery-block";
                    acceptedBlock.innerHTML = `
                        <h3>Delivery ID: ${delivery.DELIVERY_NO}</h3>
                        <p><strong>Supplier:</strong> ${supplier ? supplier.NAME : "Unknown"}</p>
                        <p><strong>Status:</strong> ${delivery.STATUS}</p>
                        <p><strong>Delivery Date:</strong> ${delivery.DELIVERY_DATE}</p>
                    `;
                    acceptedDeliveriesContainer.appendChild(acceptedBlock);

                    // rremove "No accepted deliveries yet" message if still present
                    if (acceptedDeliveriesContainer.querySelector("p")) {
                        acceptedDeliveriesContainer.querySelector("p").remove();
                    }
                    return;
                }

                const deliveryBlock = document.createElement("div");
                deliveryBlock.className = "delivery-block";

                deliveryBlock.innerHTML = `
                    <h3>Delivery ID: ${delivery.DELIVERY_NO}</h3>
                    <p><strong>Supplier:</strong> ${supplier ? supplier.NAME : "Unknown"}</p>
                    <p><strong>Status:</strong> ${delivery.STATUS}</p>
                    <p><strong>Delivery Date:</strong> ${delivery.DELIVERY_DATE}</p>
                    <button class="accept-delivery-button" ${delivery.STATUS.toLowerCase() !== "arrived" ? "disabled" : ""}>
                        Accept Delivery
                    </button>
                `;
                //---------ADD SQL STUFF HERE I THINK---------------
                const acceptButton = deliveryBlock.querySelector(".accept-delivery-button");
                acceptButton.addEventListener("click", function () {
                    delivery.STATUS = "Delivered";

                    // move box to accepted deliveries
                    const acceptedBlock = deliveryBlock.cloneNode(true);
                    acceptedBlock.querySelector(".accept-delivery-button").remove();
                    acceptedDeliveriesContainer.appendChild(acceptedBlock);

                    // Remove "No accepted deliveries yet" message if present
                    if (acceptedDeliveriesContainer.querySelector("p")) {
                        acceptedDeliveriesContainer.querySelector("p").remove();
                    }

                    // ipdate the original list
                    deliveryBlock.remove();

                    // update the json data (simulate backend update)
                    console.log("Updated Deliveries:", deliveries);
                });

                supplierDeliveriesContainer.appendChild(deliveryBlock);
            });
        })
        .catch(error => {
            console.error("Error loading deliveries:", error);
            supplierDeliveriesContainer.innerHTML = "<p>Failed to load deliveries.</p>";
        });
});
