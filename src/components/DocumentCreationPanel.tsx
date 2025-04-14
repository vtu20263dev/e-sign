import React, { useState, useEffect, useRef } from "react";
import DocumentInputSection from "./DocumentInputSection";
import DocumentPreviewSection, { Field } from "./DocumentPreviewSection";
import FieldPalette, { FieldType } from "./FieldPalette";
import RecipientSection from "./RecipientSection";
import { useDocuments } from "../context/DocumentContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Loader2 } from "lucide-react";
import {
  generateChatResponse,
  ChatMessage,
  extractDocumentInfo,
} from "../services/openaiService";

interface DocumentCreationPanelProps {
  onSendDocument?: (data: {
    document: {
      url: string;
      name: string;
      type: string;
    };
    recipients: Array<{
      email: string;
      role: "signer" | "viewer" | "cc";
    }>;
  }) => void;
}

const DocumentCreationPanel = ({
  onSendDocument = () => {},
}: DocumentCreationPanelProps) => {
  const navigate = useNavigate();
  const { addDocument } = useDocuments();
  const [isLoading, setIsLoading] = useState(false);
  const [document, setDocument] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "upload"
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [initialRecipients, setInitialRecipients] = useState<
    Array<{
      email: string;
      role: "signer" | "viewer" | "cc";
    }>
  >([]);
  const [documentFields, setDocumentFields] = useState<Field[]>([]);
  const [selectedField, setSelectedField] = useState<FieldType | null>(null);
  const [isEditMode, setIsEditMode] = useState(true);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      role: "assistant" as const,
      content: "Welcome to Virtu Tech! How can I help you?",
    };
    setChatMessages([welcomeMessage]);
  }, []);

  // Check for document completion in chat
  useEffect(() => {
    if (chatMessages.length > 1) {
      const documentInfo = extractDocumentInfo(chatMessages);

      if (documentInfo.isComplete && documentInfo.content) {
        // Create a data URL for the document content
        // Use a safer approach to encode content to base64
        let base64Content;
        try {
          // Try the standard approach first
          base64Content = btoa(
            unescape(encodeURIComponent(documentInfo.content)),
          );
        } catch (encodeError) {
          // Fallback to a more robust method
          const encoder = new TextEncoder();
          const bytes = encoder.encode(documentInfo.content);
          let binaryString = "";
          for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
          }
          base64Content = btoa(binaryString);
        }
        const dataUrl = `data:application/pdf;base64,${base64Content}`;

        setDocument({
          url: dataUrl,
          name: `${documentInfo.documentType || "Document"}.pdf`,
          type: "application/pdf",
        });

        // Set initial recipients
        if (documentInfo.recipients.length > 0) {
          const formattedRecipients = documentInfo.recipients.map(
            (recipient) => ({
              email: recipient.email,
              role: recipient.role as "signer" | "viewer" | "cc",
            }),
          );
          setInitialRecipients(formattedRecipients);
        }
      }
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: userInput,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await generateChatResponse([
        ...chatMessages,
        userMessage,
      ]);

      // Add AI response to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);

      // Check if document is complete
      const documentInfo = extractDocumentInfo([
        ...chatMessages,
        userMessage,
        assistantMessage,
      ]);

      if (documentInfo.isComplete && documentInfo.content) {
        // Create a data URL for the document content
        // Use a safer approach to encode content to base64
        let base64Content;
        try {
          // Try the standard approach first
          base64Content = btoa(
            unescape(encodeURIComponent(documentInfo.content)),
          );
        } catch (encodeError) {
          // Fallback to a more robust method
          const encoder = new TextEncoder();
          const bytes = encoder.encode(documentInfo.content);
          let binaryString = "";
          for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
          }
          base64Content = btoa(binaryString);
        }
        const dataUrl = `data:application/pdf;base64,${base64Content}`;

        setDocument({
          url: dataUrl,
          name: `${documentInfo.documentType || "Document"}.pdf`,
          type: "application/pdf",
        });

        // Set initial recipients
        if (documentInfo.recipients.length > 0) {
          const formattedRecipients = documentInfo.recipients.map(
            (recipient) => ({
              email: recipient.email,
              role: recipient.role as "signer" | "viewer" | "cc",
            }),
          );
          setInitialRecipients(formattedRecipients);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);

      // Add error message
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDocumentGenerate = async (prompt: string) => {
    setIsLoading(true);
    try {
      // Simulate document generation with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate document based on prompt keywords
      const promptLower = prompt.toLowerCase();
      let documentContent = "";
      let documentName = "";

      if (
        promptLower.includes("leave letter") ||
        promptLower.includes("leave application")
      ) {
        documentContent = generateLeaveLetterDocument(prompt);
        documentName = "Leave Application Letter.pdf";
      } else if (
        promptLower.includes("rental agreement") ||
        promptLower.includes("lease agreement")
      ) {
        documentContent = generateRentalAgreementDocument(prompt);
        documentName = "Rental Agreement.pdf";
      } else {
        // Generic document if no specific type is detected
        documentContent = generateGenericDocument(prompt);
        documentName = `Generated Document - ${prompt.substring(0, 20)}${prompt.length > 20 ? "..." : ""}.pdf`;
      }

      // Create a data URL for the document content
      // Use a safer approach to encode content to base64
      let base64Content;
      try {
        // Try the standard approach first
        base64Content = btoa(unescape(encodeURIComponent(documentContent)));
      } catch (encodeError) {
        // Fallback to a more robust method
        const encoder = new TextEncoder();
        const bytes = encoder.encode(documentContent);
        let binaryString = "";
        for (let i = 0; i < bytes.length; i++) {
          binaryString += String.fromCharCode(bytes[i]);
        }
        base64Content = btoa(binaryString);
      }
      const dataUrl = `data:application/pdf;base64,${base64Content}`;

      setDocument({
        url: dataUrl,
        name: documentName,
        type: "application/pdf",
      });
    } catch (error) {
      console.error("Error generating document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a leave letter document
  const generateLeaveLetterDocument = (prompt: string) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      [COMPANY LETTERHEAD]
      
      ${currentDate}
      
      To: [Manager/HR Department]
      [Company Name]
      [Company Address]
      
      Subject: Application for Leave
      
      Dear [Recipient Name],
      
      I am writing to request leave from work for [Number of Days] days, starting from [Start Date] to [End Date] due to [Reason for Leave].
      
      During my absence, [Colleague Name] will handle my responsibilities and ensure that all pending tasks are completed on time. I will also be available via email for any urgent matters that may require my attention.
      
      I have completed all my pending tasks and have briefed my team about my absence. I will ensure a smooth handover before I leave.
      
      Thank you for your understanding and consideration. I look forward to your approval.
      
      Sincerely,
      
      [Your Name]
      [Your Position]
      [Your Employee ID]
      [Your Contact Information]
    `;
  };

  // Generate a rental agreement document
  const generateRentalAgreementDocument = (prompt: string) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      RESIDENTIAL RENTAL AGREEMENT
      
      THIS RENTAL AGREEMENT ("Agreement") is made and entered into on ${currentDate}, by and between:
      
      LANDLORD: [Landlord Name] ("Landlord")
      Address: [Landlord Address]
      Phone: [Landlord Phone]
      Email: [Landlord Email]
      
      AND
      
      TENANT(S): [Tenant Name] ("Tenant")
      Phone: [Tenant Phone]
      Email: [Tenant Email]
      
      1. PROPERTY
      Landlord hereby leases to Tenant, and Tenant hereby leases from Landlord, the residential property located at:
      [Property Address] ("the Premises").
      
      2. TERM
      The term of this Agreement shall be for [Lease Term] beginning on [Start Date] and ending on [End Date] ("Lease Term").
      
      3. RENT
      Tenant agrees to pay Landlord rent in the amount of $[Monthly Rent Amount] per month, payable in advance on the [Due Date] day of each month during the Lease Term.
      
      4. SECURITY DEPOSIT
      Upon execution of this Agreement, Tenant shall deposit with Landlord the sum of $[Security Deposit Amount] as a security deposit.
      
      5. UTILITIES
      Tenant shall be responsible for payment of the following utilities and services: [List of Utilities].
      
      6. USE OF PREMISES
      The Premises shall be used and occupied by Tenant exclusively as a private residence and for no other purpose.
      
      7. MAINTENANCE AND REPAIRS
      Tenant shall maintain the Premises in a clean and sanitary condition and shall not damage or misuse the Premises.
      
      8. SIGNATURES
      
      LANDLORD:
      
      ____________________________
      [Landlord Name]
      Date: [Signing Date]
      
      TENANT(S):
      
      ____________________________
      [Tenant Name]
      Date: [Signing Date]
    `;
  };

  // Generate a generic document
  const generateGenericDocument = (prompt: string) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
      DOCUMENT
      
      ${currentDate}
      
      RE: ${prompt}
      
      This document has been generated based on your request: "${prompt}"
      
      Please provide more specific details about the type of document you need (e.g., "leave letter", "rental agreement") to generate a more appropriate template.
      
      Thank you for using our document generation service.
    `;
  };

  const handleDocumentUpload = async (file: File) => {
    setIsLoading(true);
    try {
      // Use FileReader to create a data URL instead of a blob URL
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          // For Word documents, show a placeholder image since browsers can't display them directly
          const isWordDoc =
            file.type.includes("word") ||
            file.name.endsWith(".doc") ||
            file.name.endsWith(".docx");

          if (isWordDoc) {
            setDocument({
              url: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80", // Placeholder for Word docs
              name: file.name,
              type: file.type,
            });
          } else {
            setDocument({
              url: e.target.result as string,
              name: file.name,
              type: file.type,
            });
          }
        }
        setIsLoading(false);
      };

      reader.onerror = () => {
        console.error("Error reading file");
        setIsLoading(false);
      };

      // Read the file as a data URL
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing uploaded document:", error);
      setIsLoading(false);
    }
  };

  const handleSendDocument = async (
    recipients: Array<{
      email: string;
      role: "signer" | "viewer" | "cc";
    }>,
  ) => {
    if (!document) return;

    setIsLoading(true);

    try {
      // Add document to context (which now also sends emails)
      await addDocument({
        ...document,
        recipients,
      });

      // Call the onSendDocument callback
      onSendDocument({
        document,
        recipients,
      });

      // Navigate to documents page after sending
      navigate("/documents");
    } catch (error) {
      console.error("Error sending document:", error);
      // You could add error handling UI here
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field selection from palette
  const handleFieldSelect = (field: FieldType) => {
    setSelectedField(field);
  };

  // Handle adding a field to the document
  const handleAddField = (field: Field) => {
    setDocumentFields((prev) => [...prev, field]);
    // Reset selected field after adding
    setSelectedField(null);
  };

  // Handle field movement
  const handleFieldMove = (id: string, position: { x: number; y: number }) => {
    setDocumentFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, position } : field)),
    );
  };

  // Handle field resize
  const handleFieldResize = (
    id: string,
    size: { width: number; height: number },
  ) => {
    setDocumentFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, size } : field)),
    );
  };

  // Handle field value change
  const handleFieldValueChange = (id: string, value: string) => {
    setDocumentFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, value } : field)),
    );
  };

  // Handle field removal
  const handleFieldRemove = (id: string) => {
    setDocumentFields((prev) => prev.filter((field) => field.id !== id));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  return (
    <div className="w-full h-full bg-gray-50 p-6 flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Panel - Chat Interface and Document Upload */}
        <div className="flex flex-col gap-4 lg:col-span-3">
          {activeTab === "chat" ? (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="text-xl font-semibold mb-4">
                  Document Creation Assistant
                </div>

                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 max-h-[400px]"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {chatMessages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <div className="whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !userInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DocumentInputSection
              onDocumentUpload={handleDocumentUpload}
              isLoading={isLoading}
            />
          )}

          <div className="flex gap-2">
            <Button
              variant={activeTab === "chat" ? "default" : "outline"}
              onClick={() => setActiveTab("chat")}
              className="flex-1"
            >
              Chat Assistant
            </Button>
            <Button
              variant={activeTab === "upload" ? "default" : "outline"}
              onClick={() => setActiveTab("upload")}
              className="flex-1"
            >
              Upload Document
            </Button>
          </div>
        </div>

        {/* Document Preview - Middle section */}
        <div className="flex flex-col lg:col-span-7">
          <DocumentPreviewSection
            document={document || undefined}
            fields={documentFields}
            onAddField={handleAddField}
            onFieldMove={handleFieldMove}
            onFieldResize={handleFieldResize}
            onFieldValueChange={handleFieldValueChange}
            onFieldRemove={handleFieldRemove}
            isEditMode={isEditMode}
            selectedField={selectedField}
          />
        </div>

        {/* Right Panel - Field Palette */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {isEditMode && <FieldPalette onFieldSelect={handleFieldSelect} />}
        </div>
      </div>
      <div className="mt-auto">
        <RecipientSection
          onSend={handleSendDocument}
          isDocumentReady={!!document}
          initialRecipients={initialRecipients}
        />
      </div>
    </div>
  );
};

export default DocumentCreationPanel;
