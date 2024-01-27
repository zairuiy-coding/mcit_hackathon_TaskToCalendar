// for background processing

const openai_api_key = "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"


async function chatGPTRequest(pageContent) {

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
    
    const data = await request.json();
    console.log("chatGPTRequest: ", data.choices[0].message.content);
    return data.choices[0].message.content;
    }


async function autoFillTaskEditer(pageContent) {
    try {
        // Call the chatGPTRequest function and wait for the response
        const response = await chatGPTRequest(pageContent);

        // Assuming the response is a JSON string, parse it into an object
        const taskDetails = JSON.parse(response);

        // Fill the form fields with the response data
        document.getElementById('taskName').value = taskDetails.taskName || '';
        document.getElementById('courseName').value = taskDetails.courseName || '';
        document.getElementById('dueDate').value = taskDetails.dueDate || ''; // Make sure the date is in 'YYYY-MM-DD' format
        document.getElementById('notes').value = taskDetails.notes || '';

        // Now generate the ICS content using the details
        const icsContent = createICSContent(taskDetails);

        // Trigger download of the ICS file
        downloadICSFile(icsContent, `${taskDetails.taskName}.ics`);

    } catch (error) {
        console.error('autoFillTaskEditer error:', error);
        // Handle the error (e.g., show an error message to the user)
    }
}
    
    // You would call autoFillTaskEditer like this, passing the page content:
    // autoFillTaskEditer('The page content that needs to be sent to OpenAI API');

async function createICSContent(taskDetails) {
  // Convert due date to the ICS format
  // Example dueDate: '2024-02-20 23:59'
  const dueDateTime = new Date(taskDetails.dueDate);
  const icsDueDate = dueDateTime.toISOString().replace(/-|:|\.\d\d\d/g, '');

  // Create the .ics content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${taskDetails.taskName}`,
    `DESCRIPTION:${taskDetails.notes}`,
    `DTSTART:${icsDueDate}`, // Start time in YYYYMMDDTHHmmss format
    `DTEND:${icsDueDate}`,   // End time in YYYYMMDDTHHmmss format, can be the same as start if not specified
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
}

function downloadICSFile(icsContent, filename) {
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}


    
