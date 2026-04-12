import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Bot, Sparkles, User, Send, Lightbulb, DollarSign, TrendingUp, Search } from "lucide-react";
import { motion } from "motion/react";
import { aiService } from "../services";
import { toast } from "sonner";

interface Message {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isBot: boolean;
}

export function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "AI Assistant",
      message:
        "Hello! I'm your AI Innovation Assistant. I can help you discover patents, find investment opportunities, and connect with innovators. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isBot: true,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const quickSuggestions = [
    { text: "Show me renewable energy patents", icon: Lightbulb },
    { text: "Find high-value investment opportunities", icon: DollarSign },
    { text: "What's trending in biotechnology?", icon: TrendingUp },
    { text: "Patents from Sri Lanka", icon: Search },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const nextMessages = [
      ...messages,
      {
        id: `msg-${Date.now()}`,
        sender: "You",
        message: input,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isBot: false,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const aiText = await aiService.chat(
        nextMessages.map((message) => ({
          role: message.isBot ? "assistant" : "user",
          content: message.message,
        })),
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "AI Assistant",
          message: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isBot: true,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || "Failed to get AI response");
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "AI Assistant",
          message:
            "I'm currently experiencing connection issues. Please try again or browse our patent catalog directly.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (text: string) => setInput(text);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold">AI Innovation Assistant</h1>
              <p className="text-xs md:text-sm text-blue-100">Ask about patents, markets, manufacturing, and commercialization</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2">
            <Card className="h-[600px] md:h-[700px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Chat with AI</CardTitle>
                    <p className="text-xs text-gray-500">Context-aware answers powered by the backend AI module</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0">Online</Badge>
                </div>
              </CardHeader>

              <ScrollArea className="flex-1 p-4 md:p-6">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${msg.isBot ? "" : "flex-row-reverse"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.isBot ? "bg-gradient-to-br from-blue-600 to-purple-600" : "bg-gray-200"}`}>
                        {msg.isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className={`flex-1 ${msg.isBot ? "" : "flex justify-end"}`}>
                        <div className={`inline-block max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${msg.isBot ? "bg-gray-100 text-gray-800" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"}`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.isBot ? "text-gray-500" : "text-blue-100"}`}>{msg.timestamp}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-purple-600">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500">Thinking...</div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              <CardContent className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                  <Button onClick={() => void handleSend()} disabled={!input.trim() || isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Quick Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickSuggestions.map((suggestion, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <Button variant="outline" className="w-full justify-start text-left h-auto py-3 hover:bg-purple-50 hover:border-purple-300" onClick={() => handleSuggestionClick(suggestion.text)}>
                      <suggestion.icon className="w-4 h-4 mr-2 flex-shrink-0 text-purple-600" />
                      <span className="text-sm">{suggestion.text}</span>
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
