import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MonitorUp,
  Copy,
  Check,
  MessageSquare,
  Users,
  Send,
  X,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";
import { PixelFox, PixelOwl } from "../Components/PixelCharacters";
import { connectSanctuaryChat } from "../utils/socket";
import { useAuth } from "../context/AuthContext";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

const CALM_SNIPPETS = [
  "Taking a deep breath together 🌿",
  "Don't worry about the sprint deadline ✨",
  "Take your time, no rush ☕",
  "Unclench your jaw and shoulders 🧘",
  "I hear you, take it easy 💚",
];

export function GoogleMeet() {
  const { roomParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const queryRoom = searchParams.get("room") || roomParam;
  const initialRoom = queryRoom || `sanctuary-meet-${Math.floor(100 + Math.random() * 900)}`;

  // Lobby vs In-Call State
  const [joinedCall, setJoinedCall] = useState(false);
  const [roomId, setRoomId] = useState(initialRoom);
  const [userName, setUserName] = useState(user?.name || "Developer");

  // Media & WebRTC State
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [remoteUserName, setRemoteUserName] = useState("Friend");
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  // In-Call Live Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPeopleOpen, setIsPeopleOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const lobbyVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketControllerRef = useRef(null);
  const pendingOutboxRef = useRef([]);
  const iceCandidateQueueRef = useRef([]);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  // Keep localStreamRef synced with localStream state
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // =========================================================================
  // 1. Initial Camera & Mic Setup (Lobby & Persistence)
  // =========================================================================
  useEffect(() => {
    let isCancelled = false;

    const startMedia = async () => {
      try {
        if (localStreamRef.current && localStreamRef.current.active) {
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: true,
        });

        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        localStreamRef.current = stream;
        setLocalStream(stream);
      } catch (err) {
        console.warn("[Meet] Camera/Mic access warning:", err.message);
        toast.error("Camera or microphone permission needed for video call.", { id: "media-perm" });
      }
    };

    startMedia();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Ensure DOM video elements receive stream as soon as they mount
  useEffect(() => {
    if (lobbyVideoRef.current && localStream) {
      lobbyVideoRef.current.srcObject = localStream;
    }
  }, [localStream, joinedCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, joinedCall, isCameraOn]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, joinedCall]);

  // =========================================================================
  // 2. Call Timer
  // =========================================================================
  useEffect(() => {
    if (joinedCall) {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [joinedCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // =========================================================================
  // 3. WebRTC Peer Connection Helper
  // =========================================================================
  const initPeerConnection = (controller) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    iceCandidateQueueRef.current = [];

    // Add local media tracks
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    // Handle incoming remote media
    pc.ontrack = (event) => {
      console.log("[WebRTC] Received remote track:", event.track.kind);
      if (event.streams && event.streams[0]) {
        const remoteMedia = event.streams[0];
        setRemoteStream(remoteMedia);
        setIsPeerConnected(true);
        sounds.playSuccess();
        toast.success("Friend connected to video call! 🎥", { id: "peer-connected" });
      }
    };

    // ICE Candidate signaling
    pc.onicecandidate = (event) => {
      if (event.candidate && controller) {
        controller.sendWebRTCCandidate(event.candidate);
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      console.log("[WebRTC] Connection state:", pc.connectionState);
      if (pc.connectionState === "connected") {
        setIsPeerConnected(true);
      } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
        setIsPeerConnected(false);
      }
    };

    return pc;
  };

  const flushQueuedCandidates = async (pc) => {
    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("[WebRTC] Error adding queued ICE candidate:", err);
      }
    }
  };

  // =========================================================================
  // 4. Join Meeting Call Action
  // =========================================================================
  const handleJoinCall = async () => {
    if (!userName.trim() || !roomId.trim()) {
      toast.error("Please enter both your name and Room ID.");
      return;
    }

    // Ensure camera/mic is active
    let currentStream = localStreamRef.current;
    if (!currentStream || !currentStream.active) {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = currentStream;
        setLocalStream(currentStream);
      } catch (err) {
        console.warn("[Meet] Could not acquire camera/mic:", err);
      }
    }

    sounds.playSuccess();
    setJoinedCall(true);

    // Connect to Socket.IO Signaling Server
    const controller = await connectSanctuaryChat({
      roomId: roomId.trim().toLowerCase(),
      userName: userName.trim(),
      onConnected: () => {
        toast.success(`Connected to Google Meet room #${roomId}! 🌿`, { id: "meet-conn" });
      },
      onHistory: (history) => {
        if (history && history.length > 0) {
          setChatMessages((prev) => {
            const map = new Map();
            [...history, ...prev].forEach((m) => map.set(m.id || `${m.timestamp}-${m.text}`, m));
            return Array.from(map.values());
          });
        }
      },
      onMessage: (msg) => {
        sounds.playPop(480);
        setChatMessages((prev) => {
          // Avoid duplicate display if already optimistically added
          const alreadyExists = prev.some(
            (m) =>
              m.id === msg.id ||
              (m.text === msg.text &&
                m.senderName === msg.senderName &&
                Math.abs(new Date(m.timestamp) - new Date(msg.timestamp)) < 4000)
          );
          if (alreadyExists) return prev;
          return [...prev, msg];
        });
        if (!isChatOpen) {
          setUnreadCount((prev) => prev + 1);
        }
      },
      // Second user entered room -> existing peer creates offer
      onUserJoined: async (data) => {
        sounds.playCalmTone?.(540, 0.2);
        const peerName = data?.userName || "Friend";
        setRemoteUserName(peerName);
        toast(`🟢 ${peerName} joined the meeting! Connecting video...`, { icon: "👋" });

        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          controller.sendWebRTCOffer(offer);
        } catch (err) {
          console.warn("[WebRTC] Error creating offer on user-joined:", err);
        }
      },
      onUserLeft: (data) => {
        toast(`⚪ ${data.userName || "Friend"} left the meeting`, { icon: "👋" });
        setIsPeerConnected(false);
        setRemoteStream(null);
      },
      onWebRTCOffer: async (data) => {
        if (!data?.offer) return;
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
          if (data.senderName) setRemoteUserName(data.senderName);

          if (pc.signalingState !== "stable") {
            await Promise.all([
              pc.setLocalDescription({ type: "rollback" }),
              pc.setRemoteDescription(new RTCSessionDescription(data.offer)),
            ]);
          } else {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          }

          await flushQueuedCandidates(pc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          controller.sendWebRTCAnswer(answer);
        } catch (e) {
          console.warn("[WebRTC] Error handling WebRTC offer:", e.message);
        }
      },
      onWebRTCAnswer: async (data) => {
        if (!data?.answer) return;
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          await flushQueuedCandidates(pc);
        } catch (e) {
          console.warn("[WebRTC] Error handling WebRTC answer:", e.message);
        }
      },
      onWebRTCCandidate: async (data) => {
        if (!data?.candidate) return;
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
          if (!pc.remoteDescription || !pc.remoteDescription.type) {
            iceCandidateQueueRef.current.push(data.candidate);
          } else {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        } catch (e) {
          console.warn("[WebRTC] Error adding ICE candidate:", e.message);
        }
      },
      onWebRTCCallEnded: () => {
        toast("Friend ended the video call.", { icon: "👋" });
        setIsPeerConnected(false);
        setRemoteStream(null);
      },
    });

    socketControllerRef.current = controller;

    // Flush any pending chat messages queued before socket connected
    while (pendingOutboxRef.current.length > 0) {
      const pending = pendingOutboxRef.current.shift();
      controller.sendMessage(pending.text, pending.senderId);
    }

    // Initialize RTCPeerConnection with local tracks
    initPeerConnection(controller);
  };

  // Toggle Mic
  const toggleMic = () => {
    sounds.playClick();
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
      toast(track.enabled ? "Microphone Unmuted" : "Microphone Muted", {
        icon: track.enabled ? "🎙️" : "🔇",
      });
    }
  };

  // Toggle Camera
  const toggleCamera = async () => {
    sounds.playClick();
    const stream = localStreamRef.current;
    if (!stream) {
      try {
        const freshStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
        localStreamRef.current = freshStream;
        setLocalStream(freshStream);
        setIsCameraOn(true);
        toast.success("Camera turned on 📹");
      } catch (err) {
        toast.error("Could not activate camera.");
      }
      return;
    }

    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
      toast(track.enabled ? "Camera Turned On" : "Camera Turned Off", {
        icon: track.enabled ? "📹" : "🚫",
      });
    }
  };

  // Screen Share
  const toggleScreenShare = async () => {
    sounds.playClick();
    const pc = peerConnectionRef.current;

    if (isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pc?.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsScreenSharing(false);
        toast("Screen sharing stopped. Camera restored.");
      } catch (e) {
        console.warn("Failed restoring camera:", e.message);
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = pc?.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && screenTrack) {
          await sender.replaceTrack(screenTrack);
        }
        localStreamRef.current = displayStream;
        setLocalStream(displayStream);

        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
        toast.success("Sharing your screen / IDE window! 🖥️");
      } catch (err) {
        console.warn("Screen share cancelled:", err.message);
      }
    }
  };

  // Copy Meeting Link
  const handleCopyLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}/meet?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Meeting link copied to clipboard! Send it to your friend 🌿");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Toggle Live Chat Drawer
  const toggleLiveChat = () => {
    sounds.playClick();
    setIsChatOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        setIsPeopleOpen(false);
      }
      return next;
    });
  };

  // Toggle People Drawer
  const togglePeople = () => {
    sounds.playClick();
    setIsPeopleOpen((prev) => {
      const next = !prev;
      if (next) setIsChatOpen(false);
      return next;
    });
  };

  // =========================================================================
  // 5. Send In-Call Chat Message (Optimistic Instant Bubble + Background Sync)
  // =========================================================================
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    sounds.playClick();

    // 1. Optimistically display user's outgoing message immediately!
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      roomId,
      text,
      senderName: userName,
      senderId: user?.id || "local-dev",
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    // 2. Transmit message over Socket.IO / HTTP fallback
    if (socketControllerRef.current) {
      socketControllerRef.current.sendMessage(text, user?.id || "local-dev");
    } else {
      pendingOutboxRef.current.push({ text, senderId: user?.id || "local-dev" });
    }
  };

  // Send Quick Calming Chip
  const handleSendQuickChip = (chipText) => {
    if (!chipText || !chipText.trim()) return;
    sounds.playClick();
    const text = chipText.trim();

    // Optimistically show quick chip immediately!
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      roomId,
      text,
      senderName: userName,
      senderId: user?.id || "local-dev",
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    if (socketControllerRef.current) {
      socketControllerRef.current.sendMessage(text, user?.id || "local-dev");
    } else {
      pendingOutboxRef.current.push({ text, senderId: user?.id || "local-dev" });
    }
  };

  // End Call
  const handleEndCall = () => {
    sounds.playClick();
    if (socketControllerRef.current) {
      socketControllerRef.current.sendWebRTCCallEnded();
      socketControllerRef.current.disconnect();
      socketControllerRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setIsPeerConnected(false);
    setRemoteStream(null);
    setJoinedCall(false);
    toast("You left the meeting.");
  };

  // Cleanup on Component Unmount
  useEffect(() => {
    return () => {
      if (socketControllerRef.current) {
        socketControllerRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#202124] text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* =========================================================================
          VIEW A: PRE-JOIN LOBBY SCREEN (Google Meet Style "Ready to Join?")
         ========================================================================= */}
      {!joinedCall ? (
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 max-w-6xl w-full mx-auto">
          {/* Top Navbar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <Link
              to="/tracker"
              onClick={() => sounds.playClick()}
              className="flex items-center gap-2 text-white/80 hover:text-white text-xs sm:text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sanctuary</span>
            </Link>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#64DC4C] animate-pulse" />
              <span>CALM ME MEET · P2P ENCRYPTED</span>
            </div>
          </div>

          {/* Lobby Center: 2-Column Split */}
          <div className="my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Camera Preview Box (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative w-full max-w-xl aspect-video bg-[#171717] rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl flex items-center justify-center">
                {isCameraOn ? (
                  <video
                    ref={lobbyVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-3 text-white/50 text-xs">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                      <PixelOwl className="w-12 h-12" />
                    </div>
                    <span className="font-medium">Camera is turned off</span>
                  </div>
                )}

                {/* Self Name badge on preview */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white/90 border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#64DC4C]" />
                  <span>Preview: {userName || "You"}</span>
                </div>

                {/* Floating Preview Controls at bottom of video */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-lg">
                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isMicOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-rose-600 text-white"
                    }`}
                    title={isMicOn ? "Turn off mic" : "Turn on mic"}
                  >
                    {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isCameraOn ? "bg-white/20 hover:bg-white/30 text-white" : "bg-rose-600 text-white"
                    }`}
                    title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                  >
                    {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Meeting Info & Join CTA (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
                  Ready to join?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  Connect with your friend or mentor in real-time with crystal clear bidirectional video and in-call live chat.
                </p>
              </div>

              {/* Form Input fields */}
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    Your Name / Handle
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-sm font-bold focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                    Meeting Room ID
                  </label>
                  <input
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="e.g. sanctuary-meet-123"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white text-sm font-mono font-bold focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition"
                  />
                </div>

                {/* Primary Join Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={handleJoinCall}
                    className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-full bg-[#64DC4C] hover:bg-[#52c83b] text-[#0a1b10] font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Video className="w-4 h-4 text-[#0a1b10]" />
                    <span>Join Now</span>
                  </button>

                  {/* External Google Meet 1-Click Launch */}
                  <a
                    href="https://meet.google.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sounds.playClick()}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                    title="Open official Google Meet in a new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Official Google Meet</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Lobby Footer */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
            <span>🟢 Calm Me Meet · Peer-to-Peer Video & Live Chat</span>
            <span>Zero installation · Direct browser encryption</span>
          </div>
        </div>
      ) : (
        /* =========================================================================
            VIEW B: IN-CALL GOOGLE MEET STAGE (Side-by-Side Video Grid + Live Chat)
           ========================================================================= */
        <div className="flex-1 flex flex-col justify-between h-screen w-full relative overflow-hidden bg-[#202124]">
          {/* 1. In-Call Header */}
          <header className="px-5 py-3 bg-[#171717] border-b border-white/10 flex items-center justify-between z-20">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64DC4C] animate-pulse" />
              <div>
                <h2 className="text-sm font-black font-display text-white uppercase tracking-wider flex items-center gap-2">
                  <span>Room: #{roomId}</span>
                  <span className="text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2 py-0.5 rounded">
                    LIVE
                  </span>
                </h2>
                <p className="text-[11px] font-mono text-emerald-400 font-bold">
                  {formatDuration(callDuration)} elapsed · {isPeerConnected ? "🟢 2 users in call" : "⏳ 1 user in call (waiting for friend)"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Header Live Chat Button */}
              <button
                type="button"
                onClick={toggleLiveChat}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isChatOpen
                    ? "bg-[#64DC4C] text-[#0a1b10] border-[#64DC4C]"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20"
                }`}
                title="Toggle In-Call Live Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Live Chat</span>
                {unreadCount > 0 && !isChatOpen && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              {/* Share Meeting Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                title="Copy meeting link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#64DC4C]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Share Link"}</span>
              </button>

              {/* External Google Meet Tab */}
              <a
                href="https://meet.google.com/new"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => sounds.playClick()}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-[#64DC4C] text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
                title="Open official Google Meet in separate tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Meet</span>
              </a>
            </div>
          </header>

          {/* 2. Main Stage & Live Chat Grid */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Video Stage Frame (Scales nicely whether chat drawer is open or closed) */}
            <div className="flex-1 relative bg-[#171717] p-3 sm:p-5 flex flex-col justify-center items-center overflow-hidden">
              {/* GOOGLE MEET 2-TILE GRID: Both users can see each other side-by-side */}
              <div className="w-full h-full max-h-[82vh] grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
                {/* TILE 1: SELF-VIEW (You) - ALWAYS VISIBLE */}
                <div className="relative w-full h-full min-h-[220px] max-h-[75vh] bg-[#202124] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/15 shadow-xl flex items-center justify-center group">
                  {isCameraOn ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#202124] text-slate-400">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <PixelFox className="w-10 h-10" />
                      </div>
                      <span className="text-xs font-bold">Your camera is off</span>
                    </div>
                  )}

                  {/* Tile 1 Bottom Overlay: Name & Mic status */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-2 border border-white/10 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[#64DC4C]" />
                    <span>You ({userName})</span>
                    {isMicOn ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-rose-400 ml-1" />
                    )}
                  </div>
                </div>

                {/* TILE 2: REMOTE USER (Friend) OR WAITING FOR FRIEND */}
                <div className="relative w-full h-full min-h-[220px] max-h-[75vh] bg-[#202124] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/15 shadow-xl flex items-center justify-center group">
                  {remoteStream && isPeerConnected ? (
                    <>
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {/* Tile 2 Bottom Overlay: Friend Name & Status */}
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-2 border border-white/10 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-[#64DC4C] animate-pulse" />
                        <span>Friend ({remoteUserName})</span>
                        <Mic className="w-3.5 h-3.5 text-emerald-400 ml-1" />
                      </div>
                    </>
                  ) : (
                    /* Waiting Card when 2nd user has not joined yet */
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4 bg-gradient-to-b from-[#202124] to-[#1a1a1c]">
                      <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center shadow-xl animate-pulse">
                        <PixelOwl className="w-12 h-12" />
                      </div>
                      <div className="space-y-1.5 max-w-xs">
                        <h3 className="font-display font-black text-lg text-white">
                          Waiting for friend to join...
                        </h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          Once your friend joins room <strong className="text-white font-mono">#{roomId}</strong>, their video feed will instantly appear here!
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="py-2.5 px-4 rounded-full bg-[#64DC4C] hover:bg-[#52c83b] text-[#0a1b10] font-black text-xs transition shadow-lg cursor-pointer flex items-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#0a1b10]" />
                        <span>Copy Meeting Invite Link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. DOCKED IN-CALL LIVE CHAT SIDEBAR (Prominently displayed when toggled) */}
            {isChatOpen && (
              <div className="w-80 sm:w-96 bg-[#1e1e1e] border-l border-white/10 flex flex-col justify-between z-20 shadow-2xl animate-in slide-in-from-right duration-150">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171717]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#64DC4C]" />
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      In-Call Live Chat
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(false)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                    title="Close Chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Chat Messages Stream */}
                <div className="flex-1 flex flex-col justify-between p-4 overflow-hidden">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[58vh] scrollbar-thin">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs font-bold space-y-2">
                        <MessageSquare className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                        <p>No messages yet in this meeting.</p>
                        <p className="text-[11px] text-slate-400 font-normal">
                          Type a message or click a calming thought below! 🌿
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isMe = msg.senderName === userName || msg.senderId === user?.id || msg.senderId === "local-dev";
                        return (
                          <div
                            key={msg.id || `${msg.timestamp}-${Math.random()}`}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <span className="text-[10px] font-mono text-slate-400 mb-0.5">
                              {isMe ? "You" : msg.senderName}
                            </span>
                            <div
                              className={`p-2.5 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                                isMe
                                  ? "bg-[#64DC4C] text-[#0a1b10] font-bold"
                                  : "bg-white/10 text-white font-medium"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Reactions / Calming Chips */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Quick Calm:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {CALM_SNIPPETS.map((snippet, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendQuickChip(snippet)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-[11px] text-white/90 border border-white/10 transition-colors cursor-pointer"
                        >
                          {snippet}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Chat Composer Form */}
                  <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-3">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      placeholder="Send a live message..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#64DC4C] focus:bg-white/10 transition placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2.5 rounded-xl bg-[#64DC4C] text-[#0a1b10] hover:bg-[#52c83b] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-md shrink-0"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* 4. DOCKED PARTICIPANTS SIDEBAR */}
            {isPeopleOpen && (
              <div className="w-80 sm:w-96 bg-[#1e1e1e] border-l border-white/10 flex flex-col justify-between z-20 shadow-2xl animate-in slide-in-from-right duration-150">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171717]">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#64DC4C]" />
                    <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                      Participants ({isPeerConnected ? 2 : 1})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPeopleOpen(false)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {/* Local User */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-9 h-9 rounded-full bg-[#64DC4C] text-[#0a1b10] font-black text-xs flex items-center justify-center">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left flex-1">
                      <span className="text-xs font-bold text-white">{userName} (You)</span>
                      <span className="text-[10px] font-mono text-emerald-400">Meeting Participant</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4 text-rose-400" />}
                      {isCameraOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4 text-rose-400" />}
                    </div>
                  </div>

                  {/* Remote Peer */}
                  {isPeerConnected ? (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-black text-xs flex items-center justify-center">
                        {remoteUserName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col text-left flex-1">
                        <span className="text-xs font-bold text-white">{remoteUserName}</span>
                        <span className="text-[10px] font-mono text-slate-400">Connected peer</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <Mic className="w-4 h-4" />
                        <Video className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                      <p className="text-xs text-slate-400">Waiting for 2nd participant to join...</p>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Meeting Invite Link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 5. Google Meet Bottom Floating Control Bar */}
          <footer className="p-4 bg-[#171717] border-t border-white/10 flex items-center justify-between z-20">
            {/* Left: Meeting Clock */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="font-bold text-white">{formatDuration(callDuration)}</span>
              <span>•</span>
              <span>Room: {roomId}</span>
            </div>

            {/* Center Controls: Mic, Camera, Screen Share, End Call */}
            <div className="flex items-center gap-3 mx-auto sm:mx-0">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isMicOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
                title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isCameraOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"
                }`}
                title={isCameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleScreenShare}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                  isScreenSharing ? "bg-[#64DC4C] text-[#0a1b10]" : "bg-white/15 hover:bg-white/25 text-white"
                }`}
                title={isScreenSharing ? "Stop sharing screen" : "Share screen / IDE"}
              >
                <MonitorUp className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="w-16 h-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-rose-950/50 ml-2"
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>

            {/* Right: Drawer Toggles with PROMINENT "Live Chat" Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePeople}
                className={`p-3 rounded-full transition-colors cursor-pointer ${
                  isPeopleOpen ? "bg-[#64DC4C] text-[#0a1b10]" : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                title="Participants"
              >
                <Users className="w-4 h-4" />
              </button>

              {/* High-visibility Live Chat Button with label */}
              <button
                type="button"
                onClick={toggleLiveChat}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shadow-md ${
                  isChatOpen
                    ? "bg-[#64DC4C] text-[#0a1b10] scale-105"
                    : "bg-white/15 hover:bg-white/25 text-white border border-white/10"
                }`}
                title="Toggle In-Call Live Chat"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Live Chat</span>
                {unreadCount > 0 && !isChatOpen && (
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

export default GoogleMeet;
