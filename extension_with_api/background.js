chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processData") {
        console.log("Received message in background.js");

        // Process the data
        const processedData = {
            assignmentName: processAssignmentName(request.data.assignmentName),
            dueDate: processDueDate(request.data.dueDate),
            courseName: processCourseName(request.data.courseName)
        };

        // Send processed data to the popup script and handle response asynchronously
        chrome.runtime.sendMessage({action: "updatePopupForm", data: processedData}, response => {
            if (chrome.runtime.lastError) {
                // Handle error
                console.error("Error in sending message:", chrome.runtime.lastError);
            } else {
                // Handle success
                console.log("Message sent to frontend, response:", response);
            }
        });

        // Indicate that you will respond asynchronously
        return true;
    }
});

function processAssignmentName(assignmentName) {
    // Processing logic for assignment name
    return assignmentName;
}

function processDueDate(dueDate) {
    // Processing logic for due date
    return dueDate;
}

function processCourseName(courseName) {
    // Processing logic for course name
    return courseName;
}
