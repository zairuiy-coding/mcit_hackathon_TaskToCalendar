// UI, working with popup.html

document.getElementById('processData').addEventListener('click', () => {
    const data = document.getElementById('taskData').value;
    // Send data to background.js for processing
    chrome.runtime.sendMessage({ action: 'processData', data: data });
});

