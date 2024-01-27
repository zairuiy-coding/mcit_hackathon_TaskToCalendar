function extractAssignmentFromURL(url) {
  // Extract the last segment of the URL
  const urlPattern = /\/([^\/]+)\/?$/;
  const match = url.match(urlPattern);
  if (match) {
    // Check if the extracted segment matches typical assignment patterns
    const assignmentPattern = /^(?:assignment|homework|hw|project|projects|quiz)\s*#?\d+/i;
    const segment = match[1].replace(/-/g, ' ');
    if (assignmentPattern.test(segment)) {
      return segment;
    }
  }
  return null;
}

function extractAssignmentName(text) {
  const assignmentNamePattern = /(?:assignment|homework|hw|project|projects|quiz)\s*#?\d+/i;
  const match = text.match(assignmentNamePattern);
  return match ? match[0] : null;
}

function extractDueDate(text) {
  // Revised regular expression to match various due date formats including "Jan 27 at 7:30am"
  const dueDatePattern = /(?:\b(mon|tue|wed|thu|fri|sat|sun)\b,?\s*)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{1,2}(?:st|nd|rd|th)?(?:\s*(?:@|at)\s*(\d{1,2}:\d{2}(?:[ ]?[APap][Mm])?))?/i;

  const match = text.match(dueDatePattern);
  return match ? match[0] : null;
}

function extractCourseName(text) {
  const courseNamePattern = /\b(CIT|CIS)\s?\d{3,4}\b/i;
  const match = text.match(courseNamePattern);
  return match ? match[0] : null;
}

function scrapePageForAssignmentInfo() {
  // First, try to extract assignment name from URL
  const assignmentNameFromURL = extractAssignmentFromURL(window.location.href);

  // If assignment name is not found in URL, scrape the page
  const assignmentName = assignmentNameFromURL || extractAssignmentName(document.body.innerText);
  const dueDate = extractDueDate(document.body.innerText);
  const courseName = extractCourseName(document.body.innerText);


  // Log the results
  console.log('Assignment Name:', assignmentName);
  console.log('Due Date:', dueDate);
  console.log('Course Name:', courseName);

  // Send the scraped data to the background script if dueDate is found
  if (assignmentName || dueDate || courseName) {
      chrome.runtime.sendMessage({
          action: 'processData',
          data: { assignmentName, dueDate }
      });
  }
}

// Execute the scrape function when the page loads
window.onload = scrapePageForAssignmentInfo;
