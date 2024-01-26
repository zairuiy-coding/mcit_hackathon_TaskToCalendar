// for background processing
// will handle the communication with the ChatGPT API and manage the extension's background tasks.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'processData') {
        // Send the data to the server for spaCy processing
        fetch('http://your-server.com/process', { // replace the placeholder with actual URL of server
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: message.data })
        })
        .then(response => response.json())
        .then(data => {
            // Process the response, generate a calendar file, or handle integration
        })
        .catch(error => console.error('Error:', error));
    }
});
