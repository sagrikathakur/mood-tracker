/**
 * Universal Socket.IO Client for Calm Me
 * Uses browser-level Socket.IO client without bundling issues or missing npm packages.
 * Includes WebRTC Signaling for Google Meet style Video & Audio calling.
 */

let activeSocket = null;
let sseSource = null;

export const loadSocketIO = async () => {
  if (typeof window === "undefined") return null;

  // 1. If window.io is already present (via index.html script)
  if (window.io) return window.io;

  // 2. Dynamically inject official CDN script if needed
  return new Promise((resolve) => {
    const existingScript = document.getElementById("socket-io-cdn");
    if (existingScript) {
      if (window.io) return resolve(window.io);
      existingScript.addEventListener("load", () => resolve(window.io || null));
      return;
    }

    const script = document.createElement("script");
    script.id = "socket-io-cdn";
    script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
    script.async = true;
    script.onload = () => resolve(window.io || null);
    script.onerror = () => {
      console.warn("[Socket.IO] CDN notice: Operating in real-time stream mode.");
      resolve(null);
    };
    document.head.appendChild(script);
  });
};

export const connectSanctuaryChat = async ({
  roomId,
  userName,
  onMessage,
  onHistory,
  onUserJoined,
  onUserLeft,
  onTyping,
  onConnected,
  onWebRTCOffer,
  onWebRTCAnswer,
  onWebRTCCandidate,
  onWebRTCCallEnded,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const io = await loadSocketIO();

  const safeRoomId = (roomId || "sanctuary-lobby").trim().toLowerCase();
  const safeUserName = (userName || "Developer").trim();

  if (io) {
    // If activeSocket is already connected, remove old listeners before re-binding
    if (activeSocket) {
      activeSocket.off("new-message");
      activeSocket.off("room-history");
      activeSocket.off("user-joined");
      activeSocket.off("user-left");
      activeSocket.off("user-typing");
      activeSocket.off("webrtc-offer");
      activeSocket.off("webrtc-answer");
      activeSocket.off("webrtc-ice-candidate");
      activeSocket.off("webrtc-call-ended");
    } else {
      activeSocket = io(backendUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 8,
      });
    }

    // Bind event handlers
    activeSocket.on("new-message", (msg) => {
      if (onMessage) onMessage(msg);
    });

    activeSocket.on("room-history", (data) => {
      if (onHistory && data?.messages) onHistory(data.messages, data.membersCount);
    });

    activeSocket.on("user-joined", (data) => {
      if (onUserJoined) onUserJoined(data);
    });

    activeSocket.on("user-left", (data) => {
      if (onUserLeft) onUserLeft(data);
    });

    activeSocket.on("user-typing", (data) => {
      if (onTyping) onTyping(data);
    });

    // WebRTC Signaling Events
    activeSocket.on("webrtc-offer", (data) => {
      if (onWebRTCOffer) onWebRTCOffer(data);
    });

    activeSocket.on("webrtc-answer", (data) => {
      if (onWebRTCAnswer) onWebRTCAnswer(data);
    });

    activeSocket.on("webrtc-ice-candidate", (data) => {
      if (onWebRTCCandidate) onWebRTCCandidate(data);
    });

    activeSocket.on("webrtc-call-ended", (data) => {
      if (onWebRTCCallEnded) onWebRTCCallEnded(data);
    });

    activeSocket.on("connect_error", (err) => {
      console.warn("[Socket.IO] Connection notice:", err.message);
      setupSSEFallback({ roomId: safeRoomId, userName: safeUserName, backendUrl, onMessage, onHistory, onConnected });
    });

    // If socket is ALREADY connected, immediately emit join-room
    if (activeSocket.connected) {
      console.log(`[Socket.IO] Reusing active socket (${activeSocket.id}) -> joining room ${safeRoomId}`);
      if (onConnected) onConnected(true, "socket.io");
      activeSocket.emit("join-room", { roomId: safeRoomId, userName: safeUserName });
    } else {
      activeSocket.once("connect", () => {
        console.log(`[Socket.IO] Connected to sanctuary server (${activeSocket.id}) ⚡`);
        if (onConnected) onConnected(true, "socket.io");
        activeSocket.emit("join-room", { roomId: safeRoomId, userName: safeUserName });
      });
    }
  } else {
    setupSSEFallback({ roomId: safeRoomId, userName: safeUserName, backendUrl, onMessage, onHistory, onConnected });
  }

  return {
    sendMessage: async (text, senderId) => {
      const payload = {
        roomId: safeRoomId,
        text,
        senderName: safeUserName,
        senderId: senderId || "web-user",
      };

      if (activeSocket && activeSocket.connected) {
        activeSocket.emit("send-message", payload);
      } else {
        // Fallback HTTP POST
        try {
          const res = await fetch(`${backendUrl}/api/chat/rooms/${safeRoomId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data?.message && onMessage) {
            onMessage(data.message);
          }
        } catch (e) {
          console.warn("Failed sending message via HTTP:", e.message);
        }
      }
    },
    sendTyping: (isTyping) => {
      if (activeSocket && activeSocket.connected) {
        activeSocket.emit("typing", { roomId: safeRoomId, userName: safeUserName, isTyping });
      }
    },
    sendWebRTCOffer: (offer) => {
      if (activeSocket && activeSocket.connected) {
        activeSocket.emit("webrtc-offer", { roomId: safeRoomId, offer });
      }
    },
    sendWebRTCAnswer: (answer) => {
      if (activeSocket && activeSocket.connected) {
        activeSocket.emit("webrtc-answer", { roomId: safeRoomId, answer });
      }
    },
    sendWebRTCCandidate: (candidate) => {
      if (activeSocket && activeSocket.connected) {
        activeSocket.emit("webrtc-ice-candidate", { roomId: safeRoomId, candidate });
      }
    },
    sendWebRTCCallEnded: () => {
      if (activeSocket && activeSocket.connected) {
        activeSocket.emit("webrtc-call-ended", { roomId: safeRoomId });
      }
    },
    disconnect: () => {
      if (activeSocket) {
        activeSocket.emit("leave-room", { roomId: safeRoomId, userName: safeUserName });
        activeSocket.disconnect();
        activeSocket = null;
      }
      if (sseSource) {
        sseSource.close();
        sseSource = null;
      }
    },
  };
};

const setupSSEFallback = async ({ roomId, userName, backendUrl, onMessage, onHistory, onConnected }) => {
  try {
    const res = await fetch(`${backendUrl}/api/chat/rooms/${roomId}`);
    const data = await res.json();
    if (data?.messages && onHistory) onHistory(data.messages, data.membersCount);
  } catch (err) {
    console.warn("Could not load initial chat history:", err.message);
  }

  if (typeof EventSource !== "undefined") {
    if (sseSource) sseSource.close();
    sseSource = new EventSource(`${backendUrl}/api/chat/rooms/${roomId}/stream?userName=${encodeURIComponent(userName)}`);

    sseSource.onopen = () => {
      if (onConnected) onConnected(true, "stream");
    };

    sseSource.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (onMessage) onMessage(msg);
      } catch (err) {}
    });
  }
};
