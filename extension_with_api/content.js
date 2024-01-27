function extractAssignmentName(text) {
    // Regular expression to match assignment names (e.g., "Assignment 1", "Homework #2")
    const assignmentNamePattern = /(?:assignment|homework|hw|project)\s*#?\d+/i;
    const match = text.match(assignmentNamePattern);
    return match ? match[0] : null;
  }
  
  function extractDueDate(text) {
    // Regular expression to match due dates (e.g., "Feb 14", "11:59pm", "February 14 at 11:59 PM")
    const dueDatePattern = /(?:\b(mon|tue|wed|thu|fri|sat|sun)\b,?\s*)?(?:@?\s*(\d{1,2}:\d{2}\s*(?:am|pm)))?\s*(?:on\s*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{1,2}(?:st|nd|rd|th)?,?\s*(?:\b(mon|tue|wed|thu|fri|sat|sun)\b)?/i;
  
    // "11:59 pm on Fri, Feb 02"
    // "due @ 11:59 pm on Feb 02"
    // "Fri, Feb 02 at 11:59 pm"
    // "Feb 02, 11:59 pm"
    // "Feb 02"
    const match = text.match(dueDatePattern);
    return match ? match[0] : null;
  }
  
  function scrapePageForAssignmentInfo() {
    // Get all the text content from the body of the page
    const bodyText = document.body.innerText;
  
    // Extract the assignment name and due date
    const assignmentName = extractAssignmentName(bodyText);
    const dueDate = extractDueDate(bodyText);
  
    // Log the results
    console.log('Assignment Name:', assignmentName);
    console.log('Due Date:', dueDate);
  
    // Send the scraped data to the background script if both assignmentName and dueDate are found
    if (assignmentName && dueDate) {
      chrome.runtime.sendMessage({
        action: 'processData',
        data: { assignmentName, dueDate }
      });
    }
  }
  
  // Execute the scrape function when the page loads
  window.onload = scrapePageForAssignmentInfo;
  