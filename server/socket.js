import { EventEmitter } from "events";

/**
 * Calm Me Real-Time Socket.IO & Lifeline Chat Service
 * Supports Socket.IO with automatic resilient fallback.
 */

class SanctuarySocketManager {
  constructor() {
    this.io = null;
    this.isSocketIOReady = false;
    this.rooms = new Map(); // roomId -> { messages: [], members: Set() }
    this.sseClients = new Map(); // roomId -> Set of res objects for SSE fallback
    this.bus = new EventEmitter();
  }

  async init(httpServer, app) {
    // 1. Try dynamic import of socket.io
    try {
      const socketModule = await import("socket.io").catch(() => null);

      if (socketModule && (socketModule.Server || socketModule.default)) {
        const Server = socketModule.Server || socketModule.default;
        this.io = new Server(httpServer, {
          cors: {
            origin: [
              process.env.CLIENT_URL || "http://localhost:5173",
              "http://localhost:5173",
              "http://localhost:3000",
            ],
            methods: ["GET", "POST"],
            credentials: true,
          },
          transports: ["websocket", "polling"],
        });

        this.isSocketIOReady = true;
        this.setupSocketEvents();
        console.log("[Socket.IO] Real-time sanctuary messenger active on port 3000 ⚡");
      } else {
        console.log("[Socket.IO] socket.io package not yet installed. Running resilient Live Stream fallback 🌿");
      }
    } catch (err) {
      console.warn("[Socket.IO] Initialization notice:", err.message);
    }

    // 2. Always register HTTP fallback routes on the Express app (ensures 100% uptime even before npm install)
    this.setupHttpFallbackRoutes(app);
  }

  setupSocketEvents() {
    this.io.on("connection", (socket) => {
      let currentRoom = null;
      let currentUser = "Friend";

      // Join room
      socket.on("join-room", ({ roomId, userName }) => {
        currentRoom = roomId || "sanctuary-lobby";
        currentUser = userName || "Friend";

        socket.join(currentRoom);

        // Track room metadata
        if (!this.rooms.has(currentRoom)) {
          this.rooms.set(currentRoom, { messages: [], members: new Set() });
        }
        const roomData = this.rooms.get(currentRoom);
        roomData.members.add(currentUser);

        // Send existing room history to newly joined user
        socket.emit("room-history", {
          roomId: currentRoom,
          messages: roomData.messages,
          membersCount: roomData.members.size,
        });

        // Broadcast to other users in room
        socket.to(currentRoom).emit("user-joined", {
          userName: currentUser,
          membersCount: roomData.members.size,
          timestamp: new Date().toISOString(),
        });

        console.log(`[Socket.IO] ${currentUser} joined room [${currentRoom}] (${roomData.members.size} active)`);
      });

      // Send chat message
      socket.on("send-message", ({ roomId, text, senderName, senderId }) => {
        const targetRoom = roomId || currentRoom || "sanctuary-lobby";
        if (!text || text.trim() === "") return;

        const messageObj = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          roomId: targetRoom,
          text: text.trim(),
          senderName: senderName || currentUser || "Friend",
          senderId: senderId || socket.id,
          timestamp: new Date().toISOString(),
        };

        // Cache in room history (keep last 50)
        if (!this.rooms.has(targetRoom)) {
          this.rooms.set(targetRoom, { messages: [], members: new Set() });
        }
        const roomData = this.rooms.get(targetRoom);
        roomData.messages.push(messageObj);
        if (roomData.messages.length > 50) roomData.messages.shift();

        // Broadcast to everyone in room including sender
        this.io.in(targetRoom).emit("new-message", messageObj);

        // Also broadcast to any SSE clients
        this.broadcastSSE(targetRoom, "message", messageObj);
      });

      // Typing status
      socket.on("typing", ({ roomId, userName, isTyping }) => {
        const targetRoom = roomId || currentRoom;
        if (targetRoom) {
          socket.to(targetRoom).emit("user-typing", {
            userName: userName || currentUser,
            isTyping: Boolean(isTyping),
          });
        }
      });

      // WebRTC Peer-to-Peer Video Call Signaling (Google Meet Type)
      socket.on("webrtc-offer", ({ roomId, offer }) => {
        const targetRoom = roomId || currentRoom;
        if (targetRoom) {
          socket.to(targetRoom).emit("webrtc-offer", { offer, from: socket.id, senderName: currentUser });
        }
      });

      socket.on("webrtc-answer", ({ roomId, answer }) => {
        const targetRoom = roomId || currentRoom;
        if (targetRoom) {
          socket.to(targetRoom).emit("webrtc-answer", { answer, from: socket.id });
        }
      });

      socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
        const targetRoom = roomId || currentRoom;
        if (targetRoom) {
          socket.to(targetRoom).emit("webrtc-ice-candidate", { candidate, from: socket.id });
        }
      });

      socket.on("webrtc-call-ended", ({ roomId }) => {
        const targetRoom = roomId || currentRoom;
        if (targetRoom) {
          socket.to(targetRoom).emit("webrtc-call-ended", { from: socket.id, senderName: currentUser });
        }
      });

      // Leave room
      socket.on("leave-room", ({ roomId, userName }) => {
        const targetRoom = roomId || currentRoom;
        if (targetRoom && this.rooms.has(targetRoom)) {
          const roomData = this.rooms.get(targetRoom);
          roomData.members.delete(userName || currentUser);
          socket.leave(targetRoom);
          socket.to(targetRoom).emit("user-left", {
            userName: userName || currentUser,
            membersCount: roomData.members.size,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Disconnect
      socket.on("disconnect", () => {
        if (currentRoom && this.rooms.has(currentRoom)) {
          const roomData = this.rooms.get(currentRoom);
          roomData.members.delete(currentUser);
          socket.to(currentRoom).emit("user-left", {
            userName: currentUser,
            membersCount: roomData.members.size,
            timestamp: new Date().toISOString(),
          });
        }
      });
    });
  }

  /**
   * Resilient HTTP / SSE Fallback Routes (Works instantly without socket.io installed)
   */
  setupHttpFallbackRoutes(app) {
    if (!app) return;

    // 1. Get room history & presence
    app.get("/api/chat/rooms/:roomId", (req, res) => {
      const { roomId } = req.params;
      const roomData = this.rooms.get(roomId) || { messages: [], members: new Set() };
      return res.status(200).json({
        success: true,
        roomId,
        messages: roomData.messages,
        membersCount: Math.max(roomData.members.size, 1),
      });
    });

    // 2. Post message via HTTP
    app.post("/api/chat/rooms/:roomId/messages", (req, res) => {
      const { roomId } = req.params;
      const { text, senderName, senderId } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).json({ success: false, message: "Message text is required" });
      }

      const messageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        roomId,
        text: text.trim(),
        senderName: senderName || "Friend",
        senderId: senderId || "web-user",
        timestamp: new Date().toISOString(),
      };

      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, { messages: [], members: new Set([senderName || "Friend"]) });
      }
      const roomData = this.rooms.get(roomId);
      roomData.messages.push(messageObj);
      if (roomData.messages.length > 50) roomData.messages.shift();

      // If Socket.IO is active, broadcast
      if (this.io) {
        this.io.in(roomId).emit("new-message", messageObj);
      }

      // Also broadcast to SSE listeners
      this.broadcastSSE(roomId, "message", messageObj);

      return res.status(201).json({ success: true, message: messageObj });
    });

    // 3. Server-Sent Events live stream for instant real-time fallback
    app.get("/api/chat/rooms/:roomId/stream", (req, res) => {
      const { roomId } = req.params;
      const { userName } = req.query;

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(": connected\n\n");

      if (!this.sseClients.has(roomId)) {
        this.sseClients.set(roomId, new Set());
      }
      const clients = this.sseClients.get(roomId);
      clients.add(res);

      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, { messages: [], members: new Set() });
      }
      const roomData = this.rooms.get(roomId);
      if (userName) roomData.members.add(userName);

      // Notify others in room
      this.broadcastSSE(roomId, "user-joined", {
        userName: userName || "Friend",
        membersCount: roomData.members.size,
      });

      req.on("close", () => {
        clients.delete(res);
        if (userName) roomData.members.delete(userName);
        this.broadcastSSE(roomId, "user-left", {
          userName: userName || "Friend",
          membersCount: roomData.members.size,
        });
      });
    });
  }

  broadcastSSE(roomId, eventType, data) {
    const clients = this.sseClients.get(roomId);
    if (!clients || clients.size === 0) return;

    const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of clients) {
      try {
        client.write(payload);
      } catch {
        clients.delete(client);
      }
    }
  }
}

export const sanctuarySocket = new SanctuarySocketManager();
export default sanctuarySocket;

