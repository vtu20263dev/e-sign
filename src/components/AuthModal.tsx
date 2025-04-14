import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle, Mail, KeyRound, User } from "lucide-react";
import { useAuth } from "./AuthContext";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange }) => {
  const { login, verifyOtp, updateProfile, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "profile">("email");
  const [error, setError] = useState<string | null>(null);
  const [isRegistration, setIsRegistration] = useState(true);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    const success = await login(email);
    if (success) {
      setStep("otp");
    } else {
      setError("Failed to send verification code. Please try again.");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length < 6) {
      setError("Please enter a valid verification code");
      return;
    }

    const success = await verifyOtp(email, otp);
    if (success) {
      if (isRegistration) {
        // Move to profile completion step for new users
        setStep("profile");
      } else {
        // Close modal for returning users
        onOpenChange(false);
        // Reset form for next time
        setEmail("");
        setOtp("");
        setStep("email");
      }
    } else {
      setError("Invalid or expired verification code. Please try again.");
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    const success = await updateProfile({ name });
    if (success) {
      onOpenChange(false);
      // Reset form for next time
      setEmail("");
      setOtp("");
      setName("");
      setStep("email");
    } else {
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleClose = () => {
    // Reset form when dialog is closed
    setEmail("");
    setOtp("");
    setStep("email");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {step === "email"
              ? isRegistration
                ? "Register"
                : "Sign in"
              : step === "otp"
                ? "Verify your email"
                : "Complete your profile"}
          </DialogTitle>
          <DialogDescription>
            {step === "email"
              ? "Enter your email to receive a verification code"
              : step === "otp"
                ? `We've sent a verification code to ${email}`
                : "Please enter your name to complete your profile"}
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setIsRegistration(!isRegistration)}
                disabled={isLoading}
              >
                {isRegistration
                  ? "Already have an account? Sign in"
                  : "Need to register? Sign up"}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send verification code"}
              </Button>
            </div>
          </form>
        ) : step === "otp" ? (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="otp">Verification Code</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10"
                  placeholder="123456"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setStep("email")}
                disabled={isLoading}
              >
                Back to email
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Complete Registration"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
