import emailjs from "emailjs-com";

// Hardcoded email service credentials
const SERVICE_ID = "service_default";
const TEMPLATE_ID = "template_g5y1jhb";
const USER_ID = "user_default";

export interface EmailParams {
  to_email: string;
  to_name?: string;
  document_name: string;
  document_url: string;
  sender_name?: string;
  message?: string;
  role: string;
}

export const sendDocumentEmail = async (
  params: EmailParams,
): Promise<boolean> => {
  try {
    // Log the parameters being sent (excluding sensitive info)
    console.log("Sending email with params:", {
      to_email: params.to_email,
      document_name: params.document_name,
      role: params.role,
    });

    // Initialize EmailJS with the hardcoded user ID before sending
    emailjs.init(USER_ID);

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, params);

    console.log("Email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return false;
  }
};

// Initialize EmailJS
export const initEmailService = () => {
  emailjs.init(USER_ID);
  console.log("EmailJS initialized with default credentials");
};
