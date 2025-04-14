import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, Settings } from "lucide-react";
import { useEmailConfig } from "./EmailConfigProvider";
import EmailTestDialog from "./EmailTestDialog";

interface EmailSetupDialogProps {
  onSave: (credentials: {
    serviceId: string;
    templateId: string;
    userId: string;
  }) => void;
}

const EmailSetupDialog: React.FC<EmailSetupDialogProps> = ({ onSave }) => {
  const { emailConfig } = useEmailConfig();
  const [serviceId, setServiceId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [userId, setUserId] = useState("");
  const [open, setOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Load existing values when dialog opens
  useEffect(() => {
    if (open) {
      setServiceId(emailConfig.serviceId || "");
      setTemplateId(emailConfig.templateId || "");
      setUserId(emailConfig.userId || "");
    }
  }, [open, emailConfig]);

  const handleSave = () => {
    onSave({ serviceId, templateId, userId });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email Service Setup</DialogTitle>
          <DialogDescription>
            Configure your EmailJS credentials to enable sending documents via
            email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serviceId" className="col-span-1">
              Service ID
            </Label>
            <Input
              id="serviceId"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="col-span-3"
              placeholder="service_xxxxxxx"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="templateId" className="col-span-1">
              Template ID
            </Label>
            <Input
              id="templateId"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="col-span-3"
              placeholder="template_xxxxxxx"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="userId" className="col-span-1">
              User ID
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="col-span-3"
              placeholder="user_xxxxxxx"
            />
          </div>

          <Button
            variant="link"
            className="justify-start p-0 h-auto text-blue-600"
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? "Hide help" : "Show help with finding these values"}
          </Button>

          {showHelp && (
            <div className="bg-blue-50 p-4 rounded-md text-sm space-y-2">
              <p>
                <strong>How to find your EmailJS credentials:</strong>
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>
                  Go to{" "}
                  <a
                    href="https://www.emailjs.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    EmailJS.com
                  </a>{" "}
                  and sign in to your account
                </li>
                <li>
                  <strong>Service ID:</strong> Go to "Email Services" tab, click
                  on your service, and copy the Service ID
                </li>
                <li>
                  <strong>Template ID:</strong> Go to "Email Templates" tab,
                  click on your template, and copy the Template ID
                </li>
                <li>
                  <strong>User ID (Public Key):</strong> Go to "Account" → "API
                  Keys" and copy your Public Key
                </li>
                <li>
                  Make sure your template has variables like{" "}
                  <code>{{ to_email }}</code>, <code>{{ document_name }}</code>,{" "}
                  <code>{{ document_url }}</code>, and <code>{{ role }}</code>
                </li>
              </ol>
            </div>
          )}

          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              After saving, use the Test Email button to verify your
              configuration.
            </span>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <EmailTestDialog />
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailSetupDialog;
