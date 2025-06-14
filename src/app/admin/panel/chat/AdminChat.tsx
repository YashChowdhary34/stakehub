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
  Menu,
  ArrowLeft,
  Search,
  MoreVertical,
  CheckCheck,
  BanknoteArrowDown,
  BanknoteArrowUp,
  CirclePlus,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EstimatedReplyTimeSetting from "../../components/EstimatedReplyTimeSetting";
import CreateGamingIDModal from "../../components/CreateGamingIDModal";
import DepositFormModal from "../../components/DepositFormModal";
import WithdrawFormModal from "../../components/WithdrawlFormModal";
import TemplateModal from "../../components/AdminTemplateModal";

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
  fileName?: string;
  fileType?: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDepositFormOpen, setIsDepositFormOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isWithdrawlFormOpen, setIsWithdrawlFormOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingMessages, setPendingMessages] = useState<
    Map<
      string,
      {
        content: string;
        type: "TEXT" | "FILE";
        fileUrl?: string;
        timestamp: number;
      }
    >
  >(new Map());
  const [failedMessages, setFailedMessages] = useState<Set<string>>(new Set());

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

  const filteredChatList = chatList.filter((chat) => {
    const searchLower = searchQuery.toLowerCase();
    const userName = chat.user.name?.toLowerCase() || "";
    const userEmail = chat.user.email.toLowerCase();

    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

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

  // Close sidebar when chat is selected on mobile
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);
  };

  // Handle back button on mobile
  const handleBackToChats = () => {
    setSelectedChatId(null);
    setSidebarOpen(true);
  };

  const handleTemplateSend = async (template: string) => {
    if (!selectedChatId || sending) return;

    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      content: template,
      type: "TEXT" as const,
      timestamp: Date.now(),
    };

    // Add to pending messages
    setPendingMessages((prev) => new Map(prev).set(tempId, tempMessage));

    setSending(true);
    try {
      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", content: template }),
      });

      // Remove from pending on success
      setPendingMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      mutateMessages();
      mutateChats();
    } catch (error) {
      console.error("Error sending template message:", error);

      // Mark as failed
      setFailedMessages((prev) => new Set(prev).add(tempId));

      // Show error alert
      alert("Failed to send message. Please try again.");

      throw error;
    } finally {
      setSending(false);
    }
  };

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

    const tempId = `temp-${Date.now()}`;
    const content = textInput.trim();
    const tempMessage = {
      content,
      type: "TEXT" as const,
      timestamp: Date.now(),
    };

    // Add to pending messages
    setPendingMessages((prev) => new Map(prev).set(tempId, tempMessage));
    setTextInput(""); // Clear input immediately

    setSending(true);
    try {
      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", content }),
      });

      // Remove from pending on success
      setPendingMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      mutateMessages();
      mutateChats();
    } catch (error) {
      console.error("Error sending message:", error);

      // Mark as failed
      setFailedMessages((prev) => new Set(prev).add(tempId));

      // Show error alert
      alert("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Send file
  const sendFile = async () => {
    if (!fileInput || !selectedChatId) return;

    const tempId = `temp-${Date.now()}`;
    const fileName = fileInput.name;
    const tempMessage = {
      content: fileName,
      type: "FILE" as const,
      fileUrl: "",
      timestamp: Date.now(),
    };

    // Add to pending messages
    setPendingMessages((prev) => new Map(prev).set(tempId, tempMessage));
    setFileInput(null);
    (document.getElementById("admin-file-input") as HTMLInputElement).value =
      "";

    setSending(true);
    try {
      const fileType = fileInput.type;

      const presignRes = await fetch("/api/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType }),
      });

      if (!presignRes.ok) {
        throw new Error("Presign failed");
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
        throw new Error("Upload failed");
      }

      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FILE",
          fileUrl: publicUrl,
        }),
      });

      // Remove from pending on success
      setPendingMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempId);
        return newMap;
      });

      mutateMessages();
      mutateChats();
    } catch (error) {
      console.error("Error sending file:", error);

      // Mark as failed
      setFailedMessages((prev) => new Set(prev).add(tempId));

      // Show error alert
      alert("Failed to send file. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (chatListError) {
    return (
      <div className="fixed inset-0 top-16 bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mx-auto">
            <MessageSquare className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-red-500">
            Connection Error
          </h2>
          <p className="text-muted-foreground mb-4">
            Unable to load chat conversations. Please check your connection and
            try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-16 bg-background flex overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Deposit Form Modal */}
      <DepositFormModal
        isOpen={isDepositFormOpen}
        onClose={() => setIsDepositFormOpen(false)}
        chatId={selectedChatId ?? undefined}
      />
      <WithdrawFormModal
        isOpen={isWithdrawlFormOpen}
        onClose={() => setIsWithdrawlFormOpen(false)}
        chatId={selectedChatId ?? undefined}
      />

      {/* Create ID modal */}
      <CreateGamingIDModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        chatId={selectedChatId ?? undefined}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSendTemplate={handleTemplateSend}
      />

      {/* ─── Sidebar: List of Chats ──────────────────────────── */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-full max-w-sm bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:w-80"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border bg-card/95 backdrop-blur-sm mt-14">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Admin Chat
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredChatList.length} conversation
                  {filteredChatList.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <EstimatedReplyTimeSetting />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChatList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "When users start conversations, they'll appear here for you to respond to."}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredChatList.map((chat) => {
                const lastMsg = chat.messages[0];
                const isSelected = selectedChatId === chat.id;
                const timeAgo = lastMsg ? new Date(lastMsg.createdAt) : null;

                return (
                  <div
                    key={chat.id}
                    onClick={() => handleChatSelect(chat.id)}
                    className={cn(
                      "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors relative",
                      isSelected && "bg-primary/5 border-l-4 border-l-primary"
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-card rounded-full"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground truncate pr-2">
                              {chat.user.email || "Anonymous User"}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {chat.user.id}
                            </p>
                          </div>
                          {timeAgo && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {timeAgo.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate pr-2">
                            {lastMsg ? (
                              lastMsg.type === "TEXT" ? (
                                lastMsg.content?.slice(0, 35) +
                                ((lastMsg.content?.length ?? 0) > 35
                                  ? "..."
                                  : "")
                              ) : (
                                <span className="flex items-center">
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  File attachment
                                </span>
                              )
                            ) : (
                              <span className="italic">No messages yet</span>
                            )}
                          </p>

                          {lastMsg && (
                            <div className="flex items-center space-x-1 flex-shrink-0">
                              <CheckCheck className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChatId ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border bg-card/95 backdrop-blur-sm px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleBackToChats}
                    className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="hidden lg:block xl:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Menu className="h-5 w-5 text-muted-foreground" />
                  </button>

                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-card rounded-full"></div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground">
                        {chatList.find((c) => c.id === selectedChatId)?.user
                          .name || "Anonymous User"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {
                          chatList.find((c) => c.id === selectedChatId)?.user
                            .email
                        }{" "}
                        • Online
                      </p>
                    </div>
                  </div>
                </div>

                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <MoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden bg-gradient-to-b from-background to-muted/20">
              <div className="h-full overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="text-center max-w-sm">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Start the conversation
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Send a message to begin chatting with this user
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-6 space-y-4">
                    {/* Regular messages */}
                    {messages.map((msg, index) => {
                      const isAdminSender = msg.senderId === adminId;
                      const showTime =
                        index === 0 ||
                        new Date(msg.createdAt).getTime() -
                          new Date(messages[index - 1].createdAt).getTime() >
                          300000; // 5 minutes

                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <div className="flex justify-center mb-4">
                              <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                                {new Date(msg.createdAt).toLocaleDateString()}{" "}
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" }
                                )}
                              </span>
                            </div>
                          )}

                          <div
                            className={cn(
                              "flex items-end space-x-2",
                              isAdminSender ? "justify-end" : "justify-start"
                            )}
                          >
                            {!isAdminSender && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex-shrink-0">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                            )}

                            <div
                              className={cn(
                                "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                                isAdminSender
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-card border border-border rounded-bl-md"
                              )}
                            >
                              {msg.type === "TEXT" ? (
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.content}
                                </p>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn(
                                      "p-2 rounded-lg",
                                      isAdminSender
                                        ? "bg-primary-foreground/10"
                                        : "bg-muted"
                                    )}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <a
                                      href={msg.fileUrl!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center space-x-2 text-sm hover:underline"
                                    >
                                      <span className="truncate">
                                        File attachment
                                      </span>
                                      <Download className="h-3 w-3 flex-shrink-0" />
                                    </a>
                                  </div>
                                </div>
                              )}

                              <div
                                className={cn(
                                  "flex items-center justify-end mt-1 space-x-1",
                                  isAdminSender
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                )}
                              >
                                <span className="text-xs">
                                  {new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                                {isAdminSender && (
                                  <CheckCheck className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Pending messages */}
                    {Array.from(pendingMessages.entries()).map(
                      ([tempId, tempMsg]) => (
                        <div key={tempId}>
                          <div className="flex items-end space-x-2 justify-end">
                            <div
                              className={cn(
                                "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm rounded-br-md transition-colors",
                                failedMessages.has(tempId)
                                  ? "bg-red-500/80 text-white"
                                  : "bg-primary text-primary-foreground"
                              )}
                            >
                              {tempMsg.type === "TEXT" ? (
                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {tempMsg.content}
                                </p>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  <div className="p-2 rounded-lg bg-primary-foreground/10">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm truncate">
                                      {tempMsg.content}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-end mt-1 space-x-1 text-primary-foreground/70">
                                <span className="text-xs">
                                  {new Date(
                                    tempMsg.timestamp
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {failedMessages.has(tempId) ? (
                                  <X className="h-3 w-3 text-red-200" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="border-t border-b border-border bg-card/50 p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setIsTemplateModalOpen(true)}
                  disabled={!selectedChatId} // Add this line
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-lg transition-colors text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">Templates</span>
                </button>
                <button
                  onClick={() => setIsDepositFormOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BanknoteArrowDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Deposit</span>
                </button>
                <button
                  onClick={() => setIsWithdrawlFormOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors text-amber-600"
                >
                  <BanknoteArrowUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Withdraw</span>
                </button>
                <button
                  onClick={() => {
                    setModalOpen(true);
                  }}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-blue-500"
                >
                  <CirclePlus className="h-4 w-4" />
                  <span className="text-sm font-medium">Create ID</span>
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-card/95 backdrop-blur-sm p-4">
              {/* File Preview */}
              {fileInput && (
                <div className="mb-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {fileInput.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(fileInput.size / 1024)}KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFileInput(null)}
                      className="p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-end space-x-2">
                {/* File Input */}
                <label className="cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors border border-border">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <input
                    id="admin-file-input"
                    type="file"
                    className="hidden"
                    onChange={(e) => setFileInput(e.target.files?.[0] || null)}
                  />
                </label>

                {/* Text Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full min-h-[44px] max-h-32 resize-none rounded-lg border border-border bg-background px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    rows={1}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={fileInput ? sendFile : sendText}
                  disabled={(!textInput.trim() && !fileInput) || sending}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                    (!textInput.trim() && !fileInput) || sending
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-95"
                  )}
                >
                  {sending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="mt-2 text-xs text-muted-foreground md:flex hidden">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                Welcome to Admin Chat
              </h2>
              <p className="text-muted-foreground mb-6">
                Select a conversation from the sidebar to start messaging with
                users. You can respond to their questions and provide support.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                View Conversations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
