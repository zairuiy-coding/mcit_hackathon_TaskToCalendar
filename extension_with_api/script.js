let taskList = []; // Global array to store tasks

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
        taskList.push(taskDetails);
        console.log('Task added:', taskDetails);
        // display the task in the UI
        addTaskToDisplay(taskDetails.taskName, taskDetails.courseName, taskDetails.dueDate, taskDetails.notes);

        // Close the modal after saving
        modal.style.display = 'none';
    });

    // Cancel button logic
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        // Close the modal
        modal.style.display = 'none';
    });

    // Export to Google Calendar button
    document.getElementById('exportToGoogleCalendar').addEventListener('click', function() {
        exportTasksToGoogleCalendar(taskList); // You need to define this function
    });

    // Export to Apple Calendar button
    document.getElementById('exportToAppleCalendar').addEventListener('click', function() {
        exportTasksToAppleCalendar(taskList); // You need to define this function
    });
});

// Function to add a task to the task list
function addTaskToDisplay(taskName, courseName, dueDate, note) {
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

function exportTasksToAppleCalendar(tasks) {
    // Logic to create and download an iCal file for Apple Calendar
}


function exportTasksToGoogleCalendar(tasks) {
    // Logic to export tasks to Google Calendar
    // This will involve authentication and using Google Calendar API
}

