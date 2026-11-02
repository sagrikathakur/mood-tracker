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
import { PixelHeart, PixelStar, PixelFlame, PixelOwl } from "./PixelIcons";

export const MOOD_OPTIONS = [
  {
    name: "Happy",
    emoji: "😄",
    color: "bg-[#55EFC4] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Good vibes & joy",
  },
  {
    name: "Calm",
    emoji: "😌",
    color: "bg-[#74B9FF] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Peaceful & steady",
  },
  {
    name: "Grateful",
    emoji: "🥰",
    color: "bg-[#FF7675] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Warm & thankful",
  },
  {
    name: "Excited",
    emoji: "🤩",
    color: "bg-[#FFEAA7] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Energized & hyped",
  },
  {
    name: "Neutral",
    emoji: "😐",
    color: "bg-white text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Balanced & quiet",
  },
  {
    name: "Anxious",
    emoji: "😰",
    color: "bg-[#D6A2E8] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Uneasy or rushed",
  },
  {
    name: "Sad",
    emoji: "😔",
    color: "bg-[#81ECEC] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Heavy & reflective",
  },
  {
    name: "Angry",
    emoji: "😡",
    color: "bg-[#FF7675] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Tense or blocked",
  },
  {
    name: "Tired",
    emoji: "😴",
    color: "bg-[#DFE6E9] text-[#18181B]",
    border: "border-[#18181B]",
    desc: "Low energy reserve",
  },
];

export const AVAILABLE_TAGS = [
  "Work",
  "Family",
  "Relationships",
  "Health",
  "Personal",
  "Growth",
  "Mindfulness",
  "Creativity",
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
      className="w-full max-w-4xl mx-auto my-10 px-4 sm:px-6 scroll-mt-24"
    >
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#18181B]/15">
          <div>
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#74B9FF] text-[#18181B] text-[11px] mb-2 font-['Silkscreen']">
              <Sparkles className="w-3.5 h-3.5" />
              DAILY THOUGHT RECORDER
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Express Your Day in Words
            </h2>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-0.5">
              Select dominant emotional tone, dictate or type reflection, and tag life topics.
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-['Silkscreen'] border-2 border-[#18181B] transition cursor-pointer ${
                isPrivate
                  ? "bg-[#18181B] text-white shadow-[2px_2px_0px_#18181B]"
                  : "bg-white text-[#18181B] shadow-[2px_2px_0px_#18181B]"
              }`}
              title="Toggle private entry"
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isPrivate ? "PRIVATE" : "PUBLIC"}</span>
            </button>

            <div className="flex items-center gap-1.5 bg-white border-2 border-[#18181B] px-2.5 py-1.5 rounded text-xs font-['Silkscreen'] shadow-[2px_2px_0px_#18181B]">
              <Calendar className="w-3.5 h-3.5 text-[#18181B]/60" />
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="bg-transparent border-none text-[#18181B] text-xs font-bold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Mood Selector Grid */}
          <div>
            <label className="text-[11px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B] block mb-2.5">
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
                    className={`p-3 rounded-lg border-2 border-[#18181B] text-left transition-all cursor-pointer flex flex-col items-start ${
                      isSelected
                        ? `${mood.color} shadow-[3px_3px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]`
                        : "bg-white text-[#18181B] hover:bg-[#FAF8F5] shadow-[2px_2px_0px_#18181B]"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{mood.emoji}</span>
                    <span className="text-xs font-black font-['Bricolage_Grotesque']">
                      {mood.name}
                    </span>
                    <span className="text-[10px] text-[#18181B]/60 line-clamp-1">
                      {mood.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags Selection */}
          <div>
            <label className="text-[11px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B] block mb-2">
              2. TOPICS & CONTEXT TAGS
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded text-xs font-['Silkscreen'] border-2 border-[#18181B] transition cursor-pointer ${
                      isSelected
                        ? "bg-[#FFEAA7] text-[#18181B] shadow-[2px_2px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]"
                        : "bg-white text-[#18181B]/70 hover:text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]"
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]">
                3. YOUR THOUGHTS & REFLECTIONS
              </label>

              {/* Voice Journaling Button */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-['Silkscreen'] border-2 border-[#18181B] transition cursor-pointer ${
                    isListening
                      ? "bg-[#FF7675] text-white animate-pulse shadow-[2px_2px_0px_#18181B]"
                      : "bg-white text-[#18181B] hover:bg-[#FAF8F5] shadow-[2px_2px_0px_#18181B]"
                  }`}
                  title="Voice Journaling (Dictate via microphone)"
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
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
                className="w-full p-4 rounded-xl border-2 border-[#18181B] text-[#18181B] text-xs sm:text-sm leading-relaxed focus:outline-none bg-white resize-y shadow-[3px_3px_0px_#18181B]"
              />
            </div>
          </div>

          {/* Photos & Stickers Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              {/* Photo Upload */}
              <label className="pixel-btn flex items-center gap-1.5 px-3.5 py-2 text-xs font-['Silkscreen'] cursor-pointer">
                <ImageIcon className="w-4 h-4 text-[#0984E3]" />
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
                className={`pixel-btn flex items-center gap-1.5 px-3.5 py-2 text-xs font-['Silkscreen'] cursor-pointer ${
                  isStickerDrawerOpen ? "bg-[#FFEAA7]" : ""
                }`}
              >
                <Smile className="w-4 h-4 text-[#F1C40F]" />
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
              className="pixel-btn pixel-btn-green px-6 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSubmitting ? "ARCHIVING..." : "SAVE JOURNAL ENTRY"}</span>
            </button>
          </div>

          {/* Attached Images Preview */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-20 rounded-lg overflow-hidden border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]"
                >
                  <img
                    src={imgUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded bg-[#18181B] text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Stickers Drawer */}
          {isStickerDrawerOpen && (
            <div className="p-4 rounded-xl bg-white border-2 border-[#18181B] space-y-2 shadow-[3px_3px_0px_#18181B]">
              <span className="text-[10px] font-['Silkscreen'] uppercase tracking-wider text-[#18181B]/60 block">
                TAP TO ATTACH RETRO STICKERS:
              </span>
              <div className="flex flex-wrap gap-2">
                {availableStickers.map((sticker) => {
                  const isAttached = selectedStickers.some((s) => s.id === sticker.id);
                  return (
                    <button
                      type="button"
                      key={sticker.id}
                      onClick={() => toggleSticker(sticker)}
                      className={`px-3 py-1.5 rounded border-2 border-[#18181B] text-xs font-['Silkscreen'] transition flex items-center gap-1.5 cursor-pointer ${
                        isAttached
                          ? "bg-[#55EFC4] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                          : "bg-[#FAF8F5] text-[#18181B] hover:bg-white"
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
