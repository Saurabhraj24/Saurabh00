// Simple Express server to:
// - Serve the portfolio (index.html, CSS, JS)
// - Receive contact form submissions at POST /api/contact

const express = require("express");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;
const TO_EMAIL = process.env.TO_EMAIL || "saurabh2006july@gmail.com";

// Optional: load env vars from .env for local dev (no extra dependency needed)
// If you create a ".env" file (see .env.example), this will load it.
try {
  const dotenvPath = path.join(__dirname, ".env");
  if (fs.existsSync(dotenvPath)) {
    const raw = fs.readFileSync(dotenvPath, "utf8");
    raw.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eq = trimmed.indexOf("=");
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    });
  }
} catch (_) {
  // If .env can't be read, continue without it.
}

// Parse incoming JSON bodies
app.use(express.json());

// Serve all static files from the current directory (HTML, CSS, JS, assets)
app.use(express.static(__dirname));

// Helper: safely append contact messages to a JSON file
function saveContactMessage(payload) {
  const dataDir = path.join(__dirname, "data");
  const filePath = path.join(dataDir, "contact-messages.json");

  // Make sure the data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  let current = [];
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      current = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(current)) current = [];
    } catch (err) {
      current = [];
    }
  }

  current.push(payload);
  fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf8");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createMailTransport() {
  // Recommended: use a Gmail App Password (NOT your normal Gmail password).
  // Set these environment variables before running the server:
  // - SMTP_USER=yourgmail@gmail.com
  // - SMTP_PASS=your_gmail_app_password
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });
}

async function sendContactEmail(entry) {
  const transport = createMailTransport();
  if (!transport) {
    // Fallback: still store message locally in `data/contact-messages.json`.
    console.warn("SMTP not configured, fallback to local storage only.");
    return {
      sent: false,
      reason: "SMTP not configured"
    };
  }

  const subject = `New Portfolio Message from ${entry.name}`;
  const text = [
    `You received a new message from your portfolio contact form.`,
    ``,
    `Name: ${entry.name}`,
    `Email: ${entry.email}`,
    `Time: ${entry.createdAt}`,
    `IP: ${entry.ip}`,
    ``,
    `Message:`,
    entry.message
  ].join("\n");

  await transport.sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: TO_EMAIL,
    replyTo: entry.email, // so you can reply directly to the sender
    subject,
    text
  });

  return { sent: true };
}

// API endpoint to receive contact form data
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields."
    });
  }

  if (!isValidEmail(String(email))) {
    return res.status(400).json({
      success: false,
      error: "Please enter a valid email address."
    });
  }

  const entry = {
    name: String(name).trim(),
    email: String(email).trim(),
    message: String(message).trim(),
    ip: req.ip,
    createdAt: new Date().toISOString()
  };

  try {
    saveContactMessage(entry);
    const mailResult = await sendContactEmail(entry);
    return res.json({
      success: true,
      message: mailResult.sent
        ? "Message sent to email successfully."
        : "Message stored successfully (email not configured)."
    });
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return res.status(500).json({
      success: false,
      error: "Unable to save message right now."
    });
  }
});

// Fallback: send index.html for any unknown GET route (useful for direct linking)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});

