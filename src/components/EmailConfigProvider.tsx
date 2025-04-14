import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import emailjs from "emailjs-com";

interface EmailConfig {
  serviceId: string;
  templateId: string;
  userId: string;
}

interface EmailConfigContextType {
  emailConfig: EmailConfig;
  updateEmailConfig: (config: EmailConfig) => void;
  isConfigured: boolean;
}

const defaultConfig: EmailConfig = {
  serviceId: "",
  templateId: "",
  userId: "",
};

const EmailConfigContext = createContext<EmailConfigContextType | undefined>(
  undefined,
);

export const useEmailConfig = () => {
  const context = useContext(EmailConfigContext);
  if (!context) {
    throw new Error(
      "useEmailConfig must be used within an EmailConfigProvider",
    );
  }
  return context;
};

interface EmailConfigProviderProps {
  children: ReactNode;
}

export const EmailConfigProvider: React.FC<EmailConfigProviderProps> = ({
  children,
}) => {
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(() => {
    // Try to load from localStorage on initial render
    const savedConfig = localStorage.getItem("emailConfig");
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  });

  const isConfigured = Boolean(
    emailConfig.serviceId && emailConfig.templateId && emailConfig.userId,
  );

  useEffect(() => {
    // Save to localStorage whenever config changes
    localStorage.setItem("emailConfig", JSON.stringify(emailConfig));

    // Initialize EmailJS with the user ID if available
    if (emailConfig.userId) {
      emailjs.init(emailConfig.userId);
    }
  }, [emailConfig]);

  const updateEmailConfig = (config: EmailConfig) => {
    setEmailConfig(config);
  };

  return (
    <EmailConfigContext.Provider
      value={{ emailConfig, updateEmailConfig, isConfigured }}
    >
      {children}
    </EmailConfigContext.Provider>
  );
};
