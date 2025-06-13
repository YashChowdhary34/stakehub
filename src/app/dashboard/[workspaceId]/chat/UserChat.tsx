"use client";

import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  X,
  Clock,
  Check,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/global/loader/spinner";

type UserChat = {
  id: string;
};

type Message = {
  id: string;
  senderId: string;
  type: "TEXT" | "FILE";
  content: string | null;
  fileUrl: string | null;
  createdAt: string;
};

type MessageStatus = "sending" | "sent" | "failed";

type OptimisticMessage = Message & {
  status?: MessageStatus;
  isOptimistic?: boolean;
};

type Props = {
  userId: string;
  eta: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const UserChat = ({ userId, eta }: Props) => {
  console.log("UserChat mounted");
  const [chatId, setChatId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);

  // Initialize Chat
  useEffect(() => {
    async function initChat() {
      setCreating(true);
      try {
        const res = await fetch("/api/chat", { method: "GET" });
        const data = await res.json();
        if (res.status === 200 && data.chat && data.chat.id) {
          console.log("from userChat1, chat-", data.chat);
          setChatId(data.chat.id);
        } else if (res.status === 404) {
          const createRes = await fetch("/api/chat", { method: "POST" });
          const createData = await createRes.json();
          if (createRes.ok && createData.chat && createData.chat.id) {
            console.log("from userChat2, chat-", createData.chat);
            setChatId(createData.chat.id);
          } else {
            console.error("Error creating chat:", createData);
          }
        } else {
          console.error("Error fetching chat:", data);
        }
      } catch (error) {
        console.error("Chat initialization error:", error);
      } finally {
        setCreating(false);
      }
    }
    initChat();
  }, []);

  // Fetch messages with SWR
  const {
    data: messagesData,
    error: messagesError,
    //mutate,
  } = useSWR(chatId ? `/api/chat/${chatId}` : null, fetcher, {
    refreshInterval: 3000,
  });

  const cleanOptimisticMessages = (
    serverMsgs: Message[],
    optimisticMsgs: OptimisticMessage[]
  ) => {
    // Remove optimistic messages that now exist in server messages
    return optimisticMsgs.filter((optimisticMsg) => {
      // Keep failed messages
      if (optimisticMsg.status === "failed") return true;

      // Remove sent optimistic messages that have a similar server message
      const hasServerVersion = serverMsgs.some(
        (serverMsg) =>
          serverMsg.content === optimisticMsg.content &&
          serverMsg.type === optimisticMsg.type &&
          Math.abs(
            new Date(serverMsg.createdAt).getTime() -
              new Date(optimisticMsg.createdAt).getTime()
          ) < 10000 // Within 10 seconds
      );

      return !hasServerVersion;
    });
  };

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData, optimisticMessages]);

  const serverMessages: Message[] = messagesData?.messages || [];
  const cleanedOptimisticMessages = cleanOptimisticMessages(
    serverMessages,
    optimisticMessages
  );

  useEffect(() => {
    const cleaned = cleanOptimisticMessages(serverMessages, optimisticMessages);
    if (cleaned.length !== optimisticMessages.length) {
      setOptimisticMessages(cleaned);
    }
  }, [serverMessages]);

  if (creating) {
    return (
      <main className="fixed top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
        <div className="flex h-full items-center justify-center mt-16 md:mt-0">
          <div className="flex flex-col items-center space-y-4">
            <Spinner />
            <p className="text-sm text-muted-foreground">
              Initializing chat...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!chatId) {
    return (
      <main className="fixed top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
        <div className="flex h-full items-center justify-center mt-16 md:mt-0">
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">
              Failed to initialize chat
            </p>
            <p className="text-sm text-muted-foreground">
              Please refresh the page
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (messagesError) {
    return (
      <main className="fixed top-0 left-0 w-full h-screen md:ml-64 md:w-[calc(100%-16rem)] bg-background">
        <div className="flex h-full items-center justify-center mt-16 md:mt-0">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive">
              Error loading messages
            </p>
            <p className="text-sm text-muted-foreground">Please try again</p>
          </div>
        </div>
      </main>
    );
  }

  const allMessages = [...serverMessages, ...cleanedOptimisticMessages];
  // WIP:Do something about this
  const currentUserId = userId;

  // Send text message
  const sendText = async () => {
    if (!textInput.trim()) return;

    const tempMessage: OptimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      type: "TEXT",
      content: textInput.trim(),
      fileUrl: null,
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
    };

    // Add optimistic message immediately
    setOptimisticMessages((prev) => [...prev, tempMessage]);
    const messageContent = textInput.trim();
    setTextInput("");

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", content: messageContent }),
      });

      if (response.ok) {
        // Update status to sent and keep the message
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? { ...msg, status: "sent" } : msg
          )
        );

        // Only remove optimistic message when server data refreshes naturally
        // The SWR will handle the refresh in background
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Update status to failed
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // Send file
  const sendFile = async () => {
    if (!fileInput) return;

    const tempMessage: OptimisticMessage = {
      id: `temp-file-${Date.now()}`,
      senderId: currentUserId,
      type: "FILE",
      content: null,
      fileUrl: null,
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
    };

    // Add optimistic message immediately
    setOptimisticMessages((prev) => [...prev, tempMessage]);
    const currentFile = fileInput;
    setFileInput(null);
    (document.getElementById("file-input") as HTMLInputElement).value = "";

    try {
      const fileName = currentFile.name;
      const fileType = currentFile.type;

      const presignRes = await fetch("/api/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      });

      if (!presignRes.ok) {
        throw new Error("Presign failed");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: currentFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FILE",
          fileUrl: publicUrl,
        }),
      });

      if (response.ok) {
        // Update status to sent
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, status: "sent", fileUrl: publicUrl }
              : msg
          )
        );

        // Only remove optimistic message when server data refreshes naturally
        // The SWR will handle the refresh in background
      } else {
        throw new Error("Failed to send file message");
      }
    } catch (error) {
      console.error("Error sending file:", error);
      // Update status to failed
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/*header*/}
      <div className="border-b bg-zinc-800 px-4 py-3 md:px-6 flex-shrink-0">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center justify-start gap-6">
            <div className="flex h-3 w-3 rounded-full bg-green-500"></div>
            <div className="flex flex-col items-start justify-start">
              <h1 className="text-lg font-semibold md:text-lg text-card-foreground">
                Chat with Admin
              </h1>
              <p className="text-xs text-muted-foreground md:text-sm">
                {allMessages.length} messages
              </p>
            </div>
          </div>
          <span className="text-white/30 text-[0.75rem] font-bold">
            Expect Reply Under - {eta}
          </span>
        </div>
      </div>

      {/*messages*/}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 md:px-6">
          {allMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">
                  No messages yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Start the conversation by sending a message
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {allMessages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                // const isOptimistic = "isOptimistic" in msg && msg.isOptimistic;
                const status = "status" in msg ? msg.status : "sent";

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-1 px-2",
                      isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "relative max-w-[85%] md:max-w-[70%] rounded-lg px-3 py-2 shadow-sm transition-colors duration-200",
                        isMine
                          ? status === "failed"
                            ? "bg-red-500/90 text-white"
                            : "bg-[#DCF8C6] text-gray-900"
                          : "bg-white text-gray-900",
                        // WhatsApp-like tail
                        isMine ? "rounded-br-sm" : "rounded-bl-sm"
                      )}
                      style={{
                        // WhatsApp-like shadow
                        boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                      }}
                    >
                      {msg.type === "TEXT" ? (
                        <div className="break-words">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 min-w-[200px]">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            {msg.fileUrl ? (
                              <a
                                href={msg.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <span className="truncate">Download file</span>
                                <Download className="h-3 w-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className="text-sm text-gray-600">
                                {status === "sending"
                                  ? "Uploading..."
                                  : status === "failed"
                                  ? "Upload failed"
                                  : "File"}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* WhatsApp-like timestamp and status */}
                      <div
                        className={cn(
                          "flex items-center justify-end gap-1 mt-1 text-xs",
                          isMine
                            ? msg.type === "TEXT"
                              ? "text-gray-600"
                              : "text-gray-500"
                            : "text-gray-500"
                        )}
                      >
                        <span className="text-[11px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMine && (
                          <span className="flex items-center ml-1">
                            {status === "sending" && (
                              <Clock className="h-3 w-3 text-gray-500" />
                            )}
                            {status === "sent" && (
                              <div className="flex">
                                <Check className="h-3 w-3 text-gray-500" />
                              </div>
                            )}
                            {status === "failed" && (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card p-4 md:p-6 flex-shrink-0">
        {/* File Preview */}
        {fileInput && (
          <Card className="mb-4 bg-muted">
            <CardContent className="flex items-center justify-between p-3">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground">
                  {fileInput.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round(fileInput.size / 1024)}KB
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFileInput(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex items-end space-x-2">
          {/* File Input */}
          <Button variant="outline" size="sm" className="p-2" asChild>
            <label className="cursor-pointer">
              <Paperclip className="h-4 w-4" />
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={(e) => setFileInput(e.target.files?.[0] || null)}
              />
            </label>
          </Button>

          {/* Text Input */}
          <div className="flex-1">
            <Textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={fileInput ? sendFile : sendText}
            disabled={!textInput.trim() && !fileInput}
            size="sm"
            className="p-2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 text-xs text-muted-foreground hidden md:flex">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default UserChat;
