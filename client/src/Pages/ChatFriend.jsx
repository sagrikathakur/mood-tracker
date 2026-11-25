import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  PhoneCall,
  Check,
  Smartphone,
  Share2,
  Heart,
  Coffee,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { toast } from "react-hot-toast";
import chatBackground from "../assets/chat-background.jpg";

const QUICK_PROMPTS = [
  {
    icon: Coffee,
    label: "Coffee Break",
    text: "Hey! Just checking in on you. Remember to unclench your jaw, drink some water, and take a 5-minute breather ☕",
  },
  {
    icon: Heart,
    label: "Gentle Check-in",
    text: "Thinking of you today! Don't stress about deadlines or to-do lists right now. You're doing great 🌿",
  },
  {
    icon: MessageSquare,
    label: "Open Ear",
    text: "Hey, here whenever you need a listening ear or want to vent about work/life. No pressure to reply immediately 💡",
  },
  {
    icon: Smartphone,
    label: "Screen Break",
    text: "Friendly reminder to rest your eyes, stretch your back, and step outside for some fresh air 🌲",
  },
];

const COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (US/Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+971", label: "+971 (UAE)" },
];

const CRISIS_HELPLINES = [
  { region: "US & Canada", name: "988 Suicide & Crisis Lifeline", action: "Call or text 988", tel: "988" },
  { region: "Crisis Text Line", name: "Text Support", action: "Text HOME to 741741", tel: "741741" },
  { region: "India", name: "Tele-MANAS & iCall", action: "Call 14416 or 9152987821", tel: "14416" },
  { region: "UK", name: "NHS 111 Mental Health", action: "Call 111", tel: "111" },
];

export function ChatFriend() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState(
    "Hey! Just checking in on you. Remember to take a quick breather and hydrate ☕🌿"
  );
  const [showHelpline, setShowHelpline] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cleans the number and combines it with country code
  const getFullPhoneNumber = () => {
    let clean = phoneNumber.replace(/[^0-9]/g, "");
    if (!clean) return "";
    
    // If the user already typed a leading country code with +
    if (phoneNumber.trim().startsWith("+")) {
      return phoneNumber.trim().replace(/[^0-9]/g, "");
    }

    // Strip leading 0 if present (e.g., 09876543210 -> 9876543210)
    if (clean.startsWith("0")) {
      clean = clean.substring(1);
    }

    const code = countryCode.replace("+", "");
    return `${code}${clean}`;
  };

  const handleSendWhatsApp = (e) => {
    if (e) e.preventDefault();
    sounds.playClick();

    const fullNum = getFullPhoneNumber();
    if (!fullNum || fullNum.length < 8) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message to send.");
      return;
    }

    sounds.playSuccess();
    const encodedMsg = encodeURIComponent(message.trim());
    const waUrl = `https://wa.me/${fullNum}?text=${encodedMsg}`;

    // Open WhatsApp in a new tab or trigger app on mobile
    window.open(waUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp...");
  };

  const handleSendSMS = (e) => {
    if (e) e.preventDefault();
    sounds.playClick();

    const fullNum = getFullPhoneNumber();
    if (!fullNum || fullNum.length < 8) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message to send.");
      return;
    }

    sounds.playSuccess();
    const encodedMsg = encodeURIComponent(message.trim());
    
    // iOS uses &body= while Android and desktop use ?body=
    const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const smsUrl = isIOS
      ? `sms:+${fullNum}&body=${encodedMsg}`
      : `sms:+${fullNum}?body=${encodedMsg}`;

    window.location.href = smsUrl;
    toast.success("Opening SMS messenger...");
  };

  const handleCopyMessage = () => {
    sounds.playClick();
    if (!message.trim()) return;
    navigator.clipboard.writeText(message.trim());
    setCopied(true);
    toast.success("Message copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

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
              <span>Text a Friend</span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Direct &amp; Private
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
        <div className="w-full max-w-4xl mx-auto px-4 pt-4 relative z-20">
          <div className="bg-rose-50/95 backdrop-blur-md border border-rose-200 rounded-2xl p-5 shadow-lg space-y-3">
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

      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-7">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 border border-emerald-300/80 flex items-center justify-center text-emerald-800 mx-auto shadow-xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Reach Out to a Friend
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Enter your friend's phone number and send a mindful note directly to their phone via WhatsApp or carrier SMS.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6">
            {/* Phone Number Field */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-700 block">
                Friend's Phone Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 transition-colors cursor-pointer"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 98765 43210"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-xs sm:text-sm font-medium font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                Messages are sent directly from your own phone number so your friend can reply to you.
              </span>
            </div>

            {/* Quick Prompts */}
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold text-slate-700 block">
                Quick Calming Check-Ins
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_PROMPTS.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setMessage(prompt.text);
                      }}
                      className="p-2.5 rounded-xl bg-white/70 hover:bg-white border border-slate-200/80 hover:border-emerald-400 text-left transition-all cursor-pointer flex items-center gap-2 group shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                        {prompt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message Area */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Your Message
                </label>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[11px] text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy text"}</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your check-in message..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white/90 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Send Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleSendSMS}
                className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Send via Text / SMS</span>
              </button>
            </div>
          </form>

          {/* Privacy Guarantee Footer */}
          <div className="pt-4 border-t border-slate-200/60 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              🔒 <strong>100% Private &amp; Direct:</strong> Messages open natively in your personal messaging app. Nothing is stored on our servers.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

export default ChatFriend;
