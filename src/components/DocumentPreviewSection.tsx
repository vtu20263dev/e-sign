import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Save,
} from "lucide-react";
import { FieldType } from "./FieldPalette";

export interface Field {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  value?: string;
  label: string;
}

interface DocumentPreviewSectionProps {
  document?: {
    url: string;
    name: string;
    type: string;
  };
  fields?: Field[];
  onAddField?: (field: Field) => void;
  onFieldMove?: (id: string, position: { x: number; y: number }) => void;
  onFieldResize?: (id: string, size: { width: number; height: number }) => void;
  onFieldValueChange?: (id: string, value: string) => void;
  onFieldRemove?: (id: string) => void;
  isEditMode?: boolean;
  selectedField?: FieldType | null;
}

const DocumentPreviewSection = ({
  document = {
    url: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80",
    name: "Sample Document.pdf",
    type: "application/pdf",
  },
  fields = [],
  onAddField = () => {},
  onFieldMove = () => {},
  onFieldResize = () => {},
  onFieldValueChange = () => {},
  onFieldRemove = () => {},
  isEditMode = true,
  selectedField = null,
}: DocumentPreviewSectionProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [documentContent, setDocumentContent] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [contentHeight, setContentHeight] = useState("auto");

  useEffect(() => {
    if (document?.url.startsWith("data:")) {
      try {
        const base64Content =
          document.url.split(",")[1] || document.url.split(";base64,")[1];
        if (base64Content) {
          // Decode base64 and handle UTF-8 characters properly
          const binaryContent = atob(base64Content);

          // Use a safer approach to decode UTF-8 content
          // Instead of escape/decodeURIComponent which can fail with malformed URIs
          let content = "";
          try {
            // First try the standard approach
            content = decodeURIComponent(escape(binaryContent));
          } catch (decodeError) {
            // Fallback to a more robust method if the URI is malformed
            const bytes = new Uint8Array(binaryContent.length);
            for (let i = 0; i < binaryContent.length; i++) {
              bytes[i] = binaryContent.charCodeAt(i);
            }
            content = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
          }

          setDocumentContent(content);
          setEditableContent(content);

          // Calculate appropriate height based on content length
          const lineCount = (content.match(/\n/g) || []).length + 1;
          const estimatedHeight = Math.max(500, lineCount * 24); // 24px per line, minimum 500px
          setContentHeight(`${estimatedHeight}px`);
        }
      } catch (error) {
        console.error("Error decoding document content:", error);
        // Set a fallback message when decoding fails
        setDocumentContent("Error loading document content. Please try again.");
        setEditableContent("Error loading document content. Please try again.");
      }
    }
  }, [document]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFieldClick = (fieldName: string) => {
    const userInput = prompt(`Enter value for ${fieldName}:`, "");
    if (userInput !== null) {
      setEditableContent((prevContent) => {
        return prevContent.replace(
          new RegExp(`\\[${fieldName}\\]`, "g"),
          userInput,
        );
      });
    }
  };

  const renderEditableDocument = () => {
    if (!editableContent) return null;

    // Regular expression to find fields in square brackets
    const fieldRegex = /\[(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Create a copy of the content to work with
    const content = editableContent;

    // Find all matches and create an array of text and editable fields
    while ((match = fieldRegex.exec(content)) !== null) {
      // Add the text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {content.substring(lastIndex, match.index)}
          </span>,
        );
      }

      // Add the editable field
      const fieldName = match[1];
      parts.push(
        <button
          key={`field-${match.index}`}
          onClick={() => handleFieldClick(fieldName)}
          className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {content.substring(match.index, match.index + match[0].length)}
        </button>,
      );

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>,
      );
    }

    return (
      <div className="whitespace-pre-wrap font-mono text-sm min-h-full">
        {parts}
      </div>
    );
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Handle document click to add field at position
  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode || !selectedField) return;

    // Don't add field if clicking on an existing field
    if ((e.target as HTMLElement).closest(".field-element")) {
      return;
    }

    // Get click position relative to the document container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Create a new field at this position
    onAddField({
      id: `${selectedField.type}-${Date.now()}`,
      type: selectedField.type,
      position: { x, y },
      size: { width: 120, height: 40 },
      label: selectedField.label,
    });

    // Show visual feedback
    const feedbackEl = document.createElement("div");
    feedbackEl.className =
      "absolute bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full";
    feedbackEl.style.left = `${x}px`;
    feedbackEl.style.top = `${y - 20}px`;
    feedbackEl.textContent = "Field added!";
    e.currentTarget.appendChild(feedbackEl);

    // Remove feedback after animation
    setTimeout(() => {
      feedbackEl.style.opacity = "0";
      feedbackEl.style.transform = "translateY(-10px)";
      feedbackEl.style.transition = "opacity 0.3s, transform 0.3s";
      setTimeout(() => feedbackEl.remove(), 300);
    }, 800);
  };

  // Render fields on top of document
  const renderFields = () => {
    return fields.map((field) => (
      <div
        key={field.id}
        className="absolute border-2 border-blue-500 bg-blue-50 bg-opacity-30 rounded cursor-move flex items-center justify-center hover:bg-blue-100 hover:border-blue-600 transition-colors field-element"
        style={{
          left: `${field.position.x}px`,
          top: `${field.position.y}px`,
          width: `${field.size.width}px`,
          height: `${field.size.height}px`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
        draggable={isEditMode}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", field.id);
          // Store offset of mouse within the element
          const rect = e.currentTarget.getBoundingClientRect();
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;
          e.dataTransfer.setData(
            "application/offset",
            JSON.stringify({ x: offsetX, y: offsetY }),
          );
          // Add visual feedback during drag
          e.currentTarget.classList.add("opacity-50");
          setTimeout(() => {
            try {
              // This might fail if the element is no longer in the DOM
              e.currentTarget.classList.add("ring-4", "ring-blue-300");
            } catch (err) {}
          }, 0);
        }}
        onDragEnd={(e) => {
          // Remove visual feedback
          e.currentTarget.classList.remove(
            "opacity-50",
            "ring-4",
            "ring-blue-300",
          );
        }}
      >
        <div className="text-xs font-medium text-blue-700">{field.label}</div>
        {isEditMode && (
          <button
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
            onClick={() => onFieldRemove(field.id)}
          >
            ×
          </button>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Document Preview</h2>
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={toggleEditMode}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isEditing ? "Save Changes" : "Edit Fields"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleRotate}>
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rotate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card className="flex-1 overflow-auto border border-gray-200 p-4">
        <div
          className="relative w-full h-full min-h-[500px] flex items-center justify-center"
          onDragOver={(e) => {
            e.preventDefault();
            // Check if this is a field being dragged from palette
            const isFieldType = e.dataTransfer.types.includes(
              "application/field-type",
            );
            e.dataTransfer.dropEffect = isFieldType ? "copy" : "move";

            // Add visual indicator for drop target
            e.currentTarget.classList.add(
              "bg-blue-50",
              "border-blue-300",
              "border-2",
            );
          }}
          onDragLeave={(e) => {
            // Remove visual indicator when drag leaves
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              e.currentTarget.classList.remove(
                "bg-blue-50",
                "border-blue-300",
                "border-2",
              );
            }
          }}
          onDrop={(e) => {
            // Remove visual indicator when dropped
            e.currentTarget.classList.remove(
              "bg-blue-50",
              "border-blue-300",
              "border-2",
            );
            e.preventDefault();
            const fieldId = e.dataTransfer.getData("text/plain");
            const offsetData = e.dataTransfer.getData("application/offset");
            const fieldTypeData = e.dataTransfer.getData(
              "application/field-type",
            );

            // Get position relative to document container
            const rect = e.currentTarget.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Adjust for offset within the dragged element if available
            if (offsetData) {
              try {
                const offset = JSON.parse(offsetData);
                x -= offset.x || 0;
                y -= offset.y || 0;
              } catch (err) {
                console.error("Error parsing offset data", err);
              }
            }

            // If this is an existing field being moved
            if (fieldId && fields.some((f) => f.id === fieldId)) {
              onFieldMove(fieldId, { x, y });
            } else if (fieldTypeData) {
              // Field dragged from palette
              try {
                const fieldType = JSON.parse(fieldTypeData);
                onAddField({
                  id: `${fieldType.type}-${Date.now()}`,
                  type: fieldType.type,
                  position: { x, y },
                  size: { width: 120, height: 40 },
                  label: fieldType.label,
                });
              } catch (err) {
                console.error("Error parsing field type data", err);
              }
            } else if (selectedField) {
              // Add a new field from the palette (click method)
              onAddField({
                id: `${selectedField.type}-${Date.now()}`,
                type: selectedField.type,
                position: { x, y },
                size: { width: 120, height: 40 },
                label: selectedField.label,
              });
            }
          }}
          onClick={handleDocumentClick}
        >
          <div
            className="relative w-full h-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: "transform 0.3s ease",
              minHeight: document?.url.startsWith("data:")
                ? contentHeight
                : "100%",
            }}
          >
            {renderFields()}
            {document ? (
              document.type.includes("pdf") ? (
                document.url.startsWith("data:") ? (
                  <div className="w-full h-full overflow-auto bg-white p-6 border border-gray-200 rounded">
                    {documentContent ? (
                      <div className="whitespace-pre-wrap min-h-full">
                        {isEditing ? renderEditableDocument() : documentContent}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">
                        Loading document content...
                      </div>
                    )}
                  </div>
                ) : (
                  <object
                    data={document.url}
                    type={document.type}
                    title="Document Preview"
                    className="w-full h-full border-0 bg-white"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-4">
                      <p>
                        Unable to display document. Please try downloading it
                        instead.
                      </p>
                    </div>
                  </object>
                )
              ) : (
                <div className="relative w-full h-full flex flex-col items-center justify-center bg-white p-4 border border-gray-200 rounded">
                  <img
                    src={document.url}
                    alt="Document Preview"
                    className="max-w-full max-h-full object-contain mx-auto"
                    onError={(e) => {
                      console.error("Error loading image:", e);
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80";
                    }}
                  />
                  {document.type.includes("word") ||
                  document.name.endsWith(".doc") ||
                  document.name.endsWith(".docx") ? (
                    <div className="absolute bottom-0 w-full bg-yellow-50 p-3 text-center text-yellow-800 text-sm border-t border-yellow-200">
                      Word document preview not available. In a production app,
                      this would use a document viewer service.
                    </div>
                  ) : null}
                </div>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 gap-4">
                <FileText className="h-16 w-16 text-gray-400" />
                <p>No document to preview</p>
                <p className="text-sm">
                  Upload or generate a document to see it here
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-4 text-sm text-gray-500">
        <p>Document: {document?.name || "No document selected"}</p>
        <p>
          Zoom: {zoom}% | Rotation: {rotation}°
        </p>
        {document?.url.startsWith("data:") && (
          <p className="text-blue-500 mt-1">
            Click on any [field] in the document to edit it
          </p>
        )}
      </div>
    </div>
  );
};

export default DocumentPreviewSection;
