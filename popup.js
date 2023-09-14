document.getElementById('clickMe').addEventListener('click', () => {
    // alert('Hello from your Chrome extension!');

    if( !navigator || !navigator.clipboard ) return;

    // This will retrieve and process the clipboard data when the popup is opened.
    navigator.clipboard.readText().then(clipboardData => {
        console.log(clipboardData);
        // Use DOMParser to parse the HTML content
        let parser = new DOMParser();
        let doc = parser.parseFromString(clipboardData, 'text/html');

        // Extract required information
        let orderDate = doc.querySelector('.bought-wrapper-mod__create-time___yNWVS font').textContent;
        let orderNumber = doc.querySelector('.bought-wrapper-mod__thead-operations-container___2LwDA span').textContent;
        let storeName = doc.querySelector('.seller-mod__name___2IlQm font').textContent;

        // Update the popup content with the extracted data
        document.getElementById('orderDate').textContent = orderDate;
        document.getElementById('orderNumber').textContent = orderNumber;
        document.getElementById('storeName').textContent = storeName;

    }).catch(error => {
        console.error("Error reading clipboard:", error);
    });
    console.log("end reading clipboard");
});

chrome.runtime.sendMessage({action: 'getClipboardData'}, response => {
    if( !response ) {
        console.log("none reading clipboard");
        return;
    }
    if (response.data) {
        let clipboardData = response.data;

        console.log("current clipboard data...");
        console.log(clipboardData);

        // ... rest of your logic to process the clipboard data ...
    } else {
        console.error("Error reading clipboard:", response.error);
    }
    console.log("end reading clipboard1");
});

// Assuming you've already captured data from the clipboard into variable `clipboardData`

// // Use DOMParser to parse the HTML content
// let parser = new DOMParser();
// let doc = parser.parseFromString(clipboardData, 'text/html');

// // Extract required information
// let orderDate = doc.querySelector('.bought-wrapper-mod__create-time___yNWVS font').textContent;
// let orderNumber = doc.querySelector('.bought-wrapper-mod__thead-operations-container___2LwDA span').textContent;
// let storeName = doc.querySelector('.seller-mod__name___2IlQm font').textContent;

// // Create the POST data structure (you might want to add more fields as per your need)
// let postData = {
//     date: orderDate,
//     number: orderNumber,
//     store: storeName
// };

// // The `postData` can now be sent to your PHP server
// console.log(postData);


