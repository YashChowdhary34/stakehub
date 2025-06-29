"use client";

import { $Enums } from "@/generated/prisma";
import {
  Download,
  FileIcon,
  FileText,
  ImageIcon,
  Mic,
  Paperclip,
  Pause,
  Play,
  Send,
  Volume2,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

type userSessionType = {
  status?: number;
  message?: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profit: number | null;
    role: $Enums.Role;
  };
};

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

type Props = {
  session: userSessionType;
  userId: string | null;
};

let socket: ReturnType<typeof io>;
const PAGE_LIMIT = 50;

const UserChat = ({ session, userId }: Props) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);

  // UI State
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>(
    {}
  );
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // File handling
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileUrl, setfileUrl] = useState("");
  const [filePath, setFilePath] = useState("");
  const [textInput, setTextInput] = useState("");

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

  useEffect(() => {
    if (!chatId) return;
    async function initSocket() {
      socket = io("http://localhost:4000/");
      socket.emit("join", {
        chatId: chatId,
        userId: userId,
        isAdmin: false,
      });

      socket.on("text", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });

      socket.on("file", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
        scrollToBottom();
      });

      socket.on("presence", ({ userId, isAdmin, status }) => {
        if (isAdmin) {
          setAdminOnline(status === "online");
        }
        console.log("User ", userId);
      });
    }
    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, [chatId, userId]);

  // Load cached on mount or chatId change
  useEffect(() => {
    if (!chatId) return;
    const cached = localStorage.getItem("chat-" + chatId);
    if (cached) {
      try {
        const parsed: Message[] = JSON.parse(cached);
        setMessages(parsed);
        // Record newsest timestamp for delta fetch
        const newest =
          parsed.length > 0 ? parsed[parsed.length - 1].createdAt : null;
        // Fetch only the messages after newest
        if (newest) {
          fetchNewerMessages(newest);
        } else {
          fetchLatestPage();
        }
      } catch (error) {
        console.error("error parsing cached messages:", error);
        fetchLatestPage();
      }
    } else {
      fetchLatestPage();
    }

    async function fetchLatestPage() {
      const res = await fetch(`/api/chat/${chatId}?limit=${PAGE_LIMIT}`);
      if (res.ok) {
        const { messages: fetchedMessages } = await res.json();
        setMessages(fetchedMessages);
        // Cache and set cursor
        localStorage.setItem("chat-" + chatId, JSON.stringify(fetchedMessages));
        if (fetchedMessages.length > 0) {
          setLastTimestamp(fetchedMessages[0].createdAt);
          setHasMore(fetchedMessages.length >= PAGE_LIMIT);
        }
        // WIP: setup unread buffer
      }
    }

    async function fetchNewerMessages(newestTimestamp: string) {
      const res = await fetch(
        `/api/chat/${chatId}?after=${encodeURIComponent(newestTimestamp)}`
      );
      if (res.ok) {
        const data = await res.json();
        const newer: Message[] = data.newMessages || [];
        if (newer.length > 0) {
          setMessages((prev) => {
            // Append newer to prev, dedupe just in case
            const map = new Map(prev.map((m) => [m.id, m]));
            newer.forEach((m) => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            const merged = Array.from(map.values());
            merged.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            localStorage.setItem("chat-" + chatId, JSON.stringify(merged));

            return merged;
          });
        }
      }
    }
  }, [chatId]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Pagination
  const loadMore = async () => {
    if (!chatId || !hasMore || !lastTimestamp) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/chat/${chatId}?limit=${PAGE_LIMIT}&before=${encodeURIComponent(
          lastTimestamp
        )}`
      );
      if (res.ok) {
        const { messages: olderMessages } = await res.json();
        if (olderMessages.length > 0) {
          setMessages((prev) => {
            // Prepend older, dedupe:
            const map = new Map<string, Message>();
            olderMessages.forEach((m: Message) => map.set(m.id, m));
            prev.forEach((m) => {
              if (!map.has(m.id)) map.set(m.id, m);
            });
            const merged = Array.from(map.values());
            merged.sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
            // Update cursor to earliest
            setLastTimestamp(merged[0].createdAt);
            setHasMore(olderMessages.length >= PAGE_LIMIT);
            // Cache
            localStorage.setItem("chat-" + chatId, JSON.stringify(merged));
            // WIP: unread add
            return merged;
          });
        }
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Send text
  const sendText = async () => {
    if (!textInput.trim() || !chatId || !userId || !socket) return;
    socket.emit("text", { chatId, senderId: userId, text: textInput });
    setTextInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [textInput, adjustTextareaHeight]);

  // Audio recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      const audioChunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        setFileInput(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
    } catch (error) {
      console.error("Microphone access denied", error);
      alert("Cannot access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Audio playback functionality
  const toggleAudioPlayback = (messageId: string, audioUrl: string) => {
    if (playingAudioId === messageId) {
      // Pause current audio
      const audio = audioRefs.current[messageId];
      if (audio) {
        audio.pause();
      }
      setPlayingAudioId(null);
    } else {
      // Stop any currently playing audio
      if (playingAudioId && audioRefs.current[playingAudioId]) {
        audioRefs.current[playingAudioId].pause();
      }

      // Play new audio
      let audio = audioRefs.current[messageId];
      if (!audio) {
        audio = new Audio(audioUrl);
        audioRefs.current[messageId] = audio;

        audio.ontimeupdate = () => {
          setAudioProgress((prev) => ({
            ...prev,
            [messageId]: (audio.currentTime / audio.duration) * 100,
          }));
        };

        audio.onended = () => {
          setPlayingAudioId(null);
          setAudioProgress((prev) => ({ ...prev, [messageId]: 0 }));
        };
      }

      audio.play();
      setPlayingAudioId(messageId);
    }
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInput(file);
    }
  };

  const sendFile = async () => {
    if (!chatId || !fileInput) return;
    try {
      const fileName = fileInput.name;
      const fileType = fileInput.type;

      // Get upload URLs from backend
      const res = await fetch("/api/upload-presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName, fileType, chatId, userId }),
      });

      let body;
      if (res.ok) {
        body = await res.json();
      } else {
        try {
          body = await res.json();
        } catch {
          const text = await res.text();
          body = { error: text || "Unknown error" };
        }
        console.error("Upload presign failed:", body.error);
        return;
      }

      const { uploadUrl, path } = body;

      // Upload file to storage
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": fileType },
        body: fileInput,
      });

      if (uploadRes.ok) {
        const res_download = await fetch("/api/download-presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });

        if (res_download.ok) {
          body = await res_download.json();
        } else {
          try {
            body = await res_download.json();
          } catch {
            const text = await res_download.text();
            body = { error: text || "Unknown error" };
          }
          console.error("Upload presign failed:", body.error);
          return;
        }

        const { downloadUrl } = body;
        // Send file message via socket
        socket.emit("file", {
          chatId,
          senderId: userId,
          fileName,
          filePath: path,
          fileType,
          fileUrl: downloadUrl,
        });

        // Clear file input
        setFileInput(null);
      }
    } catch (error) {
      console.error("Error sending file:", error);
    }
  };

  // File download handler
  const downloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "download";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File preview component
  const FilePreview = ({ message }: { message: Message }) => {
    if (!message.fileUrl || !message.fileType) return null;

    const isImage = message.fileType.startsWith("image/");
    const isAudio = message.fileType.startsWith("audio/");
    const isPdf = message.fileType === "application/pdf";

    if (isImage) {
      return (
        <div className="max-w-xs rounded-lg overflow-hidden">
          <Image
            src={message.fileUrl}
            alt={message.fileName || "Image"}
            className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
            width={100}
            height={100}
            onClick={() => window.open(message.fileUrl!, "_blank")}
          />
          {message.fileName && (
            <div className="px-3 py-2 bg-black/10 text-xs">
              {message.fileName}
            </div>
          )}
        </div>
      );
    }

    if (isAudio) {
      const isPlaying = playingAudioId === message.id;
      const progress = audioProgress[message.id] || 0;

      return (
        <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg min-w-[200px]">
          <button
            onClick={() => toggleAudioPlayback(message.id, message.fileUrl!)}
            className="flex-shrink-0 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Volume2 className="h-3 w-3 opacity-60" />
              <span className="text-xs opacity-60">
                {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-1">
              <div
                className="bg-white h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={() =>
              downloadFile(message.fileUrl!, message.fileName || "audio")
            }
            className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
      );
    }

    // Default file display
    return (
      <div className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg max-w-xs">
        <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
          {isPdf ? (
            <FileText className="h-4 w-4" />
          ) : (
            <FileIcon className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">
            {message.fileName || "File"}
          </div>
          <p className="text-xs opacity-60">{message.fileType}</p>
        </div>
        <button
          onClick={() =>
            downloadFile(message.fileUrl!, message.fileName || "file")
          }
          className="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <Download className="h-3 w-3" />
        </button>
      </div>
    );
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-zinc-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-zinc-900">
              Support Chat
            </h1>
            <div className="text-sm text-zinc-500 mt-1">
              {adminOnline ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Admin online
                </span>
              ) : (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-zinc-400 rounded-full mr-2"></div>
                  We&apos;ll respond soon
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4"
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-4 py-2 text-sm text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.map((message) => {
          const isOwn = message.senderId === userId;
          const isFile = message.type === "FILE";

          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[70%] ${
                  isOwn ? "order-2" : "order-1"
                }`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isOwn
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {isFile ? (
                    <FilePreview message={message} />
                  ) : (
                    <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                  )}
                </div>
                <p
                  className={`text-xs text-zinc-500 mt-1 px-2 ${
                    isOwn ? "text-right" : "text-left"
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-zinc-200 bg-white">
        {/* File Preview */}
        {fileInput && (
          <div className="px-4 sm:px-6 py-3 bg-zinc-50 border-b border-zinc-200">
            <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-zinc-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-zinc-100 rounded-lg">
                  {fileInput.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-zinc-600" />
                  ) : fileInput.type.startsWith("audio/") ? (
                    <Volume2 className="h-4 w-4 text-zinc-600" />
                  ) : (
                    <FileIcon className="h-4 w-4 text-zinc-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">
                    {fileInput.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {(fileInput.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={sendFile}
                  className="px-3 py-1.5 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => setFileInput(null)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && (
          <div className="px-4 sm:px-6 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-red-700">
                  Recording
                </span>
              </div>
              <span className="text-sm text-red-600">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          </div>
        )}

        {/* Input Controls */}
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-end space-x-3">
            {/* File Upload */}
            <div className="flex-shrink-0">
              <input
                type="file"
                ref={(input) => {
                  if (input) {
                    input.addEventListener("change", handleFileSelect);
                  }
                }}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="p-2.5 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors cursor-pointer"
              >
                <Paperclip className="h-5 w-5" />
              </label>
            </div>

            {/* Text Input */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none text-sm sm:text-base placeholder-zinc-500"
                rows={1}
                style={{ maxHeight: "120px" }}
              />
            </div>

            {/* Audio Recording */}
            <div className="flex-shrink-0">
              <button
                onClick={toggleRecording}
                className={`p-2.5 rounded-full transition-colors ${
                  isRecording
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            </div>

            {/* Send Button */}
            <div className="flex-shrink-0">
              <button
                onClick={sendText}
                disabled={!textInput.trim() || creating}
                className="p-2.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {creating && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 mx-auto mb-4"></div>
            <p className="text-sm text-zinc-600">Initializing chat...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserChat;
