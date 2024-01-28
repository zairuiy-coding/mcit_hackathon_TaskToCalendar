# Task2Calendar Chrome Extension

## Introduction
Welcome to Task2Calendar, an innovative Chrome extension designed for students and educators. Our tool simplifies the management of academic assignments by transforming tasks from academic websites into calendar events seamlessly and efficiently.

## Project Overview
Task2Calendar stands out as a crucial tool in the realm of educational productivity. It excels in:

- **Scraping Web Pages:** Automatically extracts crucial details like assignment names, due dates, and course names from academic web pages.
- **User-Friendly Interface:** Offers a pop-up interface that is intuitive and easy to navigate, making task management straightforward.
- **Efficient Data Handling:** Employs local storage for task persistence, ensuring that your data is safe and retrievable.
- **Calendar Integration:** Facilitates exporting tasks to calendar applications, aiding in scheduling and time management.

Developed with a combination of JavaScript, HTML, CSS, and the Moment.js library, Task2Calendar is crafted to deliver a seamless user experience.

## Installation Guide
To integrate Task2Calendar into your workflow:
1. Clone or download the repository to your local system.
2. In Google Chrome, go to `chrome://extensions/`.
3. Activate 'Developer mode', and choose 'Load unpacked'.
4. Select the directory of the cloned or downloaded repository.

## How to Use
Maximize your productivity with Task2Calendar:
1. Access the extension by clicking its icon in the Chrome toolbar.
2. Visit any academic web page containing assignment information.
3. Utilize the 'Clip Current Page' function to automatically extract task details.
4. Modify task details as needed and save your changes.
5. Export your tasks as an `.ics` file for easy integration with most calendar applications.

## Directory Structure
The extension is structured as follows:
- `background.js`: Manages background processes and inter-script communication.
- `content.js`: Responsible for the extraction of task details from web pages.
- `manifest.json`: Contains metadata and configuration settings for the extension.
- `popup.html`: The HTML structure of the popup interface.
- `script.js`: Orchestrates user interactions within the popup and processes data.
- `styles.css`: Provides styling for the popup interface.
- `moment.js` & `moment-timezone-with-data.js`: Libraries utilized for handling dates and time zones.

## Contributing
Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**. For major changes, please open an issue first to discuss what you would like to change or add.
