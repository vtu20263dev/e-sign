import React from "react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Pen,
  FileSignature,
  Stamp,
  Calendar,
  User,
  Mail,
  Building2,
  Briefcase,
  Type,
  Hash,
  CheckSquare,
  List,
  CircleDot,
  Pencil,
  Calculator,
  Paperclip,
  StickyNote,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Card } from "./ui/card";

export interface FieldType {
  id: string;
  type: string;
  icon: React.ReactNode;
  label: string;
}

interface FieldPaletteProps {
  onFieldSelect: (field: FieldType) => void;
}

const FieldPalette: React.FC<FieldPaletteProps> = ({ onFieldSelect }) => {
  const fields: FieldType[] = [
    {
      id: "signature",
      type: "signature",
      icon: <FileSignature className="h-4 w-4" />,
      label: "Signature",
    },
    {
      id: "initials",
      type: "initials",
      icon: <Pen className="h-4 w-4" />,
      label: "Initials",
    },
    {
      id: "stamp",
      type: "stamp",
      icon: <Stamp className="h-4 w-4" />,
      label: "Stamp",
    },
    {
      id: "date",
      type: "date",
      icon: <Calendar className="h-4 w-4" />,
      label: "Date",
    },
    {
      id: "name",
      type: "name",
      icon: <User className="h-4 w-4" />,
      label: "Name",
    },
    {
      id: "email",
      type: "email",
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
    },
    {
      id: "company",
      type: "company",
      icon: <Building2 className="h-4 w-4" />,
      label: "Company",
    },
    {
      id: "title",
      type: "title",
      icon: <Briefcase className="h-4 w-4" />,
      label: "Title",
    },
    {
      id: "text",
      type: "text",
      icon: <Type className="h-4 w-4" />,
      label: "Text",
    },
    {
      id: "number",
      type: "number",
      icon: <Hash className="h-4 w-4" />,
      label: "Number",
    },
    {
      id: "checkbox",
      type: "checkbox",
      icon: <CheckSquare className="h-4 w-4" />,
      label: "Checkbox",
    },
    {
      id: "dropdown",
      type: "dropdown",
      icon: <List className="h-4 w-4" />,
      label: "Dropdown",
    },
    {
      id: "radio",
      type: "radio",
      icon: <CircleDot className="h-4 w-4" />,
      label: "Radio",
    },
    {
      id: "drawing",
      type: "drawing",
      icon: <Pencil className="h-4 w-4" />,
      label: "Drawing",
    },
    {
      id: "formula",
      type: "formula",
      icon: <Calculator className="h-4 w-4" />,
      label: "Formula",
    },
    {
      id: "attachment",
      type: "attachment",
      icon: <Paperclip className="h-4 w-4" />,
      label: "Attachment",
    },
    {
      id: "note",
      type: "note",
      icon: <StickyNote className="h-4 w-4" />,
      label: "Note",
    },
    {
      id: "approve",
      type: "approve",
      icon: <ThumbsUp className="h-4 w-4" />,
      label: "Approve",
    },
    {
      id: "decline",
      type: "decline",
      icon: <ThumbsDown className="h-4 w-4" />,
      label: "Decline",
    },
  ];

  return (
    <Card className="p-4 bg-white shadow-sm">
      <h3 className="text-sm font-medium mb-3">Field Palette</h3>
      <div className="grid grid-cols-3 gap-2">
        {fields.map((field) => (
          <TooltipProvider key={field.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-full flex items-center justify-center hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => onFieldSelect(field)}
                  draggable
                  onDragStart={(e) => {
                    // Create a simplified version of the field object without circular references
                    const fieldData = {
                      id: field.id,
                      type: field.type,
                      label: field.label,
                    };

                    e.dataTransfer.setData(
                      "application/field-type",
                      JSON.stringify(fieldData),
                    );
                    e.dataTransfer.effectAllowed = "copy";
                    // Add a ghost image for better visual feedback
                    const ghostElement = document.createElement("div");
                    ghostElement.classList.add(
                      "p-2",
                      "bg-blue-100",
                      "border",
                      "border-blue-300",
                      "rounded",
                      "text-xs",
                      "font-medium",
                    );
                    ghostElement.textContent = field.label;
                    document.body.appendChild(ghostElement);
                    e.dataTransfer.setDragImage(ghostElement, 30, 20);
                    setTimeout(
                      () => document.body.removeChild(ghostElement),
                      0,
                    );
                  }}
                >
                  {field.icon}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{field.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </Card>
  );
};

export default FieldPalette;
