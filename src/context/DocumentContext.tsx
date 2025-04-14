import React, { createContext, useContext, useState, ReactNode } from "react";
import { sendDocumentEmail } from "../services/emailService";

export interface Recipient {
  email: string;
  role: "signer" | "viewer" | "cc";
  status: "pending" | "completed" | "rejected";
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: Date;
  status: "pending" | "completed" | "rejected";
  recipients: Recipient[];
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (
    document: Omit<Document, "id" | "createdAt" | "status"> & {
      recipients: Omit<Recipient, "status">[];
    },
  ) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(
  undefined,
);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

export const DocumentProvider = ({ children }: DocumentProviderProps) => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "doc-1",
      name: "Leave Application Letter.pdf",
      url: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80",
      type: "application/pdf",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      status: "pending",
      recipients: [
        {
          email: "manager@example.com",
          role: "signer",
          status: "pending",
        },
      ],
    },
    {
      id: "doc-2",
      name: "Rental Agreement.pdf",
      url: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80",
      type: "application/pdf",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: "completed",
      recipients: [
        {
          email: "tenant@example.com",
          role: "signer",
          status: "completed",
        },
        {
          email: "agent@example.com",
          role: "viewer",
          status: "completed",
        },
      ],
    },
  ]);

  const addDocument = async (
    newDoc: Omit<Document, "id" | "createdAt" | "status"> & {
      recipients: Omit<Recipient, "status">[];
    },
  ) => {
    const newDocument: Document = {
      ...newDoc,
      id: `doc-${Date.now()}`,
      createdAt: new Date(),
      status: "pending",
      recipients: newDoc.recipients.map((recipient) => ({
        ...recipient,
        status: "pending",
      })),
    };

    setDocuments((prev) => [newDocument, ...prev]);

    // Send emails to all recipients
    console.log(
      `Attempting to send emails to ${newDocument.recipients.length} recipients`,
    );

    for (const recipient of newDocument.recipients) {
      try {
        console.log(
          `Sending email to ${recipient.email} with role ${recipient.role}`,
        );

        const result = await sendDocumentEmail({
          to_email: recipient.email,
          document_name: newDocument.name,
          document_url: newDocument.url,
          role: recipient.role,
          message: `You have received a document "${newDocument.name}" that requires your ${recipient.role === "signer" ? "signature" : recipient.role === "viewer" ? "review" : "attention"}.`,
        });

        if (result) {
          console.log(`✅ Email sent to ${recipient.email} successfully`);
        } else {
          console.error(
            `❌ Email sending to ${recipient.email} returned false`,
          );
        }
      } catch (error) {
        console.error(`❌ Failed to send email to ${recipient.email}:`, error);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
        }
      }
    }
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, ...updates } : doc)),
    );
  };

  return (
    <DocumentContext.Provider
      value={{ documents, addDocument, deleteDocument, updateDocument }}
    >
      {children}
    </DocumentContext.Provider>
  );
};
