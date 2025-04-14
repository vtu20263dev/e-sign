import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { FileUp, AlertCircle } from "lucide-react";

interface DocumentInputSectionProps {
  onDocumentUpload?: (file: File) => void;
  isLoading?: boolean;
}

const DocumentInputSection = ({
  onDocumentUpload = () => {},
  isLoading = false,
}: DocumentInputSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // Check if file is PDF or Word document
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or Word document");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelect(file);
      // Auto-upload the file when selected
      setTimeout(() => {
        onDocumentUpload(file);
      }, 500);
    }
  };

  const handleUploadDocument = () => {
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }
    onDocumentUpload(selectedFile);
  };

  return (
    <Card className="w-full h-full bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-primary bg-primary/5" : "border-gray-300"}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileUp className="w-12 h-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                Drag and drop your document here
              </p>
              <p className="text-sm text-gray-500">or</p>
            </div>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button variant="outline" type="button">
                Browse Files
              </Button>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-xs text-gray-500">
              Supports PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </div>

        {selectedFile && (
          <div className="p-4 border rounded-md bg-gray-50 mt-4">
            <p className="font-medium">Selected file:</p>
            <p className="text-sm truncate">{selectedFile.name}</p>
            <Button
              onClick={handleUploadDocument}
              className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Use This Document"}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentInputSection;
