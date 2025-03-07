// frontend/script.js
document.addEventListener("DOMContentLoaded", () => {
  // API URL - change this to match your backend server
  const API_URL = "http://localhost:3000/api";

  // DOM Elements
  const generateBtn = document.getElementById("generateBtn");
  const viewSavedBtn = document.getElementById("viewSavedBtn");
  const emailCountInput = document.getElementById("emailCount");
  const statusElement = document.getElementById("status");
  const loaderElement = document.getElementById("loader");
  const emailContainer = document.getElementById("emailContainer");
  const savedEmailContainer = document.getElementById("savedEmailContainer");

  // Tab Elements
  const newEmailsTab = document.getElementById("newEmailsTab");
  const savedEmailsTab = document.getElementById("savedEmailsTab");
  const newEmailsPanel = document.getElementById("newEmailsPanel");
  const savedEmailsPanel = document.getElementById("savedEmailsPanel");

  // State management
  let isGenerating = false;
  let generatedAccounts = [];
  let savedAccounts = [];

  // Helper Functions
  const showLoader = () => {
    loaderElement.classList.remove("hidden");
  };

  const hideLoader = () => {
    loaderElement.classList.add("hidden");
  };

  const setStatus = (message, type = "info") => {
    statusElement.textContent = message;
    statusElement.className = "status " + type;
  };

  const clearStatus = () => {
    statusElement.textContent = "";
    statusElement.className = "status";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Tab Switching
  newEmailsTab.addEventListener("click", () => {
    newEmailsTab.classList.add("active");
    savedEmailsTab.classList.remove("active");
    newEmailsPanel.classList.remove("hidden");
    savedEmailsPanel.classList.add("hidden");
  });

  savedEmailsTab.addEventListener("click", () => {
    savedEmailsTab.classList.add("active");
    newEmailsTab.classList.remove("active");
    savedEmailsPanel.classList.remove("hidden");
    newEmailsPanel.classList.add("hidden");
    fetchSavedAccounts();
  });

  // Copy to clipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setStatus("Copied to clipboard!", "success");
        setTimeout(clearStatus, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setStatus("Failed to copy to clipboard", "error");
      });
  };

  // Create email item element
  const createEmailElement = (account, isSaved = false) => {
    const emailItem = document.createElement("div");
    emailItem.className = "email-item";
    emailItem.dataset.id = account.id;

    const emailHeader = document.createElement("div");
    emailHeader.className = "email-header";

    const emailAddress = document.createElement("div");
    emailAddress.className = "email-address";
    emailAddress.textContent = account.email;

    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = formatDate(account.createdAt);

    emailHeader.appendChild(emailAddress);
    emailHeader.appendChild(timestamp);

    const credentialsRow = document.createElement("div");
    credentialsRow.className = "credentials-row";

    const emailCredential = document.createElement("div");
    emailCredential.className = "credential";
    emailCredential.textContent = `Email: ${account.email}`;

    const passwordCredential = document.createElement("div");
    passwordCredential.className = "credential";
    passwordCredential.textContent = `Password: ${account.password}`;

    credentialsRow.appendChild(emailCredential);
    credentialsRow.appendChild(passwordCredential);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const accessBtn = document.createElement("a");
    accessBtn.className = "action-btn access-btn";
    accessBtn.href = account.accessUrl;
    accessBtn.target = "_blank";
    accessBtn.textContent = "Access Inbox";

    const copyEmailBtn = document.createElement("button");
    copyEmailBtn.className = "action-btn copy-btn";
    copyEmailBtn.textContent = "Copy Email";
    copyEmailBtn.addEventListener("click", () =>
      copyToClipboard(account.email)
    );

    const copyPasswordBtn = document.createElement("button");
    copyPasswordBtn.className = "action-btn copy-btn";
    copyPasswordBtn.textContent = "Copy Password";
    copyPasswordBtn.addEventListener("click", () =>
      copyToClipboard(account.password)
    );

    btnGroup.appendChild(accessBtn);
    btnGroup.appendChild(copyEmailBtn);
    btnGroup.appendChild(copyPasswordBtn);

    if (isSaved) {
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "action-btn delete-btn";
      deleteBtn.textContent = "Remove";
      deleteBtn.addEventListener("click", () => deleteAccount(account.id));
      btnGroup.appendChild(deleteBtn);
    }

    emailItem.appendChild(emailHeader);
    emailItem.appendChild(credentialsRow);
    emailItem.appendChild(btnGroup);

    return emailItem;
  };

  // Generate Emails
  const generateEmails = async () => {
    if (isGenerating) return;

    const count = parseInt(emailCountInput.value) || 10;
    if (count < 1 || count > 20) {
      setStatus("Please enter a number between 1 and 20", "error");
      return;
    }

    try {
      isGenerating = true;
      showLoader();
      setStatus(`Generating ${count} email accounts...`, "info");
      emailContainer.innerHTML = "";

      const response = await fetch(`${API_URL}/generate-emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ count }),
      });

      const data = await response.json();

      if (data.success) {
        generatedAccounts = data.accounts;
        setStatus(
          `Successfully generated ${data.accounts.length} email accounts`,
          "success"
        );

        // Display the accounts
        data.accounts.forEach((account) => {
          const emailElement = createEmailElement(account);
          emailContainer.appendChild(emailElement);
        });

        // Switch to the newly generated tab
        newEmailsTab.click();
      } else {
        setStatus(`Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error generating emails:", error);
      setStatus(`Error: ${error.message}`, "error");
    } finally {
      isGenerating = false;
      hideLoader();
    }
  };

  // Fetch Saved Accounts
  const fetchSavedAccounts = async () => {
    try {
      showLoader();
      setStatus("Loading saved accounts...", "info");
      savedEmailContainer.innerHTML = "";

      const response = await fetch(`${API_URL}/accounts`);
      const data = await response.json();

      if (data.success) {
        savedAccounts = data.accounts;

        if (savedAccounts.length === 0) {
          setStatus("No saved accounts found", "info");
          savedEmailContainer.innerHTML =
            '<p class="no-accounts">No saved accounts found. Generate some emails first!</p>';
        } else {
          setStatus(`Loaded ${data.accounts.length} saved accounts`, "success");

          // Display the accounts
          data.accounts.forEach((account) => {
            const emailElement = createEmailElement(account, true);
            savedEmailContainer.appendChild(emailElement);
          });
        }
      } else {
        setStatus(`Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error fetching saved accounts:", error);
      setStatus(`Error: ${error.message}`, "error");
    } finally {
      hideLoader();
    }
  };

  // Delete Account
  const deleteAccount = async (accountId) => {
    try {
      showLoader();
      setStatus("Removing account...", "info");

      const response = await fetch(`${API_URL}/accounts/${accountId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setStatus("Account removed successfully", "success");

        // Remove from the UI
        const accountElement = document.querySelector(
          `.email-item[data-id="${accountId}"]`
        );
        if (accountElement) {
          accountElement.remove();
        }

        // Update the saved accounts list
        savedAccounts = savedAccounts.filter(
          (account) => account.id !== accountId
        );

        if (savedAccounts.length === 0) {
          savedEmailContainer.innerHTML =
            '<p class="no-accounts">No saved accounts found. Generate some emails first!</p>';
        }
      } else {
        setStatus(`Error: ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setStatus(`Error: ${error.message}`, "error");
    } finally {
      hideLoader();
    }
  };

  // Event Listeners
  generateBtn.addEventListener("click", generateEmails);
  viewSavedBtn.addEventListener("click", () => {
    savedEmailsTab.click();
  });

  // Initialize
  clearStatus();
});
