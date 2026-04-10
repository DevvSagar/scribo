import nodemailer from "nodemailer";
import validator from "validator";

const MIN_NAME_LENGTH = 2;
const MIN_MESSAGE_LENGTH = 10;
const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 5000;

const normalizeField = (value) =>
  typeof value === "string" ? validator.trim(value.replace(/\s+/g, " ")) : "";

const normalizeMessage = (value) =>
  typeof value === "string" ? validator.trim(value.replace(/\r\n/g, "\n")) : "";

const validateContactInput = (body) => {
  const firstName = normalizeField(body.firstName);
  const lastName = normalizeField(body.lastName);
  const email = normalizeField(body.email);
  const message = normalizeMessage(body.message);
  const company = normalizeField(body.company);
  const errors = [];

  if (company) {
    errors.push("Invalid request.");
  }

  if (!validator.isLength(firstName, { min: MIN_NAME_LENGTH, max: MAX_NAME_LENGTH })) {
    errors.push("First name must be at least 2 characters.");
  }

  if (!validator.isLength(lastName, { min: MIN_NAME_LENGTH, max: MAX_NAME_LENGTH })) {
    errors.push("Last name must be at least 2 characters.");
  }

  if (!validator.isEmail(email)) {
    errors.push("Enter a valid email address.");
  }

  if (!validator.isLength(message, { min: MIN_MESSAGE_LENGTH, max: MAX_MESSAGE_LENGTH })) {
    errors.push("Message must be at least 10 characters.");
  }

  return {
    errors,
    values: {
      firstName: validator.stripLow(firstName),
      lastName: validator.stripLow(lastName),
      email: validator.normalizeEmail(email, { gmail_remove_dots: false }) || email,
      message: validator.stripLow(message, true),
    },
  };
};

const createTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    const error = new Error("Email service is not configured.");
    error.statusCode = 503;
    error.publicMessage = "Contact email is not configured right now. Please try again later.";
    throw error;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
};

export const sendContactEmail = async (req, res, next) => {
  try {
    const { errors, values } = validateContactInput(req.body || {});

    if (errors.length > 0) {
      res.status(400).json({
        error: "Please check the contact form and try again.",
        details: errors,
      });
      return;
    }

    const { firstName, lastName, email, message } = values;
    const fullName = `${firstName} ${lastName}`;
    const escapedFullName = validator.escape(fullName);
    const escapedEmail = validator.escape(email);
    const escapedMessage = validator.escape(message);
    const transporter = createTransporter();

    console.log(`[contact] New Message received`);

    await transporter.sendMail({
      from: `"Scribo Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `New Scribo contact message from ${fullName}`,
      text: [
        "New contact form submission",
        "",
        `Name: ${fullName}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: [
        "<h2>New contact form submission</h2>",
        `<p><strong>Name:</strong> ${escapedFullName}</p>`,
        `<p><strong>Email:</strong> ${escapedEmail}</p>`,
        "<p><strong>Message:</strong></p>",
        `<p>${escapedMessage.replace(/\n/g, "<br />")}</p>`,
      ].join(""),
    });

    res.status(200).json({
      message: "Message sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};
