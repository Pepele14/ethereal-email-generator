// backend/server.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Store generated accounts (in-memory storage for simplicity)
// In a production app, you might use a database
const generatedAccounts = [];

// Route to generate email accounts
app.post("/api/generate-emails", async (req, res) => {
  try {
    const count = Math.min(req.body.count || 10, 20); // Limit to max 20 accounts at once
    const newAccounts = [];

    for (let i = 0; i < count; i++) {
      // Create a test account using Ethereal
      const testAccount = await nodemailer.createTestAccount();

      const accountInfo = {
        id: Date.now() + i, // Simple unique ID
        email: testAccount.user,
        password: testAccount.pass,
        createdAt: new Date().toISOString(),
        accessUrl: `https://ethereal.email/login?username=${encodeURIComponent(
          testAccount.user
        )}&password=${encodeURIComponent(testAccount.pass)}`,
      };

      newAccounts.push(accountInfo);
      generatedAccounts.push(accountInfo);
    }

    res.json({
      success: true,
      message: `Successfully generated ${count} email accounts`,
      accounts: newAccounts,
    });
  } catch (error) {
    console.error("Error generating email accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate email accounts",
      error: error.message,
    });
  }
});

// Route to get all previously generated accounts
app.get("/api/accounts", (req, res) => {
  res.json({
    success: true,
    total: generatedAccounts.length,
    accounts: generatedAccounts,
  });
});

// Route to delete an account from the stored list
app.delete("/api/accounts/:id", (req, res) => {
  const accountId = parseInt(req.params.id);
  const initialLength = generatedAccounts.length;

  // Filter out the account with the matching ID
  const index = generatedAccounts.findIndex(
    (account) => account.id === accountId
  );

  if (index !== -1) {
    generatedAccounts.splice(index, 1);
    res.json({
      success: true,
      message: "Account removed from list",
      accountId,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "Account not found",
      accountId,
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});
