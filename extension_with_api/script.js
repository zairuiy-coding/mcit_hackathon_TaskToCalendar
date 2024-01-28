// manages user interactions and data processing within the popup

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

function parseCustomDate(dateStr) {

    const momentDate = moment.tz(dateStr, "MMMM DD @ hh:mmA", "America/New_York");
    if (!momentDate.isValid()) {
        console.error("Failed to parse date:", dateStr);
        return null;
    }
    return momentDate.toDate();
}



function formatToiCalDate(date) {
    // Format the date to iCal format with New York timezone
    return moment(date).tz("America/New_York").format('YYYYMMDDTHHmm00');
}

function escapeICSValue(str) {
    return str.replace(/[\r\n]+/g, ' ').trim();
}

// export to Apple Calendar
function exportTasksToAppleCalendar(tasks) {
    console.log("Starting export to Apple Calendar with tasks:", tasks);

    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Your Company//Your Product//EN\n';

    tasks.forEach(task => {
        console.log("Processing task for iCal:", task);

        let startDate = formatToiCalDate(new Date(parseCustomDate(task.dueDate).getTime() - 60 * 60000)); // Assuming 1 hour duration
        let endDate = formatToiCalDate(parseCustomDate(task.dueDate));

        console.log("Formatted Start Date:", startDate, "End Date:", endDate);

        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `UID:${task.taskName}@yourdomain.com\n`;
        icsContent += `DTSTART:${startDate}\n`;
        icsContent += `DTEND:${endDate}\n`;
        icsContent += `SUMMARY:${escapeICSValue(task.taskName)}\n`;
        icsContent += `DESCRIPTION:${escapeICSValue(task.notes)}\n`;
        icsContent += 'END:VEVENT\n';
    });

    icsContent += 'END:VCALENDAR';
    console.log("Final iCal content:", icsContent);

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    console.log("Blob URL created:", url);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.ics';
    document.body.appendChild(a);
    a.click();
    console.log("Download triggered for iCal file");

    window.URL.revokeObjectURL(url);
    console.log("Blob URL revoked");
}



function exportTasksToGoogleCalendar(tasks) {
    // Logic to export tasks to Google Calendar
    // This will involve authentication and using Google Calendar API
}

