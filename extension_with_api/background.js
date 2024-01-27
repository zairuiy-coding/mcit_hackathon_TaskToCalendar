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

        // Create the ICS content and log it to the console
        const icsContent = createICSContent(taskDetails);
        console.log(icsContent); // This will print the ICS content to the console

        // Only if icsContent is not null, proceed to download the file
        if (icsContent) {
            // Generating and downloading the ICS file
            downloadICSFile(icsContent, `${taskDetails.taskName}.ics`);
        } else {
            // Handle the case where icsContent is null or not properly created
            console.error('Failed to create ICS content.');
            // Optionally, inform the user with a message or some UI indication
            // For example, an alert, modal, or adding an error message to the page
            alert('Unable to generate the calendar file due to an error.');
        }
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
    // Helper function to format date to ICS format
    function formatDateToICS(dateString) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date format');
            return null;
        }
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '').slice(0, -1) + 'Z';
    }

    // Destructuring task details
    const { taskName, dueDate, notes } = taskDetails;

    // Calculate start and end date-times for the event
    const startDateTime = new Date(dueDate);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Adds 1 hour to start time

    // Building the ICS content
    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${taskName || 'Unnamed Task'}`,
        `DESCRIPTION:${notes || ''}`,
        `DTSTART:${formatDateToICS(startDateTime)}`,
        `DTEND:${formatDateToICS(endDateTime)}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
}

// Function to download the ICS file
function downloadICSFile(icsContent, filename) {
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = window.URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
}

// Function to be called from the in-page script
function saveAndDownloadTask(taskDetails) {
    const icsContent = createICSContent(taskDetails);
    if (icsContent) {
        downloadICSFile(icsContent, `${taskDetails.taskName}.ics`);
    } else {
        alert('Error generating calendar file. Please check the task details.');
    }
}

// Expose the function to the global window object
window.saveAndDownloadTask = saveAndDownloadTask;