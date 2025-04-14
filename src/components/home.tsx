import React, { useState } from "react";
import Header from "./Header";
import DocumentCreationPanel from "./DocumentCreationPanel";
import ConfirmationDialog from "./ConfirmationDialog";

type ConfirmationDialogType = "success" | "error" | "warning" | "info";

interface HomeProps {
  userName?: string;
  userAvatar?: string;
}

const Home = ({ userName = "John Doe", userAvatar }: HomeProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationDetails, setConfirmationDetails] = useState<{
    type: ConfirmationDialogType;
    title: string;
    description: string;
  }>({
    type: "success",
    title: "Document Sent Successfully",
    description:
      "Your document has been sent for signature. We will notify you when it's signed.",
  });

  const handleSendDocument = (data: {
    document: {
      url: string;
      name: string;
      type: string;
    };
    recipients: Array<{
      email: string;
      role: "signer" | "viewer" | "cc";
    }>;
  }) => {
    // In a real app, this would send the document to the recipients
    console.log("Sending document:", data);

    // Show success confirmation
    setConfirmationDetails({
      type: "success",
      title: "Document Sent Successfully",
      description: `Your document "${data.document.name}" has been sent to ${data.recipients.length} recipient(s) for signature.`,
    });
    setShowConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header userName={userName} userAvatar={userAvatar} />

      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">eSignature Platform</h1>
          <p className="text-gray-600">
            Create, upload, and send documents for electronic signatures
          </p>
        </div>

        <DocumentCreationPanel onSendDocument={handleSendDocument} />
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} eSignature Platform. All rights
            reserved.
          </p>
        </div>
      </footer>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={handleConfirmationClose}
        type={confirmationDetails.type}
        title={confirmationDetails.title}
        description={confirmationDetails.description}
        confirmText="OK"
        onConfirm={handleConfirmationClose}
      />
    </div>
  );
};

export default Home;
