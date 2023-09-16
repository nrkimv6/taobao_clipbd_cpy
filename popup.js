document.getElementById('clickMe').addEventListener('click', () => {
    // alert('Hello from your Chrome extension!');

    if (!navigator || !navigator.clipboard) return;

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
        return extractItem(doc, baseSelector, orderIndex, itemIndex);

    } catch (error) {
        console.error("Error while extracting data:", error.message);
        return null;  // or however you wish to handle the error
    }
}


function extractItem_org(doc, baseSelector, orderIndex, itemIndex) {
    let data = {};

    let headerBase = `${baseSelector} > tbody:nth-child(1) > tr`;
    let itemBase = `${baseSelector} > tbody:nth-child(3) > tr:nth-child(${itemIndex})`;

    console.log('baseSelector '+baseSelector);
    console.log('headerBase '+headerBase);
    console.log('itemBase '+itemBase);

    // 1. Item Number
    // div#viewer > div:nth-of-type({x}).index-mod__order-container___1ur4-.js-order-container > div.bought-wrapper-mod__trade-order___2lrzV > table.bought-table-mod__table___AnaXt.bought-wrapper-mod__table___3xFFM > tbody.bought-wrapper-mod__head___2vnqo > tr > td.bought-wrapper-mod__head-info-cell___29cDO > span > span:nth-of-type(3) > font > font.selected
    console.log('itemNumber '+`${headerBase} > td:nth-child(1) > span > span:nth-child(3) > font > font`);
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

//doc==div#viewer
function extractItem(doc, baseSelector, orderIndex, itemIndex) {
    let data = {};

    let headerBase = `${baseSelector} > tbody > tr`;
    let itemBase = `${baseSelector} > tbody:nth-child(3) > tr:nth-child(${itemIndex})`;
 
    console.log('baseSelector '+baseSelector);
    console.log('headerBase '+headerBase);
    console.log('itemBase '+itemBase);
    console.log('orderIndex '+orderIndex);
    console.log('itemIndex '+itemIndex);

    // 1. Order Number
    // div#viewer > div:nth-of-type({x}).index-mod__order-container___1ur4-.js-order-container > div.bought-wrapper-mod__trade-order___2lrzV > table.bought-table-mod__table___AnaXt.bought-wrapper-mod__table___3xFFM > tbody.bought-wrapper-mod__head___2vnqo > tr > td.bought-wrapper-mod__head-info-cell___29cDO > span > span:nth-of-type(3) > font > font.selected
    // div#viewer > div:nth-of-type({x}).js-order-container > div > table > tbody > tr > td > span > span:nth-of-type(3) > font > font
    console.log('itemNumber '+`${headerBase} > td:nth-child(1) > span > span:nth-child(3) > font > font`);
    data.itemNumber = doc.querySelector(`${headerBase} > td:nth-child(1) > span > span:nth-child(3) > font > font`)?.textContent;

    // 2. Date
    // let date = doc.querySelector(`${headerBase_org} > td:nth-child(1) > label > span > font > font`)?.textContent;
    let date = doc.querySelector(`${headerBase} > td > label > span > font > font`)?.textContent;
    data.date = date?.replace('Order', '').trim();

    // 3. Title
    // data.titleLink = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(1) > a:nth-child(1)`)?.href;
    data.titleLink = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(1) > a:nth-child(1)`)?.href;

    // 4. Link
    data.linkText = doc.querySelector(`${itemBase} >  td > div > div:nth-of-type(2) > p`)?.textContent;
    //div#viewer > div:nth-of-type(4).index-mod__order-container___1ur4-.js-order-container > div.bought-wrapper-mod__trade-order___2lrzV > table.bought-table-mod__table___AnaXt.bought-wrapper-mod__table___3xFFM > tbody:nth-of-type(2) > tr:nth-of-type({x}) > td.sol-mod__no-br___36X3g > div.ml-mod__container___2DOxT.production-mod__production___123Ax.suborder-mod__production___3WebF > div:nth-of-type(2) > p.selected:nth-of-type({x})
    //div#viewer > div:nth-of-type(4).js-order-container > div > table > tbody:nth-of-type(2) > tr:nth-of-type({x}) > td > div:nth-of-type(2) > p.selected:nth-of-type({x})
    console.log('title '+doc.querySelector(`${itemBase} >  td > div > div:nth-of-type(2) > p`)?.textContent);

    // 5. Image
    // data.imageSrc = doc.querySelector(`${itemBase} > td:nth-child(1) > div > a > img`)?.src;
    data.imageSrc = doc.querySelector(`${itemBase} > td:nth-child(1) > div  > div > a > img`)?.src;

    // 6. Option
    data.size = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(2) > span:nth-child(2) > span:nth-child(3) > font > font`)?.textContent;
    data.styleOrColor = doc.querySelector(`${itemBase} > td:nth-child(1) > div > div:nth-child(2) > p:nth-child(2) > span:nth-child(1) > span:nth-child(3) > font > font`)?.textContent;
   
    // 7-1. Price1
    data.price1 = doc.querySelector(`${itemBase} > td:nth-child(2) > div > p > span:nth-child(2) > font > font`)?.textContent;

    // 7-2. Price2
    data.price2 = doc.querySelector(`${itemBase} > td:nth-child(2) > div > p:nth-child(2) > span:nth-child(2) > font > font`)?.textContent;



    // 8. Count
    data.count = doc.querySelector(`${itemBase} > td:nth-child(3) > div > p > font > font`)?.textContent;

    // 9. Total Price of This Shop
    data.totalPrice = doc.querySelector(`${baseSelector} > tbody:nth-child(3) > tr > td:nth-child(5) > div > div > p > strong > span:nth-child(2) > font > font`)?.textContent;

    // 10. Ship Fee
    data.shipFee = doc.querySelector(`${itemBase} > td:nth-child(5) > div > p > span:nth-child(2) > font > font`)?.textContent;

    // 11. Discount (Assuming 0 as per your previous info)
    data.discount = 0;

    // 12. TrackingNumber
    // data.TrackingNumber = doc.querySelector(`#list-bought-items > div:nth-child(${orderIndex + 18}) > div > div > div > div.tm-tooltip-inner > div > div > span:nth-child(3) > font > font`)?.textContent;

    return data;
}
function extractDataFromPartOfPage(doc, orderIndex, itemIndex) {

    // Base selector considering multiple items from the same shop
    try {
        let baseSelector = `div:nth-child(${orderIndex}) > div > table`;
        return extractItem(doc, baseSelector, orderIndex, itemIndex);

    } catch (error) {
        console.error("Error while extracting data:", error.message);
        return null;  // or however you wish to handle the error
    }
}


function readhtml(clipboardData) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(clipboardData, 'text/html');

    let datas = [];

    // Extract items data
    let orderIndex = 7; // starting point
    let itemIndex = 1;  // starting point

    while (doc.querySelector(`#tp-bought-root > div:nth-child(${orderIndex}) > div > table`)) {
        console.log("item detection start #1");
        let data = extractDataFromPage(doc, orderIndex, itemIndex);
        console.log(data);
        if (data) {
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
        else {
            orderIndex++;
        }
    }

    if (datas.length == -1) {
        orderIndex = 1;
        itemIndex = 1;

        while (doc.querySelector(`div:nth-child(${orderIndex}) > div > table`)) {
            console.log("item detection start #2");
            let data = extractDataFromPartOfPage(doc, orderIndex, itemIndex);
            console.log(data);

            if (data) {
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
            else {
                orderIndex++;
            }
        }
    }

    if (datas.length == 0) {
        itemIndex = 1;

        // let divs = [...doc.querySelectorAll('div')];
        let divs = [...doc.querySelectorAll('div:not(div div)')];

        console.log(divs.length);

        for (let i = 0; i < divs.length; i++) {
            orderIndex = 1 + i;

            let div = divs[i];

            // Check if parent div's classname starts with "index-mod__order-container___"
            if (div.className.startsWith("index-mod__order-container___")) {

                // Check if there's a direct child div with a data-id attribute
                let childDiv = div.querySelector('div[data-id]');

                if (childDiv) {
                    // ... your processing logic here ...
                    console.log("item detection start #2");
                    let data = extractDataFromPartOfPage(doc, orderIndex, itemIndex);
                    console.log(data);

                    if (data) {
                        datas.push(data);
                        console.log(`item detection start #2-(${itemIndex}`);

                        let trchilds = childDiv.querySelector(`div > table > tbody:nth-child(3) > tr:nth-child(${itemIndex + 1})`);

                        while (trchilds) {

                            let data = extractDataFromPartOfPage(doc, orderIndex, itemIndex);
                            console.log(data);

                            if (data) {
                                datas.push(data);
                            }
                            itemIndex++;
                            trchilds = childDiv.querySelector(`div > table > tbody:nth-child(3) > tr:nth-child(${itemIndex + 1})`);
                        }
                        // Move to the next order and reset itemIndex
                        //orderIndex += 1; // I've used 2, based on the pattern you shared. Adjust if needed.
                        itemIndex = 1;
                    }

                }
            }
        }

        // while (doc.querySelector(`div:nth-child(${orderIndex}) > div > table`)) {
        //     console.log("item detection start #2");
        //     let data = extractDataFromPartOfPage(doc, orderIndex, itemIndex);
        //     console.log(data);

        //     if( data ){
        //         datas.push(data);

        //         // If another item exists within this order, increase the itemIndex
        //         if (doc.querySelector(`div:nth-child(${orderIndex}) > div > table > tbody:nth-child(3) > tr:nth-child(${itemIndex + 1})`)) {
        //             itemIndex++;
        //         } else {
        //             // Move to the next order and reset itemIndex
        //             orderIndex += 1; // I've used 2, based on the pattern you shared. Adjust if needed.
        //             itemIndex = 1;
        //         }
        //     }
        //     else{
        //         orderIndex++;
        //     }
        // }
    }

    const mappedDatas = datas.map(({price1, price2, ...rest}) => ({
        ...rest,
        price: price2 ? price2 : price1
      }));
      
    console.log(mappedDatas);
    renderComponents(mappedDatas);
}



// // Function to create a component for each item
// function createComponent(item) {
//     // Create a new div for the component
//     const component = document.createElement('div');

//     // Populate the component with data
//     component.innerHTML = `
//         <p>Date: <span>${item.date}</span></p>
//         <p>Order Number: <span>${item.itemNumber}</span></p>
//         <p>Store Name: <span>${item.linkText}</span></p>
//         <img src="${item.imageSrc}" alt="${item.linkText}" width="80" height="80">
//         <p>Price: <span>${item.price}</span></p>
//         <p>Count: <span>${item.count}</span></p>
//         <p>Total Price: <span>${item.totalPrice}</span></p>
//     `;

//     return component;
// }
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log(`Data ${text} copied!`);
    });
}

function createComponent(item) {
    const component = document.createElement('div');
    component.setAttribute('data-item-id', item.id);

    // Separate data creation and button creation to make the code clearer
    const elements = [
        { label: 'Date', value: item.date },
        { label: 'Order Number', value: item.itemNumber },
        { label: 'Store Name', value: item.linkText },
        { type: 'img', src: item.imageSrc, alt: item.linkText },
        { label: 'titleLink', value: item.titleLink },
        { label: 'Price', value: item.price },
        { label: 'Count', value: item.count },
        { label: 'Option_size', value: item.size },
        { label: 'Option_style', value: item.styleOrColor },
    ];

    elements.forEach(el => {
        const childComponent = document.createElement('div');
        if (el.type === 'img') {
            const img = document.createElement('img');
            img.src = el.src;
            img.alt = el.alt;
            img.width = 80;
            img.height = 80;
            childComponent.appendChild(img);

            // Add a copy button for the image URL
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', () => copyToClipboard(img.src));
            childComponent.appendChild(copyBtn);
        } else {
            childComponent.innerHTML = `${el.label}: <span>${el.value}</span>`;
            
            // Add a copy button for the text
            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.addEventListener('click', () => copyToClipboard(el.value));
            childComponent.appendChild(copyBtn);
        }
        component.appendChild(childComponent);
    });
    const hrcomp = document.createElement('hr');
    component.appendChild(hrcomp);

    return component;
}


// Render all components
function renderComponents(data) {
    const container = document.getElementById('container');
    data.forEach(item => {
        const component = createComponent(item);
        container.appendChild(component);
    });
}


