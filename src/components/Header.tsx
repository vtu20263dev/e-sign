import React, { useState } from "react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FileSignature, Menu, User, LogIn } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
}

const Header = ({ userName = "John Doe", userAvatar }: HeaderProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  // Use the authenticated user's name if available
  const displayName = user?.name || userName;
  const displayAvatar = user?.avatar || userAvatar;

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full h-20 border-b border-gray-200 bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <FileSignature className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">
          Virtue Tech eSignature Platform
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/")}>
            Dashboard
          </Button>
          <Button variant="ghost" onClick={() => navigate("/documents")}>
            Documents
          </Button>
          <Button variant="ghost" onClick={() => navigate("/templates")}>
            Templates
          </Button>
          <Button variant="ghost">Help</Button>
        </nav>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              Register / Login
            </Button>
          ) : null}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {displayName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </header>
  );
};

export default Header;
