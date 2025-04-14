import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Send, Loader2 } from "lucide-react";
import Header from "./Header";
import { generateChatResponse, ChatMessage } from "../services/openaiService";

const TemplatesPage = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [templatePreview, setTemplatePreview] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage = {
      role: "assistant" as const,
      content:
        "Welcome to the Templates page! You can create, store, and manage reusable envelope templates here. Type 'Create Template' to get started.",
    };
    setChatMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: "user",
      content: userInput,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await generateChatResponse([
        ...chatMessages,
        userMessage,
      ]);

      // Add AI response to chat
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
      };

      setChatMessages((prev) => [...prev, assistantMessage]);

      // Check if template creation is complete
      if (
        response.includes("template is ready") ||
        response.includes("template has been created")
      ) {
        // Extract template content (this is a simplified version, you might need more complex parsing)
        const templateContent = extractTemplateContent(response);
        if (templateContent) {
          setTemplatePreview(templateContent);
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);

      // Add error message
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTemplateContent = (response: string): string | null => {
    // This is a simplified extraction - you might need more complex parsing
    if (response.includes("---")) {
      const parts = response.split("---");
      if (parts.length >= 3) {
        return parts[1].trim();
      }
    }
    return null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Templates</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="text-xl font-semibold mb-4">
                Template Creation Assistant
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 min-h-[400px]"
              >
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    >
                      <div className="whitespace-pre-wrap">
                        {message.content}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-muted flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="p-4 flex-1 flex flex-col">
              <div className="text-xl font-semibold mb-4">Template Preview</div>
              <div className="flex-1 border rounded-md p-4 bg-white overflow-y-auto min-h-[400px]">
                {templatePreview ? (
                  <div className="whitespace-pre-wrap">{templatePreview}</div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Template preview will appear here
                  </div>
                )}
              </div>
              {templatePreview && (
                <Button className="mt-4 w-full">Save Template</Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
