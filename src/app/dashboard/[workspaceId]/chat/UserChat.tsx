"use client";

import { cn } from "@/lib/utils";
import {
  Download,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  X,
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
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    mutate,
  } = useSWR(chatId ? `/api/chat/${chatId}` : null, fetcher, {
    refreshInterval: 3000,
  });

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData]);

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

  const messages: Message[] = messagesData?.messages || [];

  // WIP:Do something about this
  const currentUserId = userId;

  // Send text message
  const sendText = async () => {
    if (!textInput.trim() || sending) return;

    setSending(true);
    try {
      await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", content: textInput.trim() }),
      });
      setTextInput("");
      mutate();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Send file
  const sendFile = async () => {
    if (!fileInput) return;

    const fileName = fileInput.name;
    const fileType = fileInput.type;

    const presignRes = await fetch("/api/upload-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType }),
    });

    if (!presignRes.ok) {
      console.error("Presign failed:", await presignRes.json());
      return;
    }
    const { uploadUrl, publicUrl } = (await presignRes.json()) as {
      uploadUrl: string;
      publicUrl: string;
    };

    console.log(
      "this is coming from /dashboard/[workspacId]/chat/page.tsx - upload Url -> ",
      uploadUrl,
      "publicUrl ->",
      publicUrl
    );

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
      },
      body: fileInput,
    });

    if (!uploadResponse.ok) {
      console.error("R2 upload failed:", uploadResponse.statusText);
      return;
    }

    await fetch(`/api/chat/${chatId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "FILE",
        fileUrl: publicUrl,
      }),
    });

    setFileInput(null);
    (document.getElementById("file-input") as HTMLInputElement).value = "";
    mutate(); // Revalidate swr
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
                {messages.length} messages
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
          {messages.length === 0 ? (
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
              {messages.map((msg) => {
                const isMine = msg.senderId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      isMine ? "justify-end" : "justify-start"
                    )}
                  >
                    <Card
                      className={cn(
                        "max-w-[85%] md:max-w-[70%] border-0",
                        isMine
                          ? "bg-primary text-primary-foreground"
                          : "bg-zinc-800 text-white"
                      )}
                    >
                      <CardContent className="px-4 py-2">
                        {msg.type === "TEXT" ? (
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {msg.content}
                          </p>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <a
                              href={msg.fileUrl!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-sm underline hover:no-underline"
                            >
                              <span>Download file</span>
                              <Download className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                        <div
                          className={cn(
                            "mt-1 text-xs opacity-70",
                            isMine ? "text-right" : "text-left"
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </CardContent>
                    </Card>
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
            disabled={(!textInput.trim() && !fileInput) || sending}
            size="sm"
            className="p-2"
          >
            {sending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
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
