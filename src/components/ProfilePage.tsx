import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { AlertCircle, User, Save, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect to home if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing, reset form
      setName(user?.name || "");
      setAvatar(user?.avatar || "");
    }
    setIsEditing(!isEditing);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const success = await updateProfile({
        name: name.trim() || undefined,
        avatar: avatar.trim() || undefined,
      });

      if (success) {
        setSuccessMessage("Profile updated successfully");
        setIsEditing(false);
      } else {
        setError("Failed to update profile");
      }
    } catch (error) {
      setError("An unexpected error occurred");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 container mx-auto py-6 px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">
            View and manage your account information
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatar} alt={name || user.email} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {name
                        ? name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user.email.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="text-xs text-gray-500 text-center max-w-[200px]">
                      Enter an image URL to change your avatar
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name{" "}
                      {isEditing && (
                        <span className="text-gray-500">(optional)</span>
                      )}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing || isLoading}
                      placeholder="Your name"
                    />
                  </div>

                  {isEditing && (
                    <div className="space-y-2">
                      <Label htmlFor="avatar">
                        Avatar URL{" "}
                        <span className="text-gray-500">(optional)</span>
                      </Label>
                      <Input
                        id="avatar"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        disabled={isLoading}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-sm text-gray-500">
                      Account created on{" "}
                      {user.createdAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 text-green-500 text-sm bg-green-50 p-3 rounded-md">
                  <Save className="h-4 w-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleEditToggle}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            {!isEditing && (
              <Button
                variant="outline"
                onClick={handleEditToggle}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default ProfilePage;
