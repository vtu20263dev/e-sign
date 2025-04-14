import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyCENkkLz5oI-0EjNF5lhV0V3mZCEPHjcxs";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `Virtu Tech – AI-Powered E-Signature Platform System Instructions

You are also capable of creating templates. When a user asks to create a template, guide them through the process by asking questions about the template type, fields needed, and recipient roles. For templates, focus on creating reusable structures that can be applied to multiple documents of the same type.

This is an AI-powered e-signature platform with a chat-based interface for creating, signing, and completing documents. The system should simplify document creation, automate workflows, and assist users efficiently.

- When a user enters the platform, display:
"Welcome to Virtu Tech! How can I help you?"
If the request is document-related, proceed. Otherwise, respond with:
"I can't help you with that."

- Make the chat process more interactive and easy, by asking questions one-by-one for user to complete the document creating to getting sign. For example: If user requested to create a leave letter document, first ask name, after that email, after that reason, like that.

- Document creation: If user request to create the document for the signature, understand the type of document requested and ask the required details to create the document. For example - If user requested to create a leave letter document for office, then you should understand the document type very well and ask the user workflow(if required according to document type), here the workflow with required details would be User details field, Manager details field and HR details field. Automate the fields placement and Make sure that signing workflow is included at the last of document. Supported fields: signature, initials, stamp, date signed, name, email, company, title, text, number, checkbox, dropdown, radio button, drawing, formula, attachment, note, approve, and decline.
Note: After asking all the required details to the user then only create the document, once the document is created it should review by user and click send button.

- Auto fill the general details like document created today's date without asking to the user, this make easy for user to create the document and send for signing.

- Branding & Personalization: All documents should include:
"Document created with Virtu Tech." Allow users to customize the document on their own if they don't want the branding of platform. This customize branding may includes name, logo, color scheme, email templates and created via chat.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DocumentInfo {
  content: string;
  recipients: Array<{ email: string; role: string }>;
  documentType: string;
  isComplete: boolean;
}

export const generateChatResponse = async (
  messages: ChatMessage[],
): Promise<string> => {
  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Format messages for Gemini
    const formattedMessages = messages.map((msg) => {
      return {
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      };
    });

    // Add system prompt as the first user message if not already present
    if (!formattedMessages.some((msg) => msg.parts[0].text === SYSTEM_PROMPT)) {
      formattedMessages.unshift({
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      });
    }

    // Start a chat session
    const chat = model.startChat({
      history: formattedMessages,
      generationConfig: {
        temperature: 1,
        topP: 1,
        topK: 1,
        maxOutputTokens: 4375,
      },
    });

    // Generate response
    const result = await chat.sendMessage("");
    const response = result.response;
    const text = response.text();

    return text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm sorry, there was an error processing your request. Please try again.";
  }
};

export const extractDocumentInfo = (messages: ChatMessage[]): DocumentInfo => {
  let documentContent = "";
  let documentType = "";
  let isComplete = false;
  const recipients: Array<{ email: string; role: string }> = [];

  // Check if document creation is complete
  const lastAssistantMessage = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  if (lastAssistantMessage) {
    // Check if the last message contains a document
    if (
      lastAssistantMessage.content.includes("---") &&
      (lastAssistantMessage.content.includes("Signature") ||
        lastAssistantMessage.content.includes("signature") ||
        lastAssistantMessage.content.includes("Approval"))
    ) {
      isComplete = true;

      // Extract document content
      const contentMatch =
        lastAssistantMessage.content.match(/---\s*([\s\S]*?)---/m);
      if (contentMatch && contentMatch[1]) {
        documentContent = contentMatch[1].trim();
      } else {
        // If no match with ---, try to extract the document content another way
        const lines = lastAssistantMessage.content.split("\n");
        let documentStarted = false;
        let documentLines = [];

        for (const line of lines) {
          if (
            line.includes("Here's the final") ||
            line.includes("I will now send this")
          ) {
            documentStarted = true;
            continue;
          }

          if (documentStarted && line.trim() !== "") {
            documentLines.push(line);
          }

          if (documentStarted && line.includes("Signature Workflow:")) {
            break;
          }
        }

        if (documentLines.length > 0) {
          documentContent = documentLines.join("\n");
        }
      }

      // Extract document type
      if (lastAssistantMessage.content.toLowerCase().includes("leave letter")) {
        documentType = "Leave Letter";
      } else if (
        lastAssistantMessage.content.toLowerCase().includes("rental agreement")
      ) {
        documentType = "Rental Agreement";
      } else if (
        lastAssistantMessage.content.toLowerCase().includes("loan application")
      ) {
        documentType = "Loan Application";
      } else {
        documentType = "Document";
      }

      // Extract recipient emails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const allEmails = lastAssistantMessage.content.match(emailRegex) || [];

      // Determine roles based on context
      allEmails.forEach((email) => {
        let role = "signer";
        const lowerContent = lastAssistantMessage.content.toLowerCase();

        // Check for context around the email
        const emailIndex = lowerContent.indexOf(email.toLowerCase());
        const contextBefore = lowerContent.substring(
          Math.max(0, emailIndex - 50),
          emailIndex,
        );

        if (
          contextBefore.includes("manager") ||
          contextBefore.includes("supervisor")
        ) {
          role = "signer";
        } else if (
          contextBefore.includes("hr") ||
          contextBefore.includes("human resources")
        ) {
          role = "signer";
        } else if (
          contextBefore.includes("cc") ||
          contextBefore.includes("copy")
        ) {
          role = "cc";
        } else if (
          contextBefore.includes("view") ||
          contextBefore.includes("reviewer")
        ) {
          role = "viewer";
        }

        // Add to recipients if not already present
        if (!recipients.some((r) => r.email === email)) {
          recipients.push({ email, role });
        }
      });

      // Look through all messages for emails if we didn't find any in the last message
      if (recipients.length === 0) {
        for (const message of messages) {
          const emailMatches = message.content.match(emailRegex) || [];
          emailMatches.forEach((email) => {
            if (!recipients.some((r) => r.email === email)) {
              recipients.push({ email, role: "signer" });
            }
          });
        }
      }
    }
  }

  // Replace placeholder date with actual date
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  documentContent = documentContent.replace(/\[Today's Date\]/g, today);

  // Add Virtu Tech branding if not present
  if (
    isComplete &&
    !documentContent.includes("Document created with Virtu Tech")
  ) {
    documentContent += "\n\nDocument created with Virtu Tech.";
  }

  return {
    content: documentContent,
    recipients,
    documentType,
    isComplete,
  };
};
