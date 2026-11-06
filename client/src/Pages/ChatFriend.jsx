import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Phone,
  MessageSquare,
  Send,
  Heart,
  ArrowLeft,
  User,
  Star,
  Trash2,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Radio,
  LogOut,
  Users,
  MessageCircle,
  Video,
  ExternalLink,
} from "lucide-react";
import {
  PixelFox,
  PixelOwl,
  PixelCloud,
  PixelPineTree,
  PixelGrassTuft,
} from "../Components/PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";
import { connectSanctuaryChat } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import SanctuaryVideoCall from "../Components/SanctuaryVideoCall";

const RELATIONSHIP_TAGS = [
  "Best Friend",
  "Dev Buddy",
  "Family",
  "Tech Lead / Mentor",
  "Partner",
  "Colleague",
];

const CALM_SNIPPETS = [
  "Taking a 5-min breather with you ☕",
  "You got this! Deep breath in... deep breath out 🌿",
  "Don't worry about story points right now ✨",
  "Breathe and unclench your jaw 🧘",
  "The bug will make sense tomorrow morning 💡",
];

const CRISIS_HELPLINES = [
  { region: "US & Canada", name: "988 Suicide & Crisis Lifeline", action: "Call or text 988", tel: "988" },
  { region: "Crisis Text Line", name: "Text Support", action: "Text HOME to 741741", tel: "741741" },
  { region: "India", name: "Tele-MANAS & iCall", action: "Call 14416 or 9152987821", tel: "14416" },
  { region: "UK", name: "NHS 111 Mental Health", action: "Call 111", tel: "111" },
];

export function ChatFriend() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Mode: "video" (Google Meet style), "socket" (Live text chat), "direct" (Phone/SMS)
  const initialMode = searchParams.get("video") === "true" ? "video" : "socket";
  const [activeMode, setActiveMode] = useState(initialMode);

  // ==========================================
  // 1. LIVE SOCKET.IO CHATROOM STATE
  // ==========================================
  const initialRoom = searchParams.get("room") || `meadow-${Math.floor(100 + Math.random() * 900)}`;
  const [roomId, setRoomId] = useState(initialRoom);
  const [userName, setUserName] = useState(user?.name || "Developer");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState("connecting"); // "socket.io" | "stream"
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [membersCount, setMembersCount] = useState(1);
  const [typingUser, setTypingUser] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const socketControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to latest chat message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, typingUser]);

  // Handle joining Socket.IO chatroom
  const handleJoinChat = async (e) => {
    if (e) e.preventDefault();
    if (!userName.trim() || !roomId.trim()) {
      toast.error("Please enter both your name and a Room ID.");
      return;
    }

    sounds.playSuccess();
    toast.loading("Connecting to Sanctuary Live Room...", { id: "socket-connect" });

    // Disconnect any existing session
    if (socketControllerRef.current) {
      socketControllerRef.current.disconnect();
    }

    const controller = await connectSanctuaryChat({
      roomId: roomId.trim().toLowerCase(),
      userName: userName.trim(),
      onConnected: (status, type) => {
        setIsConnected(status);
        setConnectionType(type);
        toast.success(`Joined room #${roomId}! 🌿`, { id: "socket-connect" });
      },
      onHistory: (history, count) => {
        setChatMessages(history || []);
        if (count) setMembersCount(count);
      },
      onMessage: (newMsg) => {
        sounds.playPop(480);
        setChatMessages((prev) => [...prev, newMsg]);
      },
      onUserJoined: (data) => {
        sounds.playCalmTone(540, 0.2);
        toast(`🟢 ${data.userName} joined the room`, { icon: "👋" });
        if (data.membersCount) setMembersCount(data.membersCount);
      },
      onUserLeft: (data) => {
        toast(`⚪ ${data.userName} stepped out`, { icon: "👋" });
        if (data.membersCount) setMembersCount(data.membersCount);
      },
      onTyping: (data) => {
        if (data.isTyping) {
          setTypingUser(data.userName);
        } else {
          setTypingUser(null);
        }
      },
    });

    socketControllerRef.current = controller;
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputMsg.trim() || !socketControllerRef.current) return;

    sounds.playClick();
    socketControllerRef.current.sendMessage(inputMsg, user?.id || "guest-dev");
    socketControllerRef.current.sendTyping(false);
    setInputMsg("");
  };

  const handleInputChange = (e) => {
    setInputMsg(e.target.value);
    if (!socketControllerRef.current) return;

    // Send typing notification
    socketControllerRef.current.sendTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketControllerRef.current?.sendTyping(false);
    }, 1500);
  };

  const handleSendSnippet = (snippetText) => {
    sounds.playClick();
    if (!socketControllerRef.current || !isConnected) {
      toast.error("Please connect to the room first.");
      return;
    }
    socketControllerRef.current.sendMessage(snippetText, user?.id || "guest-dev");
  };

  const handleCopyInviteLink = () => {
    sounds.playClick();
    const url = `${window.location.origin}/chatafriend?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast.success("Invite link copied to clipboard! Send it to your friend 🌿");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleLeaveRoom = () => {
    sounds.playClick();
    if (socketControllerRef.current) {
      socketControllerRef.current.disconnect();
      socketControllerRef.current = null;
    }
    setIsConnected(false);
    setChatMessages([]);
    toast("Left sanctuary room.");
  };

  // Disconnect socket on page unmount
  useEffect(() => {
    return () => {
      if (socketControllerRef.current) {
        socketControllerRef.current.disconnect();
      }
    };
  }, []);

  // ==========================================
  // 2. DIRECT PHONE & SMS STATE
  // ==========================================
  const [friendName, setFriendName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [relationship, setRelationship] = useState("Best Friend");
  const [directMessage, setDirectMessage] = useState(
    "Hey! Taking a quick 10-minute break from code. Are you free for a quick chat?"
  );

  const [savedBuddies, setSavedBuddies] = useState(() => {
    try {
      const stored = localStorage.getItem("calmme_lifeline_buddies");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showHelpline, setShowHelpline] = useState(false);

  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, "");
  const waCleanPhone = phoneNumber.replace(/[^0-9]/g, "");

  const handleCall = () => {
    sounds.playClick();
    if (!cleanPhone) {
      toast.error("Please enter a valid phone number first.");
      return;
    }
    window.location.href = `tel:${cleanPhone}`;
  };

  const handleSMS = () => {
    sounds.playClick();
    if (!cleanPhone) {
      toast.error("Please enter a valid phone number first.");
      return;
    }
    const encoded = encodeURIComponent(directMessage.trim());
    window.location.href = `sms:${cleanPhone}?body=${encoded}`;
  };

  const handleWhatsApp = () => {
    sounds.playClick();
    if (!waCleanPhone) {
      toast.error("Please enter a phone number with country code.");
      return;
    }
    const encoded = encodeURIComponent(directMessage.trim());
    window.open(`https://wa.me/${waCleanPhone}?text=${encoded}`, "_blank");
  };

  const handleSaveBuddy = (e) => {
    e.preventDefault();
    if (!friendName.trim() || !phoneNumber.trim()) {
      toast.error("Please enter both a name and a phone number.");
      return;
    }
    sounds.playSuccess();
    const newBuddy = {
      id: Date.now().toString(),
      name: friendName.trim(),
      phone: phoneNumber.trim(),
      relationship,
    };
    const updated = [newBuddy, ...savedBuddies];
    setSavedBuddies(updated);
    localStorage.setItem("calmme_lifeline_buddies", JSON.stringify(updated));
    toast.success(`Saved ${newBuddy.name} to Lifelines! ⭐`);
  };

  const handleDeleteBuddy = (id) => {
    sounds.playClick();
    const updated = savedBuddies.filter((b) => b.id !== id);
    setSavedBuddies(updated);
    localStorage.setItem("calmme_lifeline_buddies", JSON.stringify(updated));
    toast.success("Lifeline removed.");
  };

  return (
    <div className="min-h-screen bg-[#90D786] text-slate-900 flex flex-col font-sans selection:bg-[#0a1b10] selection:text-[#64DC4C] relative overflow-x-hidden">
      {/* Background Pixel Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-12 left-10 opacity-40">
          <PixelCloud className="w-32 h-14" />
        </div>
        <div className="absolute top-28 right-16 opacity-35">
          <PixelCloud className="w-40 h-18" />
        </div>
        <div className="absolute bottom-20 left-8 opacity-25">
          <PixelPineTree className="w-12 h-20" />
        </div>
        <div className="absolute bottom-16 right-12 opacity-30">
          <PixelPineTree className="w-14 h-24" />
        </div>
        <div className="absolute bottom-10 left-1/3 opacity-20">
          <PixelGrassTuft className="w-6 h-6 text-[#0a1b10]" />
        </div>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full bg-[#FCFAF7] border-b-2 border-[#0a1b10]/20 shadow-xs px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/tracker"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sanctuary</span>
          </Link>

          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-950 font-display flex items-center gap-2">
              <span>Chat a Friend</span>
              <span className="text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2 py-0.5 rounded border border-[#0a1b10]">
                SOCKET.IO LIVE
              </span>
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setShowHelpline(!showHelpline);
          }}
          className="text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border-2 border-rose-600 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_#b91c1c] transition-all cursor-pointer flex items-center gap-1.5"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">24/7 Crisis Support</span>
          <span className="sm:hidden">Lifeline</span>
        </button>
      </header>

      {/* Emergency Crisis Support Banner */}
      {showHelpline && (
        <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-rose-50 border-3 border-rose-600 rounded-2xl p-5 shadow-[4px_4px_0px_#b91c1c] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-black text-sm uppercase">
                <AlertCircle className="w-4 h-4 text-rose-700" />
                <span>Free Confidential 24/7 Crisis Support</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpline(false)}
                className="text-xs font-bold text-rose-800 hover:text-black underline cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {CRISIS_HELPLINES.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.tel}`}
                  className="p-3 bg-white border-2 border-rose-400 rounded-xl hover:border-rose-700 shadow-xs flex flex-col justify-between transition-colors"
                >
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{h.region}</span>
                  <span className="text-xs font-extrabold text-slate-900 mt-1">{h.name}</span>
                  <span className="text-xs font-bold text-rose-700 mt-1.5 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>{h.action}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Mode Switcher Pill */}
        <div className="flex items-center justify-center">
          <div className="inline-flex flex-wrap items-center justify-center p-1.5 rounded-2xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] gap-1.5">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveMode("video");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${activeMode === "video"
                  ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#000]"
                  : "text-slate-700 hover:text-black hover:bg-slate-100"
                }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Google Meet Video Call</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveMode("socket");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${activeMode === "socket"
                  ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#000]"
                  : "text-slate-700 hover:text-black hover:bg-slate-100"
                }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Live In-App Chat (Socket.IO)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveMode("direct");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${activeMode === "direct"
                  ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#000]"
                  : "text-slate-700 hover:text-black hover:bg-slate-100"
                }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Phone & SMS</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            VIEW 0: GOOGLE MEET STYLE VIDEO CALL ROOM (WebRTC & G-Meet Fallback)
           ========================================================================= */}
        {activeMode === "video" && (
          <SanctuaryVideoCall
            roomId={roomId}
            userName={userName}
            socketController={socketControllerRef.current}
            onEndCall={() => setActiveMode("socket")}
          />
        )}

        {/* =========================================================================
            VIEW 1: LIVE SOCKET.IO CHATROOM
           ========================================================================= */}
        {activeMode === "socket" && (
          <div className="bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl shadow-[6px_6px_0px_#0a1b10] overflow-hidden flex flex-col min-h-[580px]">
            {/* Chatroom Top Bar */}
            <div className="p-4 sm:p-5 bg-white border-b-2 border-[#0a1b10]/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-[#0a1b10] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-[#0a1b10]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-sm text-[#0a1b10] uppercase">
                      Sanctuary Room: #{roomId}
                    </h3>
                    <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-[#64DC4C] text-[#0a1b10] px-2 py-0.5 rounded border border-[#0a1b10]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0a1b10] animate-pulse" />
                      {isConnected ? (connectionType === "socket.io" ? "SOCKET.IO LIVE" : "LIVE STREAM") : "OFFLINE"}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-500 font-bold flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-600" />
                      <span>{membersCount} in room</span>
                    </span>
                    <span>•</span>
                    <span>100% ephemeral memory</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Copy Invite & Video Call & Leave */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveMode("video");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border-2 border-[#0a1b10] text-xs font-black shadow-[2px_2px_0px_#0a1b10] transition-all cursor-pointer flex items-center gap-1.5"
                  title="Switch to Google Meet style video call"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="hidden sm:inline">Start Video Call</span>
                  <span className="sm:hidden">Video</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-[#0a1b10] text-xs font-bold shadow-[2px_2px_0px_#0a1b10] transition-all cursor-pointer flex items-center gap-1.5"
                  title="Copy shareable invite link for your friend"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Invite Friend"}</span>
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-600 text-xs font-bold shadow-[2px_2px_0px_#b91c1c] cursor-pointer"
                    title="Leave room"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* If NOT connected yet: Room Setup Form */}
            {!isConnected ? (
              <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] flex items-center justify-center">
                  <PixelFox className="w-10 h-10" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-display font-black text-xl text-slate-950">
                    Join or Create a Private Sanctuary Chat
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    Enter your name and a Room ID to connect live via Socket.IO. Share the Room ID with a friend so they can join you.
                  </p>
                </div>

                <form onSubmit={handleJoinChat} className="w-full max-w-sm space-y-3.5 text-left">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                      Your Name / Developer Handle
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Sagrika"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_#0a1b10]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                      Sanctuary Room Code
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="e.g. meadow-742"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-mono font-bold text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_#0a1b10]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] text-xs sm:text-sm font-black shadow-[4px_4px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <Radio className="w-4 h-4 text-[#64DC4C]" />
                    <span>CONNECT TO LIVE CHAT</span>
                  </button>
                </form>
              </div>
            ) : (
              /* Connected Chat Interface */
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-4">
                {/* Message Scroll Area */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[380px] min-h-[260px] scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <PixelOwl className="w-12 h-12 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">
                        Sanctuary room is quiet. Send a message or click &ldquo;Invite Friend&rdquo; above! 🌿
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isMe = msg.senderName === userName;
                      const timeStr = msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "";

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-500 mb-0.5">
                            <span>{isMe ? "You" : msg.senderName}</span>
                            <span>·</span>
                            <span>{timeStr}</span>
                          </div>
                          <div
                            className={`max-w-[80%] sm:max-w-md p-3.5 rounded-2xl text-xs sm:text-sm font-medium shadow-[2px_2px_0px_#0a1b10] border-2 border-[#0a1b10] ${isMe ? "bg-[#0a1b10] text-[#64DC4C]" : "bg-white text-slate-900"
                              }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing Indicator */}
                  {typingUser && (
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-500 italic animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      <span>{typingUser} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Calming Quick Reactions Bar */}
                <div className="pt-2 border-t border-[#0a1b10]/15 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
                    <span>1-CLICK CALMING REACTION PROMPTS:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CALM_SNIPPETS.map((snippet, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendSnippet(snippet)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#0a1b10]/40 hover:border-[#0a1b10] hover:bg-emerald-50 text-[11px] font-bold text-slate-800 transition-all cursor-pointer shadow-2xs"
                      >
                        {snippet}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input Form */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={handleInputChange}
                    placeholder="Type a comforting message or thought... [Enter to send]"
                    className="flex-1 p-3 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_#0a1b10]"
                  />
                  <button
                    type="submit"
                    className="py-3 px-5 rounded-xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] font-mono font-bold text-xs uppercase tracking-wide shadow-[3px_3px_0px_#000] cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>SEND</span>
                    <Send className="w-3.5 h-3.5 text-[#64DC4C]" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 2: DIRECT PHONE & SMS LIFELINE
           ========================================================================= */}
        {activeMode === "direct" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Direct Call & Text Terminal (7 Cols) */}
            <div className="lg:col-span-7 bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_#0a1b10] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0a1b10]/15">
                <span className="font-display font-black text-sm uppercase text-[#0a1b10] flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-800" />
                  <span>Friend Contact Terminal</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-[#0a1b10] px-2 py-0.5 rounded">
                  100% PRIVATE & DIRECT
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                      Friend / Buddy Name
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Alex (Dev Buddy)"
                        value={friendName}
                        onChange={(e) => setFriendName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_#0a1b10]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                      Phone Number (with Country Code)
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="e.g. +1 555 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-bold font-mono text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_#0a1b10]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-600 block">
                    Relationship Tag:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {RELATIONSHIP_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setRelationship(tag);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${relationship === tag
                            ? "bg-[#0a1b10] text-[#64DC4C] border border-[#0a1b10]"
                            : "bg-white text-slate-700 border border-slate-300 hover:border-slate-800"
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
                    Text / WhatsApp Message Draft
                  </label>
                  <textarea
                    rows={3}
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    placeholder="Type a quick message..."
                    className="w-full p-3 rounded-xl border-2 border-[#0a1b10] bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:shadow-[2px_2px_0px_#0a1b10] resize-none"
                  />
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCall}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] text-xs sm:text-sm font-black shadow-[4px_4px_0px_#000] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#64DC4C]" />
                    <span>CALL FRIEND NOW</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSMS}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-black border-2 border-[#0a1b10] shadow-[4px_4px_0px_#0a1b10] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-800" />
                    <span>TEXT VIA SMS</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-[3px_3px_0px_#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>OPEN IN WHATSAPP CHAT</span>
                </button>
              </div>

              <div className="pt-2 border-t border-[#0a1b10]/15 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Stored only on your device</span>
                </span>

                <button
                  type="button"
                  onClick={handleSaveBuddy}
                  className="text-xs font-black text-slate-800 hover:text-black bg-amber-100 hover:bg-amber-200 border-2 border-[#0a1b10] py-1.5 px-3 rounded-xl shadow-[2px_2px_0px_#0a1b10] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>Save to Lifelines</span>
                </button>
              </div>
            </div>

            {/* Right Column: Saved Lifelines Buddies Deck (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#0a1b10] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-[#0a1b10]/15">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                    <h3 className="font-display font-black text-sm uppercase text-[#0a1b10]">
                      My Saved Lifelines
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-white border border-[#0a1b10] px-2 py-0.5 rounded">
                    {savedBuddies.length} SAVED
                  </span>
                </div>

                {savedBuddies.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Heart className="w-8 h-8 text-rose-400 mx-auto opacity-75" />
                    <p className="text-xs text-slate-600 font-medium">
                      No friends saved yet. Enter a phone number on the left and click &ldquo;Save to Lifelines&rdquo;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedBuddies.map((buddy) => (
                      <div
                        key={buddy.id}
                        className="p-3.5 rounded-2xl bg-white border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] space-y-2.5 transition-all hover:-translate-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 border border-[#0a1b10]">
                              {buddy.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-slate-900 truncate">{buddy.name}</h4>
                              <span className="text-[10px] font-mono text-slate-500 font-bold truncate block">
                                {buddy.phone}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                            {buddy.relationship || "Buddy"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setFriendName(buddy.name);
                              setPhoneNumber(buddy.phone);
                              if (buddy.relationship) setRelationship(buddy.relationship);
                            }}
                            className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer"
                          >
                            Select
                          </button>

                          <a
                            href={`tel:${buddy.phone.replace(/[^0-9+]/g, "")}`}
                            onClick={() => sounds.playClick()}
                            className="p-1.5 rounded-lg bg-[#0a1b10] hover:bg-black text-[#64DC4C] border border-[#0a1b10] transition-colors cursor-pointer"
                            title={`Call ${buddy.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          <a
                            href={`sms:${buddy.phone.replace(/[^0-9+]/g, "")}?body=${encodeURIComponent(directMessage)}`}
                            onClick={() => sounds.playClick()}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer"
                            title={`Text ${buddy.name}`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteBuddy(buddy.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove from lifelines"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Retro Status Footer */}
      <footer className="relative z-10 w-full bg-[#0a1b10] text-[#64DC4C] border-t-2 border-[#0a1b10] py-3.5 px-4 sm:px-8 text-xs font-mono select-none mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>🟢 Calm Me · Socket.IO Sanctuary Bridge · Engineered by Sagrika Thakur</span>
          <span className="text-[11px] text-emerald-400 font-bold">
            ZERO SURVEILLANCE · EPHEMERAL REAL-TIME MESH
          </span>
        </div>
      </footer>
    </div>
  );
}

export default ChatFriend;
