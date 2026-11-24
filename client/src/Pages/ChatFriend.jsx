import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  Users,
  Video,
  PhoneCall,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";
import { connectSanctuaryChat } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import SanctuaryVideoCall from "../Components/SanctuaryVideoCall";
import chatBackground from "../assets/chat-background.jpg";

const CALM_SNIPPETS = [
  "Taking a 5-min breather with you ☕",
  "You got this! Deep breath in... deep breath out 🌿",
  "Don't worry about story points right now 🌿",
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

  const initialMode = searchParams.get("video") === "true" ? "video" : "chat";
  const [activeMode, setActiveMode] = useState(initialMode);

  const initialRoom = searchParams.get("room") || `meadow-${Math.floor(100 + Math.random() * 900)}`;
  const [roomId, setRoomId] = useState(initialRoom);
  const [userName, setUserName] = useState(
    user?.name && !user.name.toLowerCase().includes("sagrika") ? user.name : "Alex"
  );
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState("connecting");
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [membersCount, setMembersCount] = useState(1);
  const [typingUser, setTypingUser] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showHelpline, setShowHelpline] = useState(false);

  const socketControllerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, typingUser]);

  const handleJoinChat = async (e) => {
    if (e) e.preventDefault();
    if (!userName.trim() || !roomId.trim()) {
      toast.error("Please enter both your name and a Room ID.");
      return;
    }

    sounds.playSuccess();
    toast.loading("Connecting to private room...", { id: "socket-connect" });

    if (socketControllerRef.current) {
      socketControllerRef.current.disconnect();
    }

    const controller = await connectSanctuaryChat({
      roomId: roomId.trim().toLowerCase(),
      userName: userName.trim(),
      onConnected: (status, type) => {
        setIsConnected(status);
        setConnectionType(type);
        toast.success(`Joined room #${roomId}`, { id: "socket-connect" });
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
        toast(`⚪ ${data.userName} left the room`, { icon: "👋" });
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
    toast.success("Invite link copied to clipboard");
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
    toast("Left room.");
  };

  useEffect(() => {
    return () => {
      if (socketControllerRef.current) {
        socketControllerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div
      className="relative min-h-screen text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-950 overflow-x-hidden bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: `url(${chatBackground})` }}
    >
      {/* Background Image overlay for complete coverage */}
      <img
        src={chatBackground}
        alt="Lush Canopy & Sky Background"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      <header className="relative z-10 w-full bg-white/85 backdrop-blur-xl border-b border-white/70 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between sticky top-0 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            to="/tracker"
            onClick={() => sounds.playClick()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-semibold border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <span>Chat a Friend</span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Private Room
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
          className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">24/7 Crisis Support</span>
          <span className="sm:hidden">Support</span>
        </button>
      </header>

      {showHelpline && (
        <div className="w-full max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Free &amp; Confidential 24/7 Support</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpline(false)}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 cursor-pointer"
              >
                Close ✕
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {CRISIS_HELPLINES.map((h, i) => (
                <a
                  key={i}
                  href={`tel:${h.tel}`}
                  className="p-3 bg-white border border-rose-200 rounded-xl hover:border-rose-400 shadow-2xs flex flex-col justify-between transition-colors"
                >
                  <span className="text-[10px] font-mono font-medium text-slate-500 uppercase">{h.region}</span>
                  <span className="text-xs font-bold text-slate-900 mt-1">{h.name}</span>
                  <span className="text-xs font-semibold text-rose-700 mt-1.5 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3" />
                    <span>{h.action}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center p-1 rounded-2xl bg-slate-200/60 border border-slate-200/90 gap-1 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveMode("chat");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeMode === "chat"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Chat</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveMode("video");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeMode === "video"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              <span>Video Call</span>
            </button>
          </div>
        </div>

        {activeMode === "video" && (
          <SanctuaryVideoCall
            roomId={roomId}
            userName={userName}
            socketController={socketControllerRef.current}
            onEndCall={() => setActiveMode("chat")}
          />
        )}

        {activeMode === "chat" && (
          <div className="bg-white/75 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[560px]">
            <div className="p-4 sm:p-5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3 bg-white/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 font-display">
                      Room #{roomId}
                    </h3>
                    <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      {isConnected ? "Connected" : "Ready"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{membersCount} {membersCount === 1 ? "participant" : "participants"}</span>
                    </span>
                    <span>•</span>
                    <span>Private &amp; ephemeral</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveMode("video");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Switch to video call"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Start Video Call</span>
                  <span className="sm:hidden">Video</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Copy invite link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? "Link Copied" : "Invite Friend"}</span>
                </button>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    title="Leave room"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {!isConnected ? (
              <div className="flex-1 p-6 sm:p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-center text-emerald-700">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md">
                  <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 font-display">
                    Connect to Live Chat
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                    Enter your name and a room code to open a private, peer-to-peer reflection space. Share the link with your friend to connect.
                  </p>
                </div>

                <form onSubmit={handleJoinChat} className="w-full max-w-sm space-y-4 text-left">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Alex"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="e.g. meadow-742"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-mono font-medium text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enter Live Chat</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-4">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[400px] min-h-[260px] scrollbar-thin">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-16 space-y-2">
                      <p className="text-xs font-semibold text-slate-500">
                        Room is quiet. Send a message or invite your friend to join.
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
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mb-1">
                            <span className="font-semibold text-slate-600">{isMe ? "You" : msg.senderName}</span>
                            <span>·</span>
                            <span>{timeStr}</span>
                          </div>
                          <div
                            className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${isMe
                                ? "bg-emerald-600 text-white rounded-tr-xs"
                                : "bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/60"
                              }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {typingUser && (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 italic animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{typingUser} is typing...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Quick responses:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CALM_SNIPPETS.map((snippet, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendSnippet(snippet)}
                        className="px-3 py-1 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-200 text-xs font-medium text-slate-700 hover:text-emerald-800 transition-colors cursor-pointer"
                      >
                        {snippet}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={inputMsg}
                    onChange={handleInputChange}
                    placeholder="Type a message... (Press Enter to send)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMsg.trim()}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wide shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="relative z-10 w-full bg-white/85 backdrop-blur-md border-t border-white/60 py-3.5 px-4 sm:px-8 text-xs font-mono select-none mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-slate-500">
          <span>CalmTREE · Private Peer Sanctuary</span>
          <span className="text-[11px] text-emerald-700 font-semibold">
            ZERO TELEMETRY · EPHEMERAL REAL-TIME MESH
          </span>
        </div>
      </footer>
    </div>
  );
}

export default ChatFriend;
