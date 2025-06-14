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
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EstimatedReplyTimeSetting from "../../components/EstimatedReplyTimeSetting";
import CreateGamingIDModal from "../../components/CreateGamingIDModal";
import DepositFormModal from "../../components/DepositFormModal";
import WithdrawFormModal from "../../components/WithdrawlFormModal";
import TemplateModal from "../../components/AdminTemplateModal";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";

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
    fileType?: string | null;
    fileName?: string | null;
  }>;
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

type OptimisticMessage = Message & {
  status: "sending" | "sent" | "failed";
  isOptimistic: boolean;
};

type Props = {
  adminId: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// File validation constants
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
];

const AdminChat = ({ adminId }: Props) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [preview, setPreview] = useState<{
    url: string;
    type: string;
    fileName?: string;
  } | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [gamingIdModalOpen, setGamingIdModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  // Fetch chats
  const {
    data: chatListData,
    error: chatListError,
    mutate: mutateChats,
  } = useSWR("/api/chat", fetcher, { refreshInterval: 5000 });
  const chatList: ChatSummary[] = chatListData?.chats || [];
  const filteredChatList = chatList.filter((chat) => {
    const searchLower = searchQuery.toLowerCase();
    const userName = chat.user.name?.toLowerCase() || "";
    const userEmail = chat.user.email.toLowerCase();
    return userName.includes(searchLower) || userEmail.includes(searchLower);
  });

  // Fetch messages
  const { data: messagesData, mutate: mutateMessages } = useSWR(
    selectedChatId ? `/api/chat/${selectedChatId}` : null,
    fetcher,
    { refreshInterval: 2000 }
  );

  const serverMessages: Message[] = messagesData?.messages || [];

  // Auto-scroll whenever messages or optimisticMessages change
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [serverMessages, optimisticMessages]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setSidebarOpen(false);
    setOptimisticMessages([]);
  };
  const handleBackToChats = () => {
    setSelectedChatId(null);
    setSidebarOpen(true);
  };

  // Template send
  const handleTemplateSend = async (template: string) => {
    if (!selectedChatId) return;
    sendText(template);
  };

  // Send text (or template) with optimistic
  const sendText = async (overrideText?: string) => {
    if ((!textInput.trim() && !overrideText) || !selectedChatId) return;
    const content = overrideText ? overrideText : textInput.trim();
    if (!overrideText) setTextInput("");
    const createdAt = new Date().toISOString();
    const tempMessage: OptimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: adminId,
      type: "TEXT",
      content,
      fileUrl: null,
      fileName: undefined,
      fileType: undefined,
      createdAt,
      status: "sending",
      isOptimistic: true,
    };
    setOptimisticMessages((prev) => [...prev, tempMessage]);
    try {
      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", content }),
      });
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
      mutateMessages();
      mutateChats();
    } catch (error) {
      console.error("Error sending message:", error);
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // Audio recording
  useEffect(() => {
    if (!isRecording) return;
    let stream: MediaStream;
    let recorder: MediaRecorder;
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        stream = s;
        recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.ondataavailable = (e) => {
          setAudioChunks((prev) => [...prev, e.data]);
        };
        recorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: "audio/webm" });
          const file = new File([blob], `recording-${Date.now()}.webm`, {
            type: "audio/webm",
          });
          if (
            file.size <= MAX_SIZE_BYTES &&
            ALLOWED_MIME_TYPES.includes(file.type)
          ) {
            setFileInput(file);
          } else {
            alert("Recorded audio is not allowed or exceeds size limit.");
          }
          setAudioChunks([]);
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
      })
      .catch((err) => {
        console.error("Microphone access denied", err);
        alert("Cannot access microphone");
        setIsRecording(false);
      });
    return () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isRecording]);
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      setAudioChunks([]);
      setIsRecording(true);
    }
  };

  // File select
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      alert("File too large. Maximum size is 5 MB.");
      e.target.value = "";
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      alert("File type not allowed.");
      e.target.value = "";
      return;
    }
    setFileInput(file);
  };

  // Send file with optimistic
  const sendFile = async () => {
    if (!fileInput || !selectedChatId) return;
    const file = fileInput;
    setFileInput(null);
    (document.getElementById("admin-file-input") as HTMLInputElement).value =
      "";
    const objectUrl = URL.createObjectURL(file);
    const createdAt = new Date().toISOString();
    const tempMessage: OptimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: adminId,
      type: "FILE",
      content: file.name,
      fileUrl: objectUrl,
      fileName: file.name,
      fileType: file.type,
      createdAt,
      status: "sending",
      isOptimistic: true,
    };
    setOptimisticMessages((prev) => [...prev, tempMessage]);
    try {
      const presignRes = await fetch("/api/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!presignRes.ok) throw new Error("Presign failed");
      const { uploadUrl, publicUrl } = (await presignRes.json()) as {
        uploadUrl: string;
        publicUrl: string;
      };
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error("Upload failed");
      await fetch(`/api/chat/${selectedChatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FILE",
          fileUrl: publicUrl,
          fileName: file.name,
          fileType: file.type,
        }),
      });
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "sent" } : msg
        )
      );
      mutateMessages();
      mutateChats();
    } catch (error) {
      console.error("Error sending file:", error);
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
      alert("Failed to send file. Please try again.");
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

  const openPreviewModal = (msg: {
    url: string;
    type: string;
    fileName?: string;
  }) => {
    setPreview(msg);
  };
  const closePreviewModal = () => setPreview(null);

  return (
    <div className="fixed inset-0 top-16 bg-background flex overflow-hidden">
      {/* Preview Dialog */}
      {preview && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) closePreviewModal();
          }}
        >
          <DialogContent className="max-w-3xl w-full h-auto">
            <AlertDialogHeader>
              <DialogTitle>{preview.fileName}</DialogTitle>
              <DialogClose className="absolute top-2 right-2" />
            </AlertDialogHeader>
            <div className="mt-4">
              {preview.type.startsWith("image/") && (
                <Image
                  src={preview.url}
                  alt={preview.fileName || "image-preview"}
                  className="w-full h-auto object-contain"
                  width={600}
                  height={400}
                />
              )}
              {preview.type === "application/pdf" && (
                <embed
                  src={preview.url}
                  type="application/pdf"
                  width="100%"
                  height="600px"
                />
              )}
              {preview.type.startsWith("audio/") && (
                <audio controls src={preview.url} className="w-full" />
              )}
              {!preview.type.startsWith("image/") &&
                preview.type !== "application/pdf" &&
                !preview.type.startsWith("audio/") && (
                  <a
                    href={preview.url}
                    download
                    className="text-blue-600 hover:underline"
                  >
                    Download {preview.fileName || "file"}
                  </a>
                )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Deposit & Modals */}
      <DepositFormModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        chatId={selectedChatId ?? undefined}
      />
      <WithdrawFormModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        chatId={selectedChatId ?? undefined}
      />
      <CreateGamingIDModal
        isOpen={gamingIdModalOpen}
        onClose={() => setGamingIdModalOpen(false)}
        chatId={selectedChatId ?? undefined}
      />
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSendTemplate={handleTemplateSend}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-40 w-full max-w-sm bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:w-80"
        )}
      >
        <div className="p-4 border-b border-border bg-card/95 backdrop-blur-sm mt-14">
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
              <div className="h-full overflow-y-auto px-4 py-6 space-y-4">
                {serverMessages.length === 0 &&
                optimisticMessages.length === 0 ? (
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
                  <>
                    {/* Render server messages excluding those matching optimistic content */}
                    {serverMessages
                      .filter(
                        (srv) =>
                          !optimisticMessages.some(
                            (opt) =>
                              opt.type === srv.type &&
                              opt.content === srv.content
                          )
                      )
                      .map((msg, index) => {
                        const isAdminSender = msg.senderId === adminId;
                        const showTime =
                          index === 0 ||
                          new Date(msg.createdAt).getTime() -
                            new Date(
                              serverMessages[index - 1].createdAt
                            ).getTime() >
                            300000;
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
                                  <div className="space-y-2">
                                    {msg.fileType?.startsWith("image/") ? (
                                      <div
                                        className="relative rounded-lg overflow-hidden cursor-pointer max-w-xs"
                                        onClick={() =>
                                          msg.fileUrl &&
                                          msg.fileType &&
                                          openPreviewModal({
                                            url: msg.fileUrl,
                                            type: msg.fileType,
                                            fileName: msg.fileName,
                                          })
                                        }
                                      >
                                        <Image
                                          src={msg.fileUrl || ""}
                                          alt={msg.fileName || "Image"}
                                          width={300}
                                          height={200}
                                          className="object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg" />
                                      </div>
                                    ) : msg.fileType?.startsWith("audio/") ? (
                                      <div className="flex items-center space-x-3 bg-muted/50 rounded-lg p-3 min-w-[250px]">
                                        <div
                                          className={cn(
                                            "p-2 rounded-full",
                                            isAdminSender
                                              ? "bg-primary-foreground/20"
                                              : "bg-primary/20"
                                          )}
                                        >
                                          <Mic className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1">
                                          <audio
                                            controls
                                            src={msg.fileUrl || ""}
                                            className="w-full h-8"
                                            style={{
                                              filter: isAdminSender
                                                ? "invert(1)"
                                                : "none",
                                            }}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="flex items-center space-x-3 cursor-pointer bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors"
                                        onClick={() =>
                                          msg.fileUrl &&
                                          msg.fileType &&
                                          openPreviewModal({
                                            url: msg.fileUrl,
                                            type: msg.fileType,
                                            fileName: msg.fileName,
                                          })
                                        }
                                      >
                                        <div
                                          className={cn(
                                            "p-2 rounded-lg",
                                            isAdminSender
                                              ? "bg-primary-foreground/20"
                                              : "bg-primary/20"
                                          )}
                                        >
                                          <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {msg.fileName || "File attachment"}
                                          </p>
                                          <p className="text-xs opacity-70">
                                            {msg.fileType
                                              ?.split("/")[1]
                                              ?.toUpperCase() || "FILE"}
                                          </p>
                                        </div>
                                        <Download className="h-4 w-4 opacity-70" />
                                      </div>
                                    )}
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
                                      { hour: "2-digit", minute: "2-digit" }
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

                    {/* Optimistic messages */}
                    {optimisticMessages.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-end space-x-2 justify-end"
                      >
                        <div
                          className={cn(
                            "max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm rounded-br-md transition-colors",
                            opt.status === "failed"
                              ? "bg-red-500/80 text-white"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          {opt.type === "TEXT" ? (
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                              {opt.content}
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {opt.fileType?.startsWith("image/") ? (
                                <div
                                  className="relative rounded-lg overflow-hidden cursor-pointer max-w-xs"
                                  onClick={() =>
                                    openPreviewModal({
                                      url: opt.fileUrl || "",
                                      type: opt.fileType || "",
                                      fileName: opt.fileName,
                                    })
                                  }
                                >
                                  <Image
                                    src={opt.fileUrl || ""}
                                    alt={opt.fileName || "Image"}
                                    width={300}
                                    height={200}
                                    className="object-cover rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg" />
                                </div>
                              ) : opt.fileType?.startsWith("audio/") ? (
                                <div className="flex items-center space-x-3 bg-primary-foreground/20 rounded-lg p-3 min-w-[250px]">
                                  <div className="p-2 rounded-full bg-primary-foreground/30">
                                    <Mic className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1">
                                    <audio
                                      controls
                                      src={opt.fileUrl || ""}
                                      className="w-full h-8"
                                      style={{ filter: "invert(1)" }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="flex items-center space-x-3 cursor-pointer bg-primary-foreground/20 rounded-lg p-3 hover:bg-primary-foreground/30 transition-colors"
                                  onClick={() =>
                                    openPreviewModal({
                                      url: opt.fileUrl || "",
                                      type: opt.fileType || "",
                                      fileName: opt.fileName,
                                    })
                                  }
                                >
                                  <div className="p-2 rounded-lg bg-primary-foreground/30">
                                    <FileText className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {opt.fileName || opt.content}
                                    </p>
                                    <p className="text-xs opacity-70">
                                      {opt.fileType
                                        ?.split("/")[1]
                                        ?.toUpperCase() || "FILE"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-end mt-1 space-x-1 text-primary-foreground/70">
                            <span className="text-xs">
                              {new Date(opt.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {opt.status === "sending" && (
                              <Clock className="h-3 w-3" />
                            )}
                            {opt.status === "sent" && (
                              <CheckCheck className="h-3 w-3" />
                            )}
                            {opt.status === "failed" && (
                              <X className="h-3 w-3 text-red-200" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="border-t border-b border-border bg-card/50 p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 rounded-lg text-yellow-400 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">Templates</span>
                </button>
                <button
                  onClick={() => setDepositModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-500 transition-colors"
                >
                  <BanknoteArrowDown className="h-4 w-4" />
                  <span className="text-sm font-medium">Deposit</span>
                </button>
                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-amber-600 transition-colors"
                >
                  <BanknoteArrowUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Withdraw</span>
                </button>
                <button
                  onClick={() => setGamingIdModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-500 transition-colors"
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
                <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {fileInput.type.startsWith("image/") ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          <Image
                            src={URL.createObjectURL(fileInput)}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {fileInput.type.startsWith("audio/") ? (
                            <Mic className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {fileInput.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(fileInput.size / 1024)}KB •{" "}
                          {fileInput.type.split("/")[1]?.toUpperCase()}
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
                  {fileInput.type.startsWith("audio/") && (
                    <div className="mt-3">
                      <audio
                        controls
                        src={URL.createObjectURL(fileInput)}
                        className="w-full h-8"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-end space-x-2">
                <label className="cursor-pointer p-2 hover:bg-muted rounded-lg transition-colors border border-border">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <input
                    id="admin-file-input"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,image/*,audio/*"
                  />
                </label>
                <button
                  onClick={toggleRecording}
                  aria-label={
                    isRecording ? "Stop recording" : "Start recording"
                  }
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {isRecording ? (
                    <X className="h-5 w-5 text-red-500" />
                  ) : (
                    <Mic className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
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
                <button
                  onClick={() => {
                    if (fileInput) {
                      sendFile();
                    } else {
                      sendText();
                    }
                  }}
                  disabled={(!textInput.trim() && !fileInput) || false}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 flex items-center justify-center",
                    !textInput.trim() && !fileInput
                      ? "cursor-not-allowed bg-muted text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md active:scale-95"
                  )}
                >
                  <Send className="h-5 w-5" />
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
