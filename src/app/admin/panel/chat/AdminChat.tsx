"use client";

import React, { useEffect, useState, useRef } from "react";
import useSWR from "swr";
import {
  Send,
  Paperclip,
  FileText,
  Download,
  X,
  MessageSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatSummary = {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  messages: Array<{
    id: string;
    type: "TEXT" | "FILE";
    content: string | null;
    fileUrl: string | null;
    createdAt: string;
  }>; // this array is limited to [most recent message]
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
  adminId: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const AdminChat = ({ adminId }: Props) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch list of chats (Admin view)
  const {
    data: chatListData,
    error: chatListError,
    mutate: mutateChats,
  } = useSWR(
    "/api/chat", // since GET /api/chat returns all chats for Admin
    fetcher,
    { refreshInterval: 5000 } // poll every 5s so new user chats appear
  );

  const chatList: ChatSummary[] = chatListData?.chats || [];

  // 2. When Admin clicks a chat, set selectedChatId
  // 3. Fetch messages for that chat:
  const {
    data: messagesData,
    // error: messagesError,
    mutate: mutateMessages,
  } = useSWR(selectedChatId ? `/api/chat/${selectedChatId}` : null, fetcher, {
    refreshInterval: 2000,
  });
  const messages: Message[] = messagesData?.messages || [];

  // Auto-scroll whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // Send text message
  const sendText = async () => {
    if (!textInput.trim() || sending || !selectedChatId) return;

    setSending(true);
    try {
      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", content: textInput.trim() }),
      });
      setTextInput("");
      mutateMessages();
      mutateChats(); // to update last message preview in sidebar
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  // Send file
  const sendFile = async () => {
    if (!fileInput || !selectedChatId) return;

    setSending(true);
    try {
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

      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FILE",
          fileUrl: publicUrl,
        }),
      });

      setFileInput(null);
      (document.getElementById("admin-file-input") as HTMLInputElement).value =
        "";
      mutateMessages();
      mutateChats();
    } catch (error) {
      console.error("Error sending file:", error);
    } finally {
      setSending(false);
    }
  };

  if (chatListError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-red-400">
            Error loading chat list
          </p>
          <p className="text-sm text-gray-400">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex h-screen">
        {/* ─── Sidebar: List of Chats ──────────────────────────── */}
        <div className="w-80 bg-zinc-900 border-r border-zinc-700 flex flex-col">
          <div className="p-4 border-b border-zinc-700">
            <h2 className="text-lg font-semibold text-white">User Chats</h2>
            <p className="text-sm text-zinc-400">
              {chatList.length} conversations
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
                  <MessageSquare className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-white font-medium">No chats yet</p>
                <p className="text-sm text-zinc-400">
                  User conversations will appear here
                </p>
              </div>
            ) : (
              chatList.map((chat) => {
                const lastMsg = chat.messages[0]; // most recent message
                const isSelected = selectedChatId === chat.id;

                return (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChatId(chat.id)}
                    className={cn(
                      "p-4 cursor-pointer border-b border-zinc-800 hover:bg-zinc-800 transition-colors",
                      isSelected && "bg-zinc-800 border-l-4 border-l-blue-500"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                        <User className="h-5 w-5 text-zinc-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {chat.user.name || chat.user.email}
                        </div>
                        <div className="text-sm text-zinc-400 truncate mt-1">
                          {lastMsg
                            ? lastMsg.type === "TEXT"
                              ? lastMsg.content?.slice(0, 40) +
                                ((lastMsg.content?.length ?? 0) > 40
                                  ? "..."
                                  : "")
                              : "📎 File attachment"
                            : "No messages"}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">
                          {lastMsg
                            ? new Date(lastMsg.createdAt).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── Main Chat Window ─────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-zinc-950">
          {selectedChatId ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-zinc-700 bg-zinc-900 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700">
                    <User className="h-4 w-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {chatList.find((c) => c.id === selectedChatId)?.user
                        .name ||
                        chatList.find((c) => c.id === selectedChatId)?.user
                          .email}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {messages.length} messages
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-4">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800">
                          <MessageSquare className="h-6 w-6 text-zinc-400" />
                        </div>
                        <p className="text-lg font-medium text-white">
                          No messages yet
                        </p>
                        <p className="text-sm text-zinc-400">
                          Start the conversation
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {messages.map((msg) => {
                        // WIP:Do something about this
                        const isAdminSender = msg.senderId === adminId;

                        return (
                          <div
                            key={msg.id}
                            className={cn(
                              "flex",
                              isAdminSender ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-2",
                                isAdminSender
                                  ? "bg-blue-600 text-white"
                                  : "bg-zinc-800 text-zinc-100"
                              )}
                            >
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
                                  isAdminSender ? "text-right" : "text-left"
                                )}
                              >
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
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
              <div className="border-t border-zinc-700 bg-zinc-900 p-4">
                {/* File Preview */}
                {fileInput && (
                  <div className="mb-4 flex items-center justify-between rounded-lg bg-zinc-800 p-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm font-medium text-white">
                        {fileInput.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        ({Math.round(fileInput.size / 1024)}KB)
                      </span>
                    </div>
                    <button
                      onClick={() => setFileInput(null)}
                      className="rounded-full p-1 hover:bg-zinc-700 text-zinc-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end space-x-2">
                  {/* File Input */}
                  <label className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-800 p-2 transition-colors hover:bg-zinc-700">
                    <Paperclip className="h-4 w-4 text-zinc-300" />
                    <input
                      id="admin-file-input"
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        setFileInput(e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {/* Text Input */}
                  <div className="flex-1">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="min-h-[44px] max-h-32 w-full resize-none rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={1}
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={fileInput ? sendFile : sendText}
                    disabled={(!textInput.trim() && !fileInput) || sending}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      (!textInput.trim() && !fileInput) || sending
                        ? "cursor-not-allowed bg-zinc-700 text-zinc-500"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {sending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <div className="mt-2 text-xs text-zinc-400">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
                  <MessageSquare className="h-8 w-8 text-zinc-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Select a chat
                </h2>
                <p className="text-zinc-400">
                  Choose a user conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
