import React from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";

export type ConfirmationDialogType = "success" | "error" | "info";

interface ConfirmationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  type?: ConfirmationDialogType;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ConfirmationDialog = ({
  open = true,
  onOpenChange,
  type = "success",
  title = "Operation Successful",
  description = "Your document has been successfully sent for signature.",
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm = () => {},
  onCancel = () => {},
}: ConfirmationDialogProps) => {
  const iconMap = {
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
    error: <AlertCircle className="h-12 w-12 text-red-500" />,
    info: <Info className="h-12 w-12 text-blue-500" />,
  };

  const titleMap = {
    success: title || "Operation Successful",
    error: title || "Error Occurred",
    info: title || "Information",
  };

  const descriptionMap = {
    success:
      description || "Your document has been successfully sent for signature.",
    error:
      description ||
      "There was an error processing your request. Please try again.",
    info: description || "Please review the information provided.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white sm:max-w-md">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <div className="flex flex-col items-center justify-center space-y-4 p-4">
          {iconMap[type]}
          <DialogHeader>
            <DialogTitle className="text-xl text-center">
              {titleMap[type]}
            </DialogTitle>
            <DialogDescription className="text-center pt-2">
              {descriptionMap[type]}
            </DialogDescription>
          </DialogHeader>
        </div>
        <DialogFooter className="flex justify-center sm:justify-center gap-2 pt-4">
          {type !== "success" && (
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button onClick={onConfirm}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
