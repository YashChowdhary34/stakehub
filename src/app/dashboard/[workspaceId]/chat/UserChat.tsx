"use client";

import { cn } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  X,
  Clock,
  Check,
  AlertCircle,
  Mic,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/global/loader/spinner";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";

type Message = {
  id: string;
  senderId: string;
  type: "TEXT" | "FILE";
  content: string | null;
  fileUrl: string | null;
  fileName?: string | null;
  fileType?: string | null;
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

type Preview = {
  url: string;
  type: string;
  fileName?: string;
} | null;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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

const UserChat = ({ userId, eta }: Props) => {
  // --- State ---
  const [chatId, setChatId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<
    OptimisticMessage[]
  >([]);
  const [preview, setPreview] = useState<Preview>(null);

  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- Effects ---

  // Audio recording effect
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
          setFileInput(file);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Chat initialization
  useEffect(() => {
    async function initChat() {
      setCreating(true);
      try {
        const res = await fetch("/api/chat", { method: "GET" });
        const data = await res.json();
        if (res.status === 200 && data.chat && data.chat.id) {
          setChatId(data.chat.id);
        } else if (res.status === 404) {
          const createRes = await fetch("/api/chat", { method: "POST" });
          const createData = await createRes.json();
          if (createRes.ok && createData.chat && createData.chat.id) {
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
  const { data: messagesData, error: messagesError } = useSWR(
    chatId ? `/api/chat/${chatId}` : null,
    fetcher,
    {
      refreshInterval: 3000,
    }
  );

  // Clean up optimistic messages that have been sent
  const cleanOptimisticMessages = (
    serverMsgs: Message[],
    optimisticMsgs: OptimisticMessage[]
  ) => {
    return optimisticMsgs.filter((optimisticMsg) => {
      if (optimisticMsg.status === "failed") return true;
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

  const serverMessages: Message[] = messagesData?.messages || [];
  const cleanedOptimisticMessages = cleanOptimisticMessages(
    serverMessages,
    optimisticMessages
  );

  // Remove optimistic messages that now exist on the server
  useEffect(() => {
    const cleaned = cleanOptimisticMessages(serverMessages, optimisticMessages);
    if (cleaned.length !== optimisticMessages.length) {
      setOptimisticMessages(cleaned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverMessages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData, optimisticMessages]);

  // --- Handlers ---

  function openPreviewModal(msg: {
    fileUrl: string;
    fileType: string;
    fileName?: string;
  }) {
    setPreview({
      url: msg.fileUrl,
      type: msg.fileType,
      fileName: msg.fileName,
    });
  }
  function closePreviewModal() {
    setPreview(null);
  }

  function toggleRecording() {
    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      setAudioChunks([]);
      setIsRecording(true);
    }
  }

  // File input validation and selection
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE_BYTES) {
      alert("File too large. Maximum size is 5 MB.");
      e.target.value = "";
      return;
    }
    if (
      !ALLOWED_MIME_TYPES.some(
        (type) =>
          file.type === type ||
          (type.endsWith("/*") && file.type.startsWith(type.split("/")[0]))
      )
    ) {
      alert("File type not allowed.");
      e.target.value = "";
      return;
    }
    setFileInput(file);
  }

  // Send text message
  const sendText = async () => {
    if (!textInput.trim()) return;

    const tempMessage: OptimisticMessage = {
      id: `temp-${Date.now()}`,
      senderId: userId,
      type: "TEXT",
      content: textInput.trim(),
      fileUrl: null,
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
    };

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
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? { ...msg, status: "sent" } : msg
          )
        );
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.log(error);
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // Send file message
  const sendFile = async () => {
    if (!fileInput) return;

    const currentFile = fileInput;
    const tempMessage: OptimisticMessage = {
      id: `temp-file-${Date.now()}`,
      senderId: userId,
      type: "FILE",
      content: null,
      fileUrl: null,
      fileName: currentFile.name,
      fileType: currentFile.type,
      createdAt: new Date().toISOString(),
      status: "sending",
      isOptimistic: true,
    };

    setOptimisticMessages((prev) => [...prev, tempMessage]);
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

      if (!presignRes.ok) throw new Error("Presign failed");
      const { uploadUrl, publicUrl } = await presignRes.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: currentFile,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "FILE",
          fileUrl: publicUrl,
          fileName,
          fileType,
        }),
      });

      if (response.ok) {
        setOptimisticMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, status: "sent", fileUrl: publicUrl }
              : msg
          )
        );
      } else {
        throw new Error("Failed to send file message");
      }
    } catch (error) {
      console.log(error);
      setOptimisticMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        )
      );
    }
  };

  // Handle Enter key for sending text
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // --- Early returns for loading/error states (hooks above!) ---

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

  // --- Render ---

  const allMessages = [...serverMessages, ...cleanedOptimisticMessages];

  return (
    <div className="flex flex-col h-full">
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
                  alt={preview.fileName || "image-alt"}
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

      {/* Header */}
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

      {/* Messages */}
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
                const isMine = msg.senderId === userId;
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
                            : "bg-white text-black"
                          : "bg-zinc-300 text-black",
                        isMine ? "rounded-br-sm" : "rounded-bl-sm"
                      )}
                      style={{
                        boxShadow: "0 1px 0.5px rgba(0,0,0,.13)",
                      }}
                    >
                      {msg.type === "FILE" && msg.fileUrl && msg.fileType ? (
                        <div className="flex flex-col space-y-1">
                          {/* Image */}
                          {msg.fileType.startsWith("image/") && (
                            <Image
                              src={msg.fileUrl}
                              alt={msg.fileName || "image-message"}
                              className="max-h-40 w-auto rounded cursor-pointer"
                              width={320}
                              height={240}
                              onClick={() =>
                                msg.fileUrl && msg.fileType
                                  ? openPreviewModal({
                                      fileUrl: msg.fileUrl,
                                      fileType: msg.fileType,
                                      fileName: msg.fileName ?? undefined,
                                    })
                                  : undefined
                              }
                            />
                          )}
                          {/* PDF */}
                          {msg.fileType === "application/pdf" && (
                            <div
                              className="flex items-center space-x-2 cursor-pointer"
                              onClick={() =>
                                msg.fileUrl && msg.fileType
                                  ? openPreviewModal({
                                      fileUrl: msg.fileUrl,
                                      fileType: msg.fileType,
                                      fileName: msg.fileName ?? undefined,
                                    })
                                  : undefined
                              }
                            >
                              <FileText className="h-5 w-5 text-gray-600" />
                              <span className="text-sm text-blue-600 hover:underline">
                                {msg.fileName || "View PDF"}
                              </span>
                            </div>
                          )}
                          {/* Audio */}
                          {msg.fileType.startsWith("audio/") && (
                            <div className="flex items-center space-x-2">
                              <audio
                                controls
                                src={msg.fileUrl}
                                className="max-w-full"
                              />
                              <a
                                href={msg.fileUrl}
                                download
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Download
                              </a>
                            </div>
                          )}
                          {/* Fallback for other types */}
                          {!msg.fileType.startsWith("image/") &&
                            msg.fileType !== "application/pdf" &&
                            !msg.fileType.startsWith("audio/") && (
                              <div className="flex items-center space-x-2">
                                <FileText className="h-5 w-5 text-gray-600" />
                                <a
                                  href={msg.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {msg.fileName || "Download file"}
                                </a>
                              </div>
                            )}
                          {/* Timestamp & status */}
                          <div
                            className={cn(
                              "flex items-center justify-end gap-1 mt-1 text-xs",
                              isMine ? "text-gray-500" : "text-gray-500"
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
                      ) : (
                        <div className="break-words">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
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
                      )}
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
                accept=".pdf,image/*,audio/*"
                onChange={handleFileSelect}
              />
            </label>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="p-2"
            onClick={toggleRecording}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <X className="h-4 w-4 text-red-500" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
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
            aria-label="Send message"
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
