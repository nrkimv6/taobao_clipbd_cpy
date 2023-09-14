chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request) return;
    if (request.action === 'getClipboardData') {

        if (!navigator || !navigator.clipboard) {

            console.log("not reading clipboard1");
            return;
        }
        navigator.clipboard.readText().then(clipboardData => {
            sendResponse({ data: clipboardData });
        }).catch(error => {
            sendResponse({ error: error.message });
        });

        // Indicate that the response is async
        console.log("end reading clipboard2");
        return true;
    }
});
