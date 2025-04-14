import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { sendDocumentEmail } from "../services/emailService";

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Convert string date back to Date object
          parsedUser.createdAt = new Date(parsedUser.createdAt);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  // Login function - sends OTP to email
  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Store the OTP and email in localStorage (in a real app, this would be server-side)
      localStorage.setItem(
        "pendingAuth",
        JSON.stringify({ email, otp, timestamp: new Date().getTime() }),
      );

      // Send OTP via email
      const emailSent = await sendDocumentEmail({
        to_email: email,
        document_name: "Verification Code",
        document_url: "#",
        role: "verification",
        message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
      });

      return emailSent;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Get the stored pending auth data
      const pendingAuthStr = localStorage.getItem("pendingAuth");
      if (!pendingAuthStr) return false;

      const pendingAuth = JSON.parse(pendingAuthStr);

      // Check if OTP is valid and not expired (10 minutes)
      const isValid =
        pendingAuth.email === email &&
        pendingAuth.otp === otp &&
        new Date().getTime() - pendingAuth.timestamp < 10 * 60 * 1000;

      if (isValid) {
        // Create a new user or get existing
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          createdAt: new Date(),
        };

        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);

        // Clear pending auth
        localStorage.removeItem("pendingAuth");
        return true;
      }

      return false;
    } catch (error) {
      console.error("OTP verification error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser = { ...user, ...data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
