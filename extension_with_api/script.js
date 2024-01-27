document.addEventListener('DOMContentLoaded', function () {
    // Modal display logic
    var modal = document.getElementById('clippingModal');
    var clipButton = document.getElementById('clipButton');
    var closeSpan = document.getElementsByClassName('close')[0];

    clipButton.onclick = function () {
        modal.style.display = 'block';
    };

    closeSpan.onclick = function () {
        modal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Save button logic
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.addEventListener('click', function () {
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

        // Call the function from background.js to handle ICS creation and download
        if (window.saveAndDownloadTask) {
            window.saveAndDownloadTask(taskDetails);
        }

        // Close the modal after saving
        modal.style.display = 'none';
    });

    // Cancel button logic
    const cancelBtn = document.getElementById('cancelBtn');
    cancelBtn.addEventListener('click', function () {
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
document.getElementById('exportButton').addEventListener('click', function () {
    // Logic to export selected tasks to calendar
    console.log('Export button clicked');
});
