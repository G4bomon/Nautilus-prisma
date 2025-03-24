"use client"; // Mark this as a Client Component

import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

export default function GeminiChatPage() {
  const [input, setInput] = useState(""); // User input
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]); // Chat history
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [context, setContext] = useState(""); // Context from Prisma database

  // Initialize Google Generative AI with the API key from .env
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Fetch context from the API route
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await fetch("/api/respuestas");
        const respuestas = await response.json();
        const contextText = respuestas
          .map((respuesta: any) => `ID: ${respuesta.id}\nResultados: ${respuesta.resultados}`)
          .join("\n\n");
        setContext(contextText);
      } catch (error) {
        console.error("Error fetching context:", error);
      }
    };

    fetchContext();
  }, []);

  // Handle sending a message to Gemini
  const handleSendMessage = async () => {
    if (!input.trim()) return; // Don't send empty messages

    setIsLoading(true);

    // Add user message to chat history
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    try {
      // Combine the user's input with the context
      const prompt = `You are an assistant for the Universidad Marítima del Caribe (UMC). Use the following context to answer questions:\n\n${context}\n\nUser: ${input}`;

      // Send the message to Gemini API
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Add Gemini's response to chat history
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setIsLoading(false);
      setInput(""); // Clear input field
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>UMC AI Assistant</CardTitle>
          <CardDescription>Chat with the UMC AI Assistant powered by Gemini.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[80%] ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex gap-2">
          {/* Input Field */}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />
          {/* Send Button */}
          <Button onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}