// for background processing

const openai_api_key = "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"


async function chatGPTRequest(pageContent) {
    // Fetch request to OpenAI API
    const request = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openai_api_key}`,
        },
        body: JSON.stringify({
            messages: [
                {
                    role: "system",
                    content: `You are a virtual assistant specialized in organizing assignment tasks for students. When a user sends you the content of their assignment webpage, your role is to extract and compile key information. Specifically, identify the assignment name, course number, due date and time, and provide a concise abstract or note about the assignment (limited to 50 words). 
            Format your response in JSON, with each piece of information clearly labeled. Use double-quoted property names and ensure that any string values are properly escaped. Do not include any explanatory text outside of this JSON structure. Your response should look like this:            
            {
              "taskName": "Extracted task name",
              "courseName": "Course number",
              "dueDate": "Due date and time (if no exact time, assuming 23:59)"
              "notes": "Brief abstract or note about the assignment"
            }`,
                    // due date 这里在导入到日历时需要考虑转换成YYYY-MM-DD HH:MM的格式
                },
                {
                    role: "user",
                    content: pageContent
                },
            ],
            max_tokens: 4096,
            temperature: 0.8,
            model: "gpt-3.5-turbo",
        }),
    });

    // Parsing the JSON response
    const data = await request.json();
    console.log("chatGPTRequest: ", data.choices[0].message.content);
    return data.choices[0].message.content;
}

// Function to process the page content and auto-fill the task editor
async function autoFillTaskEditer(pageContent) {
    try {
        // Obtaining response from chatGPTRequest function
        const response = await chatGPTRequest(pageContent);
        // Parsing the JSON response
        const taskDetails = JSON.parse(response);

        // Filling the form fields with extracted data
        fillTaskDetails(taskDetails);

        // Generating and downloading the ICS file
        downloadICSFile(createICSContent(taskDetails), `${taskDetails.taskName}.ics`);
    } catch (error) {
        // Error handling
        console.error('autoFillTaskEditer error:', error);
    }
}

// Function to fill in the task details in the form
function fillTaskDetails(taskDetails) {
    // Assigning values to form elements
    document.getElementById('taskName').value = taskDetails.taskName || '';
    document.getElementById('courseName').value = taskDetails.courseName || '';
    document.getElementById('dueDate').value = taskDetails.dueDate || '';
    document.getElementById('notes').value = taskDetails.notes || '';
}

// Function to create ICS (Calendar) content from task details
function createICSContent(taskDetails) {
    // Function to convert JavaScript Date object to ICS format
    // ICS date format is "YYYYMMDDTHHMMSSZ" (e.g., "20240101T235900Z" for Jan 1, 2024, at 23:59 UTC)
    function formatDateToICS(date) {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '').replace('T', 'T').replace('Z', 'Z');
    }

    // Extracting relevant information from taskDetails
    const { taskName, dueDate, notes } = taskDetails;

    // Handling the date format
    const startDateTime = new Date(dueDate); // Assuming dueDate is a correct date string
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Event end time, e.g., 1 hour later

    // Building the ICS content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${taskName || 'Unnamed Event'}`,
        `DESCRIPTION:${notes || ''}`,
        `DTSTART:${formatDateToICS(startDateTime)}`, // Event start time
        `DTEND:${formatDateToICS(endDateTime)}`, // Event end time
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
}


function downloadICSFile(icsContent, filename) {
    // Create a Blob from the ICS content
    const blob = new Blob([icsContent], { type: 'text/calendar' });

    // Create a link element
    const link = document.createElement('a');

    // Set the download attribute with the filename
    link.download = filename;

    // Create a URL for the blob and set it as the link's href
    link.href = window.URL.createObjectURL(blob);

    // Append the link to the document
    document.body.appendChild(link);

    // Programmatically click the link to trigger the download
    link.click();

    // Remove the link after downloading
    document.body.removeChild(link);

    // Clean up the URL object
    window.URL.revokeObjectURL(link.href);
}

// Event listener for the 'Clip Page' button
document.getElementById('clipButton').addEventListener('click', () => {
    // Triggering the autoFillTaskEditer function with page content
    autoFillTaskEditer('The page content that needs to be sent to OpenAI API');
});

// Event listener for the 'Export to Calendar' button
document.getElementById('exportButton').addEventListener('click', () => {
    // Triggering the autoFillTaskEditer function with page content
    autoFillTaskEditer('The page content that needs to be sent to OpenAI API');
});

document.getElementById('submitbutton2').addEventListener('click', () => {
    // Example logic for generating a To-Do List
    // This could be replaced with a more complex logic depending on your needs

    // Fetch or generate a list of tasks. This might come from a webpage, user input, or any other source.
    const tasks = [
        { title: "Task 1", dueDate: "2024-01-01" },
        { title: "Task 2", dueDate: "2024-01-02" },
        // More tasks...
    ];

    // Get the element where the tasks will be displayed
    const taskListElement = document.querySelector('.task-list');

    // Clear existing tasks
    taskListElement.innerHTML = '';

    // Add each task to the task list
    tasks.forEach(task => {
        // Create an element for the task
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.textContent = `${task.title} - Due: ${task.dueDate}`;

        // Append the task element to the task list
        taskListElement.appendChild(taskElement);
    });
});

