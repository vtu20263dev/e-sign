import React, { useState } from "react";
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
import { AlertCircle, CheckCircle, Send } from "lucide-react";
import { useEmailConfig } from "./EmailConfigProvider";
import emailjs from "emailjs-com";

const EmailTestDialog: React.FC = () => {
  const [testEmail, setTestEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { emailConfig, isConfigured } = useEmailConfig();

  const handleSendTest = async () => {
    if (!testEmail || !isConfigured) return;

    setIsSending(true);
    setTestResult(null);

    try {
      // Initialize EmailJS with the user ID
      emailjs.init(emailConfig.userId);

      // Send a test email
      const response = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        {
          to_email: testEmail,
          document_name: "Test Document",
          document_url: "https://example.com/test",
          role: "tester",
          message: "This is a test email from your eSignature platform.",
        },
      );

      console.log("Test email sent successfully:", response);
      setTestResult({
        success: true,
        message: `Test email sent successfully to ${testEmail}. Please check your inbox (and spam folder).`,
      });
    } catch (error) {
      console.error("Error sending test email:", error);
      setTestResult({
        success: false,
        message: `Failed to send test email: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Test Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Test Email Configuration</DialogTitle>
          <DialogDescription>
            Send a test email to verify your EmailJS configuration is working
            correctly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testEmail" className="col-span-1">
              Test Email
            </Label>
            <Input
              id="testEmail"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="col-span-3"
              placeholder="your-email@example.com"
              type="email"
            />
          </div>

          {!isConfigured && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                Email service is not configured. Please configure it first.
              </span>
            </div>
          )}

          {testResult && (
            <div
              className={`flex items-start gap-2 p-3 rounded-md ${testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
            >
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <p className="text-sm">{testResult.message}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSendTest}
            disabled={!testEmail || !isConfigured || isSending}
            className="flex items-center gap-2"
          >
            {isSending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTestDialog;
