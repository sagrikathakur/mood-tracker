import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Smile,
  Calendar,
  Image as ImageIcon,
  Tag,
  X,
  Loader2,
  Sparkles,
  ChevronDown,
  Mic,
  MicOff,
  Lock,
  Unlock,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";

export const MOOD_OPTIONS = [
  {
    name: "Happy",
    emoji: "😄",
    color: "bg-emerald-50 text-emerald-800 border-emerald-300",
    desc: "Good vibes & joy",
  },
  {
    name: "Calm",
    emoji: "😌",
    color: "bg-teal-50 text-teal-800 border-teal-300",
    desc: "Peaceful & steady",
  },
  {
    name: "Grateful",
    emoji: "🥰",
    color: "bg-rose-50 text-rose-800 border-rose-300",
    desc: "Warm & thankful",
  },
  {
    name: "Excited",
    emoji: "🤩",
    color: "bg-amber-50 text-amber-800 border-amber-300",
    desc: "Energized & hyped",
  },
  {
    name: "Neutral",
    emoji: "😐",
    color: "bg-slate-100 text-slate-800 border-slate-300",
    desc: "Balanced & quiet",
  },
  {
    name: "Anxious",
    emoji: "😰",
    color: "bg-purple-50 text-purple-800 border-purple-300",
    desc: "Uneasy or rushed",
  },
  {
    name: "Sad",
    emoji: "😔",
    color: "bg-sky-50 text-sky-800 border-sky-300",
    desc: "Heavy & reflective",
  },
  {
    name: "Angry",
    emoji: "😡",
    color: "bg-red-50 text-red-800 border-red-300",
    desc: "Tense or blocked",
  },
  {
    name: "Tired",
    emoji: "😴",
    color: "bg-indigo-50 text-indigo-800 border-indigo-300",
    desc: "Low energy reserve",
  },
];

export const AVAILABLE_TAGS = [
  "Debugging",
  "Sprint Crunch",
  "PR Review",
  "Burnout",
  "Flow State",
  "Architecture",
  "Rest & Sleep",
  "Personal",
  "Gratitude",
];

const JournalCreator = ({ onEntryCreated }) => {
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [selectedTags, setSelectedTags] = useState(["Personal"]);
  const [isPrivate, setIsPrivate] = useState(true);
  const [availableStickers, setAvailableStickers] = useState([]);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [images, setImages] = useState([]);
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Voice Journaling State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    ) {
      setSpeechSupported(true);
    }
  }, []);

  const toggleVoiceDictation = () => {
    if (!speechSupported) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!isListening) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          sounds.playBlip(600);
          setIsListening(true);
          toast.success("Listening... speak your reflection", { icon: "🎙️" });
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
          sounds.playPop();
        };

        recognition.onerror = () => {
          setIsListening(false);
          toast.error("Microphone listening stopped.");
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
        toast.error("Could not start speech recognition.");
      }
    } else {
      sounds.playPop();
      setIsListening(false);
    }
  };

  // Fetch available stickers
  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const res = await api.get("/api/stickers");
        if (res.data?.stickers) {
          setAvailableStickers(res.data.stickers);
        }
      } catch (err) {
        console.warn("Could not load stickers:", err?.message);
      }
    };
    fetchStickers();
  }, []);

  const toggleTag = (tag) => {
    sounds.playClick();
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleSticker = (sticker) => {
    sounds.playPop();
    const exists = selectedStickers.some((s) => s.id === sticker.id);
    if (exists) {
      setSelectedStickers(selectedStickers.filter((s) => s.id !== sticker.id));
    } else {
      setSelectedStickers([...selectedStickers, sticker]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10MB)");
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api.post("/api/upload", {
          image: reader.result,
          filename: file.name,
        });

        if (res.data?.imageUrl) {
          setImages((prev) => [...prev, res.data.imageUrl]);
          sounds.playSuccess();
          toast.success("Photo attached!");
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to upload photo");
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = (index) => {
    sounds.playPop();
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Please choose how you feel!");
      return;
    }

    sounds.playClick();
    setIsSubmitting(true);
    try {
      await api.post("/api/journal", {
        mood: selectedMood,
        content: content.trim(),
        entryDate,
        tags: selectedTags,
        isPrivate,
        stickers: selectedStickers.map((s) => s.id),
        imageUrls: images,
      });

      sounds.playSuccess();
      toast.success("Journal entry archived to your private sanctuary! ✨");
      setContent("");
      setSelectedStickers([]);
      setImages([]);
      if (onEntryCreated) onEntryCreated();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save journal entry"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="tracker"
      className="w-full max-w-5xl mx-auto my-8 px-4 sm:px-6 scroll-mt-24"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Developer Reflection Journal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Express Your Day in Words
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Select dominant emotional tone, dictate or type reflection, and tag developer topics.
            </p>
          </div>

          {/* Date Picker & Privacy Indicator */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsPrivate(!isPrivate);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                isPrivate
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              title="Toggle private entry"
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isPrivate ? "Private" : "Public"}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent border-none text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-7">
          {/* Mood Selector Grid */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-3">
              1. Dominant Emotional Vibe
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMood === mood.name;
                return (
                  <button
                    type="button"
                    key={mood.name}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedMood(mood.name);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col items-start ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]"
                        : "bg-slate-50/70 text-slate-800 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1.5">{mood.emoji}</span>
                    <span className="text-xs font-bold font-display">
                      {mood.name}
                    </span>
                    <span className={`text-[11px] truncate max-w-full ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                      {mood.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2.5">
              2. Topics & Context Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rich Text Area with Voice Journaling Button */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Your Thoughts & Reflections
              </label>

              {/* Voice Journaling Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                    isListening
                      ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                  title="Voice Journaling (Dictate via microphone)"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{isListening ? "Listening..." : "Voice Dictate"}</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What happened today? What gave you energy, or what drained you? Write freely..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 resize-y shadow-2xs"
              />
            </div>
          </div>

          {/* Photos & Stickers Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              {/* Photo Upload */}
              <label className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>{isUploadingImage ? "Attaching..." : "Add Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>

              {/* Stickers Drawer Toggle */}
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsStickerDrawerOpen(!isStickerDrawerOpen);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs ${
                  isStickerDrawerOpen ? "bg-amber-50 text-amber-900 border-amber-300" : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Smile className="w-4 h-4 text-amber-500" />
                <span>Stickers ({selectedStickers.length})</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isStickerDrawerOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-7 py-3 rounded-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "Preserving..." : "Save Journal Entry"}</span>
            </button>
          </div>

          {/* Attached Images Preview */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-xs"
                >
                  <img
                    src={imgUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Stickers Drawer */}
          {isStickerDrawerOpen && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Tap to attach stickers to this moment:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableStickers.map((sticker) => {
                  const isAttached = selectedStickers.some((s) => s.id === sticker.id);
                  return (
                    <button
                      type="button"
                      key={sticker.id}
                      onClick={() => toggleSticker(sticker)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                        isAttached
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-base">{sticker.emoji}</span>
                      <span>{sticker.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default JournalCreator;
