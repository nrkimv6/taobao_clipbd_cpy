document.getElementById('clickMe').addEventListener('click', () => {
    // alert('Hello from your Chrome extension!');

    if( !navigator || !navigator.clipboard ) return;

    navigator.clipboard.read().then(data => {
        console.log("clipboard read start");
        for (let item of data) {
            console.log(item.types);  // This will print the available formats for each item on the clipboard.
        }
    });
    navigator.clipboard.read().then(data => {
        for (let item of data) {
            if (item.types.includes('text/html')) {
                
                console.log("clipboard read html");
                item.getType('text/html').then(blob => {
                    blob.text().then(html => {
                        console.log(html);  // This will print the HTML content of the clipboard.
                        readhtml(html);
                    });
                });
            }
        }
    });

    navigator.clipboard.read().then(data => {
        for (let item of data) {
            if (item.types.includes('image/png')) {  // or 'image/jpeg', 'image/gif', etc.
                item.getType('image/png').then(blob => {
                    console.log("image detexted!");
                    let imgURL = URL.createObjectURL(blob);
                    // Now, you can use imgURL as the 'src' for an <img> element to display the image.
                    let img = document.createElement('img');
                    img.src = imgURL;
                    document.body.appendChild(img);
                    
                    console.log(imgURL);
                });
            }
        }
    });
    
    

    console.log("end reading clipboard");
});

function extractDataFromPage(doc, orderIndex, itemIndex) {
    // Base selector considering multiple items from the same shop
    try {
        let baseSelector = `#tp-bought-root > div:nth-child(${orderIndex}) > div > table`;
        return extractItem(doc, baseSelector, itemIndex);

    } catch (error) {
        console.error("Error while extracting data:", error.message);
        return null;  // or however you wish to handle the error
    }
}


function extractItem(doc, baseSelector, itemIndex) {
    let data = {};

    let headerBase = `${baseSelector} > tbody:nth-child(1) > tr`;
    let itemBase = `${baseSelector} > tbody:nth-child(3) > tr:nth-child(${itemIndex})`;

    // 1. Item Number
    data.itemNumber = doc.querySelector(`${headerBase} > td:nth-child(1) > span > span:nth-child(3) > font > font`)?.textContent;

    // 2. Date
    let date = doc.querySelector(`${headerBase} > td:nth-child(1) > label > span > font > font`)?.textContent;
    data.date = date?.replace('Order', '').trim();

    // 3. Title
    data.titleLink = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(1) > a:nth-child(1)`)?.href;

    // 4. Link
    data.linkText = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(1) > a:nth-child(1) > span:nth-child(2) > font > font`)?.textContent;

    // 5. Image
    data.imageSrc = doc.querySelector(`${itemBase} > td:nth-child(1) > div > a > img`)?.src;

    // 6. Option
    data.size = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(2) > span:nth-child(1) > span:nth-child(3) > font > font`)?.textContent;
    data.styleOrColor = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(2) > span > span:nth-child(3) > font > font`)?.textContent;

    // 7. Price
    data.price = doc.querySelector(`${itemBase} > td:nth-child(2) > div > p:nth-child(2) > span:nth-child(2) > font > font`)?.textContent;

    // 8. Count
    data.count = doc.querySelector(`${itemBase} > td:nth-child(3) > div > p > font > font`)?.textContent;

    // 9. Total Price of This Shop
    data.totalPrice = doc.querySelector(`${baseSelector} > tbody:nth-child(3) > tr > td:nth-child(5) > div > div > p > strong > span:nth-child(2) > font > font`)?.textContent;

    // 10. Ship Fee
    data.shipFee = doc.querySelector(`${itemBase} > td:nth-child(5) > div > p > span:nth-child(2) > font > font`)?.textContent;

    // 11. Discount (Assuming 0 as per your previous info)
    data.discount = 0;

    // 12. TrackingNumber
    data.TrackingNumber = doc.querySelector(`#list-bought-items > div:nth-child(${orderIndex + 18}) > div > div > div > div.tm-tooltip-inner > div > div > span:nth-child(3) > font > font`)?.textContent;

    return data;
}
function extractDataFromPartOfPage(doc, orderIndex, itemIndex) {

    // Base selector considering multiple items from the same shop
    try {
        let baseSelector = `div:nth-child(${orderIndex}) > div > table`;
        return extractItem(doc, baseSelector, itemIndex);

    } catch (error) {
        console.error("Error while extracting data:", error.message);
        return null;  // or however you wish to handle the error
    }
}


function readhtml(clipboardData){
    let parser = new DOMParser();
    let doc = parser.parseFromString(clipboardData, 'text/html');

    let datas=[];
    
    // Extract items data
    let orderIndex = 7; // starting point
    let itemIndex = 1;  // starting point

    while (doc.querySelector(`#tp-bought-root > div:nth-child(${orderIndex}) > div > table`)) {
        console.log("item detection start #1");
        let data = extractDataFromPage(doc, orderIndex, itemIndex);
        console.log(data);
        if( data){
            datas.push(data);

            // If another item exists within this order, increase the itemIndex
            if (doc.querySelector(`#tp-bought-root > div:nth-child(${orderIndex}) > div > table > tbody:nth-child(3) > tr:nth-child(${itemIndex + 1})`)) {
                itemIndex++;
            } else {
                // Move to the next order and reset itemIndex
                orderIndex += 1; // I've used 2, based on the pattern you shared. Adjust if needed.
                itemIndex = 1;
            }
        }
        else{
            orderIndex++;
        }
    }

    if(datas.length == 0){
        orderIndex=1;
        itemIndex = 1;

        while (doc.querySelector(`div:nth-child(${orderIndex}) > div > table`)) {
            console.log("item detection start #2");
            let data = extractDataFromPartOfPage(doc, orderIndex, itemIndex);
            console.log(data);

            if( data ){
                datas.push(data);
        
                // If another item exists within this order, increase the itemIndex
                if (doc.querySelector(`div:nth-child(${orderIndex}) > div > table > tbody:nth-child(3) > tr:nth-child(${itemIndex + 1})`)) {
                    itemIndex++;
                } else {
                    // Move to the next order and reset itemIndex
                    orderIndex += 1; // I've used 2, based on the pattern you shared. Adjust if needed.
                    itemIndex = 1;
                }
            }
            else{
                orderIndex++;
            }
        }
    }

    console.log(datas);
}