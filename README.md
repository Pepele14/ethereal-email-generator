# Ethereal Email Generator

A tool for generating temporary email accounts for testing purposes using Ethereal Email.

## Features

- Generate multiple email accounts with a single click
- View and manage generated email accounts
- Access email inboxes directly to test email functionality
- Copy email credentials with one click

## Setup

### Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

### Installation

1. Clone this repository:

git clone <repository-url>
cd ethereal-email-generator

2. Install backend dependencies:

cd backend
npm install

3. Start the backend server:

node server.js

The server will start on port 3000 by default.

4. Open the frontend:
   Simply open the `frontend/index.html` file in your web browser.

## Usage

1. Enter the number of email accounts you want to generate (1-20)
2. Click the "Generate Emails" button
3. View the generated email accounts
4. Click "Access Inbox" to view the inbox for a specific account
5. Use the "Copy Email" and "Copy Password" buttons to copy credentials

## Notes

- Generated email accounts are temporary and will expire after a few hours
- This tool is intended for testing purposes only
- All data is stored in memory and will be lost when the server restarts

## License

MIT
