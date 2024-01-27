document.addEventListener('DOMContentLoaded', function() {
    // Modal display logic
    var modal = document.getElementById('clippingModal');
    var clipButton = document.getElementById('clipButton');
    var closeSpan = document.getElementsByClassName('close')[0];

    clipButton.onclick = function() {
        modal.style.display = 'block';

        // Send message to content script to start scraping when 'Clip Page' is clicked
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "clipPage"});
        });
    };

    closeSpan.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };


    // Listener for receiving messages from background.js
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "updatePopupForm") {

            console.log("message recieved from content.js");

            // Populate the form fields with received data
            document.getElementById('taskName').value = request.data.assignmentName || '';
            document.getElementById('courseName').value = request.data.courseName || '';
            document.getElementById('dueDate').value = request.data.dueDate || '';
            // You can also update the 'notes' field if necessary
        }
    });



    // Save button logic
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', function() {
        const taskDetails = {
            taskName: document.getElementById('taskName').value,
            courseName: document.getElementById('courseName').value,
            dueDate: document.getElementById('dueDate').value,
            notes: document.getElementById('notes').value
        };

        // Logic to save the task details
        console.log('Saving task:', taskDetails);
        // Add the task to the task list
        addTask(taskDetails.taskName, taskDetails.courseName, taskDetails.dueDate, taskDetails.notes);

        // Close the modal after saving
        modal.style.display = 'none';
    });

    // Cancel button logic
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        // Close the modal
        modal.style.display = 'none';
    });
});

// Function to add a task to the task list
function addTask(taskName, courseName, dueDate, note) {
    const taskList = document.querySelector('.task-list');
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');
    taskItem.innerHTML = `
        <strong>${taskName}</strong>
        <p>Course: ${courseName}</p>
        <p>Due: ${dueDate}</p>
        <p>Note: ${note}</p>
    `;
    taskList.appendChild(taskItem);
}

// Placeholder for export functionality
document.getElementById('exportButton').addEventListener('click', function() {
    // Logic to export selected tasks to calendar
    console.log('Export button clicked');
});
