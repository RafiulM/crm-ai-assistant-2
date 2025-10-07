"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { useSession } from "@/lib/auth-client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type: "message" | "action_result";
  result?: any;
  toolResults?: any[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !session) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      type: "message",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content || data.message || "I processed your request.",
        type: data.type || "message",
        result: data.result,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        type: "message",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const formatMessage = (message: Message) => {
    if (message.type === "action_result") {
      return (
        <div className="space-y-2">
          <p>{message.content}</p>

          {/* Handle multiple tool results */}
          {message.toolResults && message.toolResults.length > 0 && (
            <div className="space-y-3">
              {message.toolResults.map((result: any, index: number) => (
                <div key={index}>
                  {result.success && result.lead && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800 dark:text-green-200">
                          Lead Created/Updated
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Name:</strong> {result.lead.name}</p>
                        <p><strong>Email:</strong> {result.lead.email}</p>
                        {result.lead.company && (
                          <p><strong>Company:</strong> {result.lead.company}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{result.lead.stage}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                  {result.success && result.leads && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          Search Results
                        </span>
                      </div>
                      <div className="space-y-2">
                        {result.leads.map((lead: any) => (
                          <div key={lead.id} className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">{lead.email}</p>
                                {lead.company && (
                                  <p className="text-gray-500 dark:text-gray-500">{lead.company}</p>
                                )}
                              </div>
                              <Badge variant="outline">{lead.stage}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {result.success && !result.lead && !result.leads && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-green-800 dark:text-green-200">{result.message}</p>
                    </div>
                  )}
                  {!result.success && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <p className="text-red-800 dark:text-red-200">{result.message}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legacy support for single result */}
          {!message.toolResults && message.result && (
            <>
              {message.result.success && message.result.lead && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Lead Created/Updated
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Name:</strong> {message.result.lead.name}</p>
                    <p><strong>Email:</strong> {message.result.lead.email}</p>
                    {message.result.lead.company && (
                      <p><strong>Company:</strong> {message.result.lead.company}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{message.result.lead.stage}</Badge>
                    </div>
                  </div>
                </div>
              )}
              {message.result.success && message.result.leads && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      Search Results
                    </span>
                  </div>
                  <div className="space-y-2">
                    {message.result.leads.map((lead: any) => (
                      <div key={lead.id} className="text-sm p-2 bg-white dark:bg-gray-800 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">{lead.email}</p>
                            {lead.company && (
                              <p className="text-gray-500 dark:text-gray-500">{lead.company}</p>
                            )}
                          </div>
                          <Badge variant="outline">{lead.stage}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {!message.result.success && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-800 dark:text-red-200">{message.result.message}</p>
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return <p className="whitespace-pre-wrap">{message.content}</p>;
  };

  const getActionIcon = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes("create") || lowerContent.includes("add") || lowerContent.includes("new")) {
      return <Plus className="h-4 w-4" />;
    }
    if (lowerContent.includes("update") || lowerContent.includes("change") || lowerContent.includes("edit")) {
      return <Edit className="h-4 w-4" />;
    }
    if (lowerContent.includes("search") || lowerContent.includes("find") || lowerContent.includes("show")) {
      return <Search className="h-4 w-4" />;
    }
    if (lowerContent.includes("delete") || lowerContent.includes("remove")) {
      return <Trash2 className="h-4 w-4" />;
    }
    return <Bot className="h-4 w-4" />;
  };

  if (!session) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <p>Please sign in to use the chat assistant.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          AI Lead Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">Hello! I'm your AI lead assistant.</p>
                <p className="text-sm">You can ask me to:</p>
                <div className="text-sm mt-2 space-y-1">
                  <p>• Create new leads</p>
                  <p>• Search for existing leads</p>
                  <p>• Update lead information</p>
                  <p>• List all your leads</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    {getActionIcon(message.content)}
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {formatMessage(message)}
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to create, search, or update leads..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}