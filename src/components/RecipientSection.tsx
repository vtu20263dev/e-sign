import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Send, Plus, Trash2 } from "lucide-react";

interface Recipient {
  email: string;
  role: "signer" | "viewer" | "cc";
}

interface RecipientSectionProps {
  onSend?: (recipients: Recipient[]) => void;
  isDocumentReady?: boolean;
  initialRecipients?: Recipient[];
}

const RecipientSection: React.FC<RecipientSectionProps> = ({
  onSend = () => {},
  isDocumentReady = true,
  initialRecipients = [],
}) => {
  const [recipients, setRecipients] = useState<Recipient[]>([
    { email: "", role: "signer" },
  ]);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Update recipients when initialRecipients changes
  useEffect(() => {
    if (initialRecipients.length > 0) {
      // Filter out empty emails and ensure we have at least one recipient
      const validRecipients = initialRecipients.filter(
        (r) => r.email.trim() !== "",
      );
      if (validRecipients.length > 0) {
        setRecipients(validRecipients);
      }
    }
  }, [initialRecipients]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index].email = value;
    setRecipients(newRecipients);
    setEmailError(null);
  };

  const handleRoleChange = (
    index: number,
    role: "signer" | "viewer" | "cc",
  ) => {
    const newRecipients = [...recipients];
    newRecipients[index].role = role;
    setRecipients(newRecipients);
  };

  const addRecipient = () => {
    setRecipients([...recipients, { email: "", role: "signer" }]);
  };

  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = [...recipients];
      newRecipients.splice(index, 1);
      setRecipients(newRecipients);
    }
  };

  const handleSend = () => {
    // Validate all emails
    let hasError = false;

    for (const recipient of recipients) {
      if (!recipient.email || !validateEmail(recipient.email)) {
        setEmailError("Please enter a valid email address");
        hasError = true;
        break;
      }
    }

    // Email service is now pre-configured with hardcoded credentials
    console.log("Using pre-configured email service");

    if (!hasError) {
      onSend(recipients);
    }
  };

  return (
    <Card className="p-6 bg-white shadow-md rounded-lg">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recipients</h3>

        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <Label htmlFor={`email-${index}`} className="sr-only">
                  Email
                </Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  placeholder="Enter recipient email"
                  value={recipient.email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  className={emailError ? "border-red-500" : ""}
                />
              </div>

              <div className="flex-none">
                <select
                  value={recipient.role}
                  onChange={(e) =>
                    handleRoleChange(
                      index,
                      e.target.value as "signer" | "viewer" | "cc",
                    )
                  }
                  className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="signer">Signer</option>
                  <option value="viewer">Viewer</option>
                  <option value="cc">CC</option>
                </select>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRecipient(index)}
                      disabled={recipients.length === 1}
                      className="flex-none"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove recipient</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}

          {emailError && <p className="text-sm text-red-500">{emailError}</p>}
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={addRecipient}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Recipient
          </Button>

          <Button
            onClick={handleSend}
            disabled={!isDocumentReady}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send for Signature
          </Button>
        </div>

        {!isDocumentReady && (
          <p className="text-sm text-amber-600">
            Please create or upload a document first
          </p>
        )}
      </div>
    </Card>
  );
};

export default RecipientSection;
