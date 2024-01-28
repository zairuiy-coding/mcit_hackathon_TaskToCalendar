// manages user interactions and data processing within the popup

let taskList = []; // Global array to store tasks


document.addEventListener('DOMContentLoaded', function() {
    // Modal display logic
    var modal = document.getElementById('clippingModal');
    var clipButton = document.getElementById('clipButton');
    var closeSpan = document.getElementsByClassName('close')[0];

    // Load tasks from local storage
    chrome.storage.local.get(['tasks'], function(result) {
        if (result.tasks && Array.isArray(result.tasks)) {
            taskList = result.tasks;
            refreshTaskListDisplay();
        }
    });

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
            document.getElementById('notes').value = request.data.url || '';
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
        saveTasks(); // Save to local storage
        console.log('Task added:', taskDetails);

         // Refresh the display of tasks
        refreshTaskListDisplay();



        // Close the modal after saving
        modal.style.display = 'none';
    });

    // Cancel button logic
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function() {
        // Close the modal
        modal.style.display = 'none';
    });

    // Export to Calendar button
    document.getElementById('exportToAppleCalendar').addEventListener('click', function() {
        exportTasksToAppleCalendar(taskList); // You need to define this function
    });
});


// function to make url in note clickable
function createClickableLink(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}


// Function to refresh the task list display
function refreshTaskListDisplay() {
    const taskListContainer = document.querySelector('.task-list');
    taskListContainer.innerHTML = ''; // Clear the current display

    taskList.forEach((task, index) => {
        const taskItem = document.createElement('div');
        const taskWithClickableLink = createClickableLink(task.notes); // Assuming task.notes contains the URL
        taskItem.classList.add('task-item');
        taskItem.innerHTML = `
            <strong>${task.taskName}</strong>
            <p>Course: ${task.courseName}</p>
            <p>Due: ${task.dueDate}</p>
            <p>Note: ${taskWithClickableLink}</p>
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        // Create the edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', function() {
            openEditModal(index); // Open the edit modal with the task index
        });

        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', function() {
            deleteTask(index);
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(deleteButton);
        taskItem.appendChild(buttonContainer); // Append the button container to the task item
        taskListContainer.appendChild(taskItem);
    });
}

// Function to delete a task
function deleteTask(index) {
    console.log("delete clicked");
    taskList.splice(index, 1); // Remove the task from the list
    saveTasks(); // Save to local storage
    refreshTaskListDisplay(); // Update the UI
}


////////////// TASK EDIT //////////////

// Modal for editing task details
const editModal = document.getElementById('editModal');
const editTaskNameInput = document.getElementById('editTaskName');
const editCourseNameInput = document.getElementById('editCourseName');
const editDueDateInput = document.getElementById('editDueDate');
const editNotesInput = document.getElementById('editNotes');
const editSaveBtn = document.getElementById('editSaveBtn');

let editingTaskIndex = null; // To track the task being edited

// Function to open the edit modal with task details
function openEditModal(index) {
    editingTaskIndex = index; // Set the task index being edited
    const taskToEdit = taskList[index];

    // Populate the edit modal with task details
    editTaskNameInput.value = taskToEdit.taskName;
    editCourseNameInput.value = taskToEdit.courseName;
    editDueDateInput.value = taskToEdit.dueDate;
    editNotesInput.value = taskToEdit.notes;

    // Show the edit modal
    editModal.style.display = 'block';
}

// Save edited task details
editSaveBtn.addEventListener('click', function() {
    if (editingTaskIndex !== null) {
        // Update the task in the taskList
        const editedTask = {
            taskName: editTaskNameInput.value,
            courseName: editCourseNameInput.value,
            dueDate: editDueDateInput.value,
            notes: editNotesInput.value
        };
        taskList[editingTaskIndex] = editedTask;
        saveTasks(); // Save to local storage
        refreshTaskListDisplay(); // Update the UI
        editingTaskIndex = null; // Reset the editingTaskIndex
        editModal.style.display = 'none'; // Close the edit modal
    }
});

// Close the edit modal when the close button is clicked
document.getElementById('editCloseBtn').addEventListener('click', function() {
    editModal.style.display = 'none';
});

// Close the edit modal when the "Cancel" button is clicked
document.getElementById('editCancelBtn').addEventListener('click', function() {
    editingTaskIndex = null; // Reset the editingTaskIndex
    editModal.style.display = 'none'; // Close the edit modal
});




////////////// SAVE TO LOCAL STORAGE //////////////

function saveTasks() {
    chrome.storage.local.set({ tasks: taskList }, function() {
        console.log('Tasks saved locally');
    });
}





////////////// EXPORT TO ICS //////////////

function parseCustomDate(dateStr) {
    // Manual parsing for the specific format: "11:59 pm on Monday, September 18"
    const specificFormatRegex = /(\d{1,2}:\d{2}\s*[apAP][mM])\s*on\s*([a-zA-Z]+),\s*([a-zA-Z]+)\s*(\d{1,2})/;
    if (specificFormatRegex.test(dateStr)) {
        const [, timePart, , monthPart, dayPart] = specificFormatRegex.exec(dateStr);
        // Construct a new date string in a more standard format
        const standardDateString = `${monthPart} ${dayPart}, ${new Date().getFullYear()} ${timePart}`;
        // Parse the new date string using a single format
        const momentDate = moment.tz(standardDateString, "MMMM DD, YYYY hh:mmA", "America/New_York");
        if (!momentDate.isValid()) {
            console.error("Failed to manually parse date:", standardDateString);
            return null;
        }
        return momentDate.toDate();
    }

    // Define date formats for parsing other formats
    const formats = [
        "MMMM DD @ hh:mmA",         // "February 07 @ 11:59PM"
        "MMM DD 'at' hh:mma",       // "Jan 27 at 7:30am"
        "MMM DD HH:mma",            // "Feb 04 23:50pm"
        "hh:mm a 'on' ddd, MMM DD", // "11:59 pm on Fri, Feb 02"
    ];

    // Parse using Moment.js with the above formats
    const momentDate = moment.tz(dateStr, formats, "America/New_York");
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
        icsContent += `UID:${task.courseName}${task.taskName}@yourdomain.com\n`;
        icsContent += `DTSTART:${startDate}\n`;
        icsContent += `DTEND:${endDate}\n`;
        icsContent += `SUMMARY:${escapeICSValue(`${task.courseName} ${task.taskName}`)}\n`; // Concatenate course and taskName
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

