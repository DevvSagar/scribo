import nodemailer from "nodemailer";

export const createEmailTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_USER || !EMAIL_PASS) {
    const error = new Error("Email service is not configured.");
    error.statusCode = 503;
    error.publicMessage = "Email service is not configured right now.";
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
