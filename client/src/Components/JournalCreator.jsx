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
} from "lucide-react";

export const MOOD_OPTIONS = [
  {
    name: "Happy",
    emoji: "😄",
    color: "from-emerald-400 to-teal-500",
    border: "border-emerald-500",
    bg: "bg-emerald-50 text-emerald-800",
    desc: "Good vibes & joy",
  },
  {
    name: "Calm",
    emoji: "😌",
    color: "from-teal-400 to-cyan-500",
    border: "border-cyan-500",
    bg: "bg-cyan-50 text-cyan-800",
    desc: "Peaceful & centered",
  },
  {
    name: "Excited",
    emoji: "🤩",
    color: "from-amber-400 to-orange-500",
    border: "border-amber-500",
    bg: "bg-amber-50 text-amber-800",
    desc: "Energized & thrilled",
  },
  {
    name: "Neutral",
    emoji: "😐",
    color: "from-slate-400 to-gray-500",
    border: "border-slate-500",
    bg: "bg-slate-100 text-slate-800",
    desc: "Balanced & steady",
  },
  {
    name: "Anxious",
    emoji: "😰",
    color: "from-purple-400 to-indigo-500",
    border: "border-purple-500",
    bg: "bg-purple-50 text-purple-800",
    desc: "Stressed or uneasy",
  },
  {
    name: "Sad",
    emoji: "😔",
    color: "from-blue-400 to-sky-600",
    border: "border-blue-500",
    bg: "bg-blue-50 text-blue-800",
    desc: "Heavy or down",
  },
  {
    name: "Angry",
    emoji: "😡",
    color: "from-rose-500 to-red-600",
    border: "border-rose-500",
    bg: "bg-rose-50 text-rose-800",
    desc: "Frustrated & tense",
  },
  {
    name: "Tired",
    emoji: "😴",
    color: "from-indigo-400 to-slate-600",
    border: "border-indigo-400",
    bg: "bg-indigo-50 text-indigo-800",
    desc: "Low energy & sleepy",
  },
];

const JournalCreator = ({ onEntryCreated }) => {
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [content, setContent] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [availableStickers, setAvailableStickers] = useState([]);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [images, setImages] = useState([]);
  const [isStickerDrawerOpen, setIsStickerDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  const toggleSticker = (sticker) => {
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
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      toast.error("Please choose how you feel!");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/journal", {
        mood: selectedMood,
        content: content.trim(),
        entryDate,
        stickers: selectedStickers.map((s) => s.id),
        imageUrls: images,
      });

      toast.success("Journal entry saved successfully! ✨");
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

  const currentMoodObj =
    MOOD_OPTIONS.find((m) => m.name === selectedMood) || MOOD_OPTIONS[0];

  return (
    <div
      id="tracker"
      className="w-full max-w-4xl mx-auto my-12 px-4 sm:px-6 scroll-mt-24"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-2xl shadow-indigo-100/60 p-6 sm:p-10 transition-all duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Daily Reflection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              How are you feeling right now?
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select your mood and write down today's memories & thoughts.
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-slate-700 text-sm font-medium shadow-inner">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="bg-transparent border-none text-slate-800 focus:outline-none text-xs sm:text-sm font-medium cursor-pointer"
            />
          </div>
        </div>

        {/* Mood Selector Grid */}
        <div className="py-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Choose Your Vibe
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMood === mood.name;
              return (
                <button
                  key={mood.name}
                  type="button"
                  onClick={() => setSelectedMood(mood.name)}
                  className={`group relative flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? `${mood.border} ${mood.bg} shadow-md scale-[1.02]`
                      : "border-slate-100 bg-slate-50/70 hover:bg-slate-100/90 text-slate-700 hover:border-slate-200"
                  }`}
                >
                  <span className="text-3xl sm:text-4xl transition-transform duration-200 group-hover:scale-115 mb-1.5">
                    {mood.emoji}
                  </span>
                  <span className="text-sm font-bold">{mood.name}</span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600 line-clamp-1">
                    {mood.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Text Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Your Journal Note
            </label>
            <div className="relative rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200/50 bg-slate-50/50 transition">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder={`What made you feel ${currentMoodObj.name.toLowerCase()} today? Express your thoughts, reflections, or moments of gratitude...`}
                className="w-full p-4 sm:p-5 bg-transparent resize-y rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none text-sm sm:text-base leading-relaxed"
              />
            </div>
          </div>

          {/* Stickers Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Decorate with Stickers
              </label>
              <button
                type="button"
                onClick={() => setIsStickerDrawerOpen(!isStickerDrawerOpen)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
              >
                {isStickerDrawerOpen ? "Close Stickers" : "Browse Stickers"}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    isStickerDrawerOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Selected stickers badges */}
            {selectedStickers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedStickers.map((sticker) => (
                  <span
                    key={sticker.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 shadow-sm"
                  >
                    <span>{sticker.emoji}</span>
                    <span>{sticker.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleSticker(sticker)}
                      className="text-amber-600 hover:text-amber-900 transition ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Stickers drawer picker */}
            {isStickerDrawerOpen && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap gap-2.5 animate-in fade-in duration-150">
                {availableStickers.map((sticker) => {
                  const isAttached = selectedStickers.some(
                    (s) => s.id === sticker.id
                  );
                  return (
                    <button
                      key={sticker.id}
                      type="button"
                      onClick={() => toggleSticker(sticker)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isAttached
                          ? "bg-indigo-600 text-white shadow"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span className="text-base">{sticker.emoji}</span>
                      <span>{sticker.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Image Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                Capture Moments & Photos
              </label>
              <label className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer">
                <span>+ Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview thumbnails */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-md"
                  >
                    <img
                      src={url}
                      alt="Moment preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-rose-600 transition cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {isUploadingImage && (
              <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium mt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading photo memory...</span>
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white bg-slate-900 hover:bg-indigo-600 shadow-xl shadow-slate-900/10 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Entry...
                </>
              ) : (
                <>
                  <span>Save Journal Entry</span>
                  <Smile className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalCreator;
