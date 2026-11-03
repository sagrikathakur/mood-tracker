import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Smile,
  Calendar,
  Image as ImageIcon,
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
      className="w-full scroll-mt-24 select-none"
    >
      <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-9 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10] space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#0a1b10]/15">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a1b10] tracking-tight font-display">
              Express Your Day in Words
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5">
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
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-black border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer ${
                isPrivate
                  ? "bg-[#0a1b10] text-[#64DC4C]"
                  : "bg-white text-slate-800 hover:bg-[#EBF7E9]"
              }`}
              title="Toggle private entry"
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isPrivate ? "PRIVATE PIN" : "PUBLIC NOTE"}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-800">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent border-none text-[#0a1b10] text-xs font-mono font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Mood Selector Grid */}
          <div>
            <label className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10] block mb-3">
              1. DOMINANT EMOTIONAL VIBE
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
                    className={`p-3.5 rounded-xl border-2 border-[#0a1b10] text-left transition-all cursor-pointer flex flex-col items-start ${
                      isSelected
                        ? "bg-[#0a1b10] text-[#64DC4C] shadow-[3px_3px_0px_#64DC4C] translate-x-[1px] translate-y-[1px]"
                        : "bg-white text-slate-900 shadow-[2px_2px_0px_#0a1b10] hover:bg-[#EBF7E9]"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1.5">{mood.emoji}</span>
                    <span className="text-xs font-black font-display">
                      {mood.name}
                    </span>
                    <span className={`text-[11px] font-bold truncate max-w-full ${isSelected ? "text-emerald-300" : "text-slate-600"}`}>
                      {mood.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <label className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10] block mb-2.5">
              2. TOPICS &amp; CONTEXT TAGS
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#0a1b10] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C] font-black"
                        : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
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
              <label className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10]">
                3. YOUR THOUGHTS &amp; REFLECTIONS
              </label>

              {/* Voice Journaling Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-black transition cursor-pointer border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                    isListening
                      ? "bg-rose-100 text-rose-900 animate-pulse"
                      : "bg-white text-slate-800 hover:bg-[#EBF7E9]"
                  }`}
                  title="Voice Journaling (Dictate via microphone)"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5 text-rose-600" /> : <Mic className="w-3.5 h-3.5 text-slate-700" />}
                  <span>{isListening ? "LISTENING..." : "VOICE DICTATE"}</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What happened today? What gave you energy, or what drained you? Write freely..."
                className="w-full p-4 rounded-xl border-2 border-[#0a1b10] bg-white text-slate-900 text-sm font-bold leading-relaxed focus:outline-none shadow-[3px_3px_0px_#0a1b10] focus:shadow-[4px_4px_0px_#0a1b10] resize-y transition-all"
              />
            </div>
          </div>

          {/* Photos & Stickers Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              {/* Photo Upload */}
              <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#0a1b10] bg-white hover:bg-[#EBF7E9] text-xs font-black text-slate-900 transition-all cursor-pointer shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                <ImageIcon className="w-4 h-4 text-emerald-800" />
                <span>{isUploadingImage ? "ATTACHING..." : "ADD PHOTO"}</span>
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
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#0a1b10] text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  isStickerDrawerOpen ? "bg-amber-300 text-amber-950" : "bg-white text-slate-900 hover:bg-[#EBF7E9]"
                }`}
              >
                <Smile className="w-4 h-4 text-amber-700" />
                <span>STICKERS ({selectedStickers.length})</span>
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
              className="px-8 py-3.5 rounded-xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] font-mono font-black text-sm border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#64DC4C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin text-[#64DC4C]" />}
              <span>{isSubmitting ? "PRESERVING..." : "SAVE JOURNAL ENTRY [ ENTER ]"}</span>
            </button>
          </div>

          {/* Attached Images Preview */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10]"
                >
                  <img
                    src={imgUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-[#0a1b10] text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Stickers Drawer */}
          {isStickerDrawerOpen && (
            <div className="p-4 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] space-y-2">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-700 block">
                [ ATTACH STICKERS TO MOMENT ]
              </span>
              <div className="flex flex-wrap gap-2">
                {availableStickers.map((sticker) => {
                  const isAttached = selectedStickers.some((s) => s.id === sticker.id);
                  return (
                    <button
                      type="button"
                      key={sticker.id}
                      onClick={() => toggleSticker(sticker)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-2 border-[#0a1b10] ${
                        isAttached
                          ? "bg-[#90D786] text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] font-black"
                          : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
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
