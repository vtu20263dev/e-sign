import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  FileText,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import ConfirmationDialog from "./ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useDocuments } from "../context/DocumentContext";

const DocumentsPage = () => {
  const navigate = useNavigate();
  const { documents, deleteDocument } = useDocuments();
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const handleEditDocument = (documentId: string) => {
    // In a real app, this would navigate to an edit page with the document loaded
    navigate(`/edit-document/${documentId}`);
  };

  const confirmDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteDocument = () => {
    if (documentToDelete) {
      // Delete the document using context
      deleteDocument(documentToDelete);
      setDocumentToDelete(null);
      setShowDeleteConfirmation(false);
    }
  };

  const getStatusIcon = (status: "pending" | "completed" | "rejected") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: "pending" | "completed" | "rejected") => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "rejected":
        return "Rejected";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-gray-600">
            View and manage all your documents and their signature status
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {documents.length === 0 ? (
            <Card className="p-8 text-center bg-white">
              <div className="flex flex-col items-center justify-center space-y-4">
                <FileText className="h-16 w-16 text-gray-300" />
                <h3 className="text-xl font-medium">No documents yet</h3>
                <p className="text-gray-500 max-w-md">
                  You haven't created or uploaded any documents for signature
                  yet.
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Document
                </Button>
              </div>
            </Card>
          ) : (
            documents.map((document) => (
              <Card key={document.id} className="p-6 bg-white shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{document.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created on {document.createdAt.toLocaleDateString()}
                      </p>
                      <div className="flex items-center mt-2 space-x-1">
                        {getStatusIcon(document.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(document.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Recipients</h4>
                      <div className="space-y-2">
                        {document.recipients.map((recipient, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {recipient.email}
                            </span>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(recipient.status)}
                              <span className="text-xs">
                                {getStatusText(recipient.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 justify-end">
                      {document.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDocument(document.id)}
                          className="flex items-center space-x-1"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmDeleteDocument(document.id)}
                        className="flex items-center space-x-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      <ConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        type="error"
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteDocument}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default DocumentsPage;
