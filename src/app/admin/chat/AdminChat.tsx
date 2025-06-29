"use client";
import ErrorMessage from "@/components/global/error/ErrorMessage";
import { $Enums } from "@/generated/prisma";
import React, { useEffect, useState } from "react";
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

type ChatSummary = {
  id?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    platforms: string;
  };
  messages?: {
    id: string;
    type: "TEXT" | "FILE";
    content: string | null;
    fileUrl?: string | null;
    fileType?: string | null;
    fileName?: string | null;
    createdAt: string;
  };
};

type Message = {
  id: string;
  senderId?: string;
  type: "TEXT" | "FILE";
  content: string | null;
  fileUrl?: string | null;
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

const AdminChat = ({ session, userId }: Props) => {
  const [chatList, setChatList] = useState<ChatSummary[]>([]);
  const [chatListOpen, setChatListOpen] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentChatSummary, setCurrentChatSummary] = useState<
    ChatSummary | null | undefined
  >(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch chat list
  useEffect(() => {
    if (!userId) return;
    async function fetchChats() {
      try {
        const res = await fetch("/api/chat");
        const data = await res.json();
        if (!res.ok) {
          console.error("Error fetching chat list");
          return (
            <ErrorMessage
              errorHeader="Error fetching chats"
              errorBody="Reload the page or try again after some time."
            />
          );
        }
        setChatList(data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, [userId]);

  useEffect(() => {
    if (!selectedChatId) return;
    async function initSocket() {
      socket = io("http://localhost:4000/");
      socket.emit("join", {
        chatId: selectedChatId,
        userId: userId,
        isAdmin: true,
      });

      socket.on("text", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on("file", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.emit("get-active-users");
      socket.on("active-users", (users) => {
        setActiveUsers(users);
      });
    }
    initSocket();

    return () => {
      socket?.disconnect();
    };
  }, [selectedChatId, userId]);

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setChatListOpen(false);
    setCurrentChatSummary(chatList.find((chat) => chat.id === chatId));
    setMessages(
      Array.isArray(currentChatSummary?.messages)
        ? currentChatSummary.messages
        : currentChatSummary?.messages
        ? [currentChatSummary.messages]
        : []
    );
  };
  const handleBackToChats = () => {
    setSelectedChatId(null);
    setChatListOpen(true);
    setCurrentChatSummary(null);
    setMessages([]);
  };

  // Load cached on mount or chatId change
  useEffect(() => {
    if (!selectedChatId) return;
    const cached = localStorage.getItem("chat-" + selectedChatId);
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
      const res = await fetch(
        `/api/chat/${selectedChatId}?limit=${PAGE_LIMIT}`
      );
      if (res.ok) {
        const { messages: fetchedMessages } = await res.json();
        setMessages(fetchedMessages);
        // Cache and set cursor
        localStorage.setItem(
          "chat-" + selectedChatId,
          JSON.stringify(fetchedMessages)
        );
        if (fetchedMessages.length > 0) {
          setLastTimestamp(fetchedMessages[0].createdAt);
          setHasMore(fetchedMessages.length >= PAGE_LIMIT);
        }
        // WIP: setup unread buffer
      }
    }

    async function fetchNewerMessages(newestTimestamp: string) {
      const res = await fetch(
        `/api/chat/${selectedChatId}?after=${encodeURIComponent(
          newestTimestamp
        )}`
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
            localStorage.setItem(
              "chat-" + selectedChatId,
              JSON.stringify(merged)
            );

            return merged;
          });
        }
      }
    }
  }, [selectedChatId]);

  // Pagination
  const loadMore = async () => {
    if (!selectedChatId || !hasMore || !lastTimestamp) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/chat/${selectedChatId}?limit=${PAGE_LIMIT}&before=${encodeURIComponent(
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
            localStorage.setItem(
              "chat-" + selectedChatId,
              JSON.stringify(merged)
            );
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
  const [textInput, setTextInput] = useState("");
  const sendText = async () => {
    if (!textInput.trim() || !selectedChatId || !userId || !socket) return;
    socket.emit("text", { selectedChatId, senderId: userId, text: textInput });
    setTextInput("");
  };

  // Audio recording
  const [isRecording, setIsRecording] = useState(false);
  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  useEffect(() => {
    if (!isRecording) return;
    let stream: MediaStream;
    let recorder: MediaRecorder;
    let audioChunks: BlobPart[] = [];

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        stream = s;
        recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);

        recorder.ondataavailable = (e) => {
          audioChunks = [...audioChunks, e.data];
        };
        recorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: "audio/webm" });
          const file = new File([blob], `recording-${Date.now()}.webm`, {
            type: "audio/webm",
          });
          setFileInput(file);
          audioChunks = [];
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
      })
      .catch((error) => {
        console.error("Microphone access denied", error);
        alert("Cannot access microphone");
        setIsRecording(false);
      });

    return () => {
      if (recorder && recorder.state !== "inactive") recorder.stop();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isRecording]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // Send File
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [fileUrl, setfileUrl] = useState("");
  const [filePath, setFilePath] = useState("");
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInput(file);
    }
  };
  const sendFile = async () => {
    if (!selectedChatId || !fileInput) return;
    try {
      const fileName = fileInput.name;
      const fileType = fileInput.type;

      async function getSupabaseUrls() {
        const res = await fetch("/api/upload-presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName, fileType, selectedChatId, userId }),
        });
        const body = await res.json();
        if (!res.ok) {
          console.error("Upload presign failed:", body.error);
          return;
        }
        const { uploadUrl, downloadUrl, path } = body;
        setfileUrl(downloadUrl);
        setFilePath(path);
        return { uploadUrl, downloadUrl, path };
      }

      async function uploadFileToSupabase(uploadUrl: string, file: File) {
        const res = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const body = await res.json();
        if (!res.ok) {
          console.error("Couldn't upload to supabase:", body);
        }
      }

      const body = await getSupabaseUrls();
      if (body && body.uploadUrl) {
        await uploadFileToSupabase(body.uploadUrl, fileInput);
      }
      if (fileUrl && filePath) {
        socket.emit("file", {
          selectedChatId,
          senderId: userId,
          fileName,
          filePath,
          fileType,
          fileUrl,
        });
        setfileUrl("");
        setFilePath("");
      }
    } catch (error) {
      console.error("Error sending file:", error);
    }
  };

  return <div>AdminChat</div>;
};

export default AdminChat;
