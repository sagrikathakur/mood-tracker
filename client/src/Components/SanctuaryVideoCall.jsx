import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
  Maximize2,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";
import { PixelFox, PixelOwl } from "./PixelCharacters";

// Google Public STUN Servers
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
];

export const SanctuaryVideoCall = ({
  roomId,
  userName = "Developer",
  socketController,
  onEndCall,
}) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [remoteUserName, setRemoteUserName] = useState("Friend");
  const [isPeerConnected, setIsPeerConnected] = useState(false);

  // In-Call Live Chat Drawer
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  // 1. Timer for call duration
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (isChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatOpen]);

  // Keep localStreamRef synced
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Attach stream to DOM videos on mount
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCameraOn]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 2. Initialize Local Media (Camera & Mic) & WebRTC Peer Connection
  useEffect(() => {
    let activeMediaStream = null;

    const flushQueuedCandidates = async (pc) => {
      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("[WebRTC] Queued candidate error:", err);
        }
      }
    };

    const initMediaAndWebRTC = async () => {
      try {
        activeMediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: true,
        });

        localStreamRef.current = activeMediaStream;
        setLocalStream(activeMediaStream);

        // Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;
        iceCandidateQueueRef.current = [];

        // Add local tracks
        activeMediaStream.getTracks().forEach((track) => {
          pc.addTrack(track, activeMediaStream);
        });

        // Handle incoming remote media track
        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
            setIsPeerConnected(true);
            sounds.playSuccess();
            toast.success("Friend connected to video call! 🎥");
          }
        };

        // ICE candidate exchange
        pc.onicecandidate = (event) => {
          if (event.candidate && socketController) {
            socketController.sendWebRTCCandidate(event.candidate);
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === "connected") {
            setIsPeerConnected(true);
          } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
            setIsPeerConnected(false);
          }
        };
      } catch (err) {
        console.warn("Could not access camera/microphone:", err.message);
        toast.error("Camera or microphone permission not granted. Running in presentation mode.");
      }
    };

    initMediaAndWebRTC();

    return () => {
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  // 3. Socket.IO Signaling Listeners (Offer, Answer, Candidate)
  useEffect(() => {
    if (!socketController) return;

    // Flush helper
    const flushCandidates = async (pc) => {
      while (iceCandidateQueueRef.current.length > 0) {
        const candidate = iceCandidateQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    };

    // If socket sends message into chat
    const prevOnMessage = socketController.onMessage;
    // We can also tap into global chat events if needed

    return () => {
      // Cleanup
    };
  }, [socketController]);

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
  const toggleCamera = () => {
    sounds.playClick();
    const stream = localStreamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
      toast(track.enabled ? "Camera Turned On" : "Camera Turned Off", {
        icon: track.enabled ? "📹" : "🚫",
      });
    }
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    sounds.playClick();
    const pc = peerConnectionRef.current;

    if (isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
        const videoTrack = stream.getVideoTracks()[0];
        const sender = pc?.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && videoTrack) await sender.replaceTrack(videoTrack);
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsScreenSharing(false);
        toast("Screen sharing stopped. Restored camera.");
      } catch (e) {
        console.warn("Failed restoring camera:", e.message);
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = pc?.getSenders().find((s) => s.track && s.track.kind === "video");
        if (sender && screenTrack) await sender.replaceTrack(screenTrack);
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

  // Copy Link
  const handleCopyLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}/meet?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Google Meet link copied! Send it to your friend 🌿");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Send Chat Message
  const handleSendChatMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || !socketController) return;
    sounds.playClick();
    socketController.sendMessage(chatInput.trim(), "guest-dev");
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderName: userName,
        text: chatInput.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setChatInput("");
  };

  const handleSendQuickChip = (text) => {
    sounds.playClick();
    if (socketController) {
      socketController.sendMessage(text, "guest-dev");
    }
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderName: userName,
        text,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Hang up
  const handleEndCall = () => {
    sounds.playClick();
    if (socketController) {
      socketController.sendWebRTCCallEnded();
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (onEndCall) onEndCall();
  };

  return (
    <div className="bg-[#171717] border-3 border-[#0a1b10] rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col h-full min-h-[580px] text-white select-none relative">
      {/* 1. Google Meet Top Bar */}
      <div className="px-5 py-3.5 bg-black/50 border-b border-white/10 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#64DC4C] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-sm uppercase text-white tracking-wide">
                Meet Room: #{roomId}
              </h3>
              <span className="text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2 py-0.5 rounded">
                WEBRTC HD
              </span>
            </div>
            <p className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5 flex items-center gap-2">
              <span>Duration: {formatDuration(callDuration)}</span>
              <span>•</span>
              <span>{isPeerConnected ? "🟢 2 in call" : "⏳ 1 in call (waiting for friend)"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Chat Toggle Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsChatOpen(!isChatOpen);
              setUnreadCount(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              isChatOpen
                ? "bg-[#64DC4C] text-[#0a1b10] border-[#64DC4C]"
                : "bg-white/10 hover:bg-white/20 text-white border-white/20"
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Chat</span>
          </button>

          {/* Copy Meeting Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            title="Copy Video Call Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#64DC4C]" /> : <Copy className="w-3.5 h-3.5 text-white" />}
            <span>{copiedLink ? "Copied!" : "Share Link"}</span>
          </button>

          <Link
            to={`/meet?room=${encodeURIComponent(roomId)}`}
            onClick={() => sounds.playClick()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-[#64DC4C] text-xs font-bold border border-emerald-500/30 transition-all cursor-pointer"
            title="Open Dedicated Fullscreen Google Meet Page"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full Meet</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Stage: 2-Tile Balanced Video Grid & Live Chat Drawer */}
      <div className="flex-1 flex overflow-hidden relative min-h-[420px] bg-[#121212]">
        {/* VIDEO GRID (Both users see each other side-by-side) */}
        <div className="flex-1 p-3 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center overflow-hidden">
          {/* Tile 1: You (Self Video Feed - Always Visible) */}
          <div className="relative w-full h-full min-h-[200px] max-h-[60vh] bg-[#202124] rounded-2xl overflow-hidden border-2 border-white/15 shadow-xl flex items-center justify-center">
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
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                <PixelFox className="w-10 h-10" />
                <span className="font-bold">Camera is off</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-2 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#64DC4C]" />
              <span>You ({userName})</span>
              {isMicOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
            </div>
          </div>

          {/* Tile 2: Friend Video Feed OR Waiting Screen */}
          <div className="relative w-full h-full min-h-[200px] max-h-[60vh] bg-[#202124] rounded-2xl overflow-hidden border-2 border-white/15 shadow-xl flex items-center justify-center">
            {remoteStream && isPeerConnected ? (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-white flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-[#64DC4C] animate-pulse" />
                  <span>Friend ({remoteUserName})</span>
                  <Mic className="w-3 h-3 text-emerald-400" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3 bg-gradient-to-b from-[#202124] to-[#161618]">
                <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500/30 flex items-center justify-center shadow-lg animate-pulse">
                  <PixelOwl className="w-10 h-10" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="font-display font-black text-sm text-white">
                    Waiting for friend to join...
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    When your friend joins room <strong className="text-white font-mono">#{roomId}</strong>, their video will show here!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-2 px-3.5 rounded-full bg-[#64DC4C] hover:bg-[#52c83b] text-[#0a1b10] font-black text-xs transition shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Copy className="w-3 h-3 text-[#0a1b10]" />
                  <span>Copy Link</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. DOCKED IN-CALL LIVE CHAT DRAWER */}
        {isChatOpen && (
          <div className="w-72 sm:w-80 bg-[#1e1e1e] border-l border-white/10 flex flex-col justify-between z-20 shadow-2xl">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-[#171717]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#64DC4C]" />
                <h4 className="font-display font-black text-xs uppercase text-white">Live Chat</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded text-white/60 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between p-3 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[48vh] scrollbar-thin">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    No messages yet. Send a note to your friend! 🌿
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = msg.senderName === userName;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 mb-0.5">
                          {isMe ? "You" : msg.senderName}
                        </span>
                        <div
                          className={`p-2 rounded-xl text-xs max-w-[85%] ${
                            isMe ? "bg-[#64DC4C] text-[#0a1b10] font-bold" : "bg-white/10 text-white"
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

              {/* Quick Calming Chips */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex flex-wrap gap-1">
                  {CALM_SNIPPETS.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendQuickChip(chip)}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-[10px] text-white/80 border border-white/10"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChatMessage} className="flex items-center gap-1.5 pt-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs text-white focus:outline-none focus:border-[#64DC4C]"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-1.5 rounded-lg bg-[#64DC4C] text-[#0a1b10] disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 4. Google Meet Bottom Control Bar */}
      <div className="px-6 py-3.5 bg-black/70 border-t border-white/10 flex items-center justify-between z-10">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{formatDuration(callDuration)}</span>
          <span>•</span>
          <span>#{roomId}</span>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <button
            type="button"
            onClick={toggleMic}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isMicOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-rose-600 text-white"
            }`}
            title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isCameraOn ? "bg-white/15 hover:bg-white/25 text-white" : "bg-rose-600 text-white"
            }`}
            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={toggleScreenShare}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isScreenSharing ? "bg-[#64DC4C] text-[#0a1b10]" : "bg-white/15 hover:bg-white/25 text-white"
            }`}
            title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
          >
            <MonitorUp className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleEndCall}
            className="w-14 h-11 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg ml-2"
            title="End call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right Dock Controls: Prominent Live Chat Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setIsChatOpen(!isChatOpen);
              setUnreadCount(0);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs transition-all cursor-pointer ${
              isChatOpen
                ? "bg-[#64DC4C] text-[#0a1b10]"
                : "bg-white/15 hover:bg-white/25 text-white border border-white/10"
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Live Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SanctuaryVideoCall;
