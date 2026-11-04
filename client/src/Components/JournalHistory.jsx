import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Search,
  Calendar,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lock,
  Sparkles,
  Copy,
} from "lucide-react";
import { MOOD_OPTIONS, AVAILABLE_TAGS } from "./JournalCreator";
import { sounds } from "../utils/soundEffects";

const JournalHistory = ({ refreshKey, onEntryUpdated }) => {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("");
  const [selectedTagFilter, setSelectedTagFilter] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchEntries = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search.trim()) params.search = search.trim();
      if (selectedMoodFilter) params.mood = selectedMoodFilter;
      if (selectedTagFilter) params.tag = selectedTagFilter;

      const res = await api.get("/api/journal", { params });
      if (res.data?.entries) {
        setEntries(res.data.entries);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.warn("Could not fetch journal entries:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries(1);
  }, [refreshKey, selectedMoodFilter, selectedTagFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    sounds.playClick();
    fetchEntries(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this journal entry?")) {
      return;
    }

    sounds.playPop();
    setIsDeletingId(id);
    try {
      await api.delete(`/api/journal/${id}`);
      sounds.playSuccess();
      toast.success("Entry removed from sanctuary.");
      fetchEntries(pagination.page);
      if (onEntryUpdated) onEntryUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete entry");
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleUpdateSave = async (e) => {
    e.preventDefault();
    if (!editingEntry) return;

    sounds.playClick();
    try {
      await api.put(`/api/journal/${editingEntry.id}`, {
        mood: editingEntry.mood,
        content: editingEntry.content,
        entryDate: editingEntry.entry_date,
        tags: editingEntry.tags,
        isPrivate: editingEntry.is_private,
      });

      sounds.playSuccess();
      toast.success("Entry updated successfully!");
      setEditingEntry(null);
      fetchEntries(pagination.page);
      if (onEntryUpdated) onEntryUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update entry");
    }
  };

  const copyAsMarkdown = (entry) => {
    sounds.playSuccess();
    const md = `---
date: ${entry.entry_date}
mood: ${entry.mood}
tags: [${(entry.tags || []).join(", ")}]
source: Calm Me Developer Sanctuary
---

# Dev Reflection · ${entry.entry_date} (${entry.mood})

${entry.content || ""}
`;
    navigator.clipboard.writeText(md);
    toast.success("Copied as Obsidian / Notion Markdown! 📋");
  };

  return (
    <div id="history" className="w-full scroll-mt-24 space-y-6 select-none">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] font-mono text-xs font-bold shadow-[2px_2px_0px_#64DC4C] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>[ ARCHIVE // REFLECTIONS TIMELINE ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0a1b10] tracking-tight font-display">
            Your Dev Journal Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5">
            Search, filter by emotional vibe, and revisit previous engineering reflections.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or tags..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border-2 border-[#0a1b10] rounded-xl text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-500 focus:outline-none shadow-[2px_2px_0px_#0a1b10] focus:shadow-[3px_3px_0px_#0a1b10] transition-all"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSearch("");
                fetchEntries(1);
              }}
              className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setSelectedMoodFilter("");
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-black whitespace-nowrap transition-all cursor-pointer border-2 border-[#0a1b10] ${
            selectedMoodFilter === ""
              ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C]"
              : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
          }`}
        >
          ALL MOODS
        </button>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMoodFilter === mood.name;
          const copyAsMarkdown = (entry) => {
    sounds.playSuccess();
    const md = `---
date: ${entry.entry_date}
mood: ${entry.mood}
tags: [${(entry.tags || []).join(", ")}]
source: Calm Me Developer Sanctuary
---

# Dev Reflection · ${entry.entry_date} (${entry.mood})

${entry.content || ""}
`;
    navigator.clipboard.writeText(md);
    toast.success("Copied as Obsidian / Notion Markdown! 📋");
  };

  return (
            <button
              key={mood.name}
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedMoodFilter(isSelected ? "" : mood.name);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-2 border-[#0a1b10] ${
                isSelected
                  ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C] font-black"
                  : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tag Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[11px] font-mono font-black text-[#0a1b10] uppercase tracking-wider mr-1">TAGS:</span>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setSelectedTagFilter("");
          }}
          className={`px-3 py-1 rounded-lg text-[11px] font-mono font-black whitespace-nowrap transition border-2 border-[#0a1b10] cursor-pointer ${
            selectedTagFilter === ""
              ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C]"
              : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
          }`}
        >
          ALL
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedTagFilter(selectedTagFilter === tag ? "" : tag);
            }}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition border-2 border-[#0a1b10] cursor-pointer ${
              selectedTagFilter === tag
                ? "bg-[#90D786] text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] font-black"
                : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Entries List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 bg-white/60 rounded-2xl border-2 border-[#0a1b10]/20 shadow-[3px_3px_0px_#0a1b10]/20 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-[#FCFAF4] rounded-2xl p-10 text-center border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10]">
          <span className="text-4xl block mb-2">📜</span>
          <h3 className="text-base font-black text-[#0a1b10] font-display">
            No Journal Entries Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 font-bold max-w-sm mx-auto mt-1 mb-4">
            {search || selectedMoodFilter || selectedTagFilter
              ? "Try adjusting search query or active filter tags."
              : "Express how you feel above to populate your sanctuary timeline!"}
          </p>
          {(search || selectedMoodFilter || selectedTagFilter) && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSearch("");
                setSelectedMoodFilter("");
                setSelectedTagFilter("");
              }}
              className="px-5 py-2 rounded-xl border-2 border-[#0a1b10] bg-white text-xs font-black text-[#0a1b10] hover:bg-[#90D786] cursor-pointer shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map((entry) => {
            const moodObj =
              MOOD_OPTIONS.find((m) => m.name === entry.mood) || MOOD_OPTIONS[0];

            return (
              <div
                key={entry.id}
                className="bg-[#FCFAF4] rounded-2xl p-6 border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] hover:shadow-[4px_4px_0px_#0a1b10] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Date, Mood Badge, & Privacy */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b-2 border-[#0a1b10]/15">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{entry.entry_date}</span>
                      {entry.is_private && (
                        <span className="flex items-center gap-0.5 text-[10px] font-mono font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded-md border border-[#0a1b10]">
                          <Lock className="w-3 h-3 text-rose-700" /> PRIVATE
                        </span>
                      )}
                    </div>

                    <div
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border-2 border-[#0a1b10] bg-white shadow-[1px_1px_0px_#0a1b10]"
                    >
                      <span>{moodObj.emoji}</span>
                      <span className="text-[#0a1b10]">{entry.mood}</span>
                    </div>
                  </div>

                  {/* Content text */}
                  {entry.content && (
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap mb-4 font-bold">
                      {entry.content}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {entry.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-mono font-bold text-[#0a1b10] bg-white border border-[#0a1b10] px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#0a1b10]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Attached Stickers */}
                  {entry.stickers?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {entry.stickers.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-lg bg-white border-2 border-[#0a1b10] shadow-[1px_1px_0px_#0a1b10] px-2 py-1 rounded-xl"
                          title={s.name}
                        >
                          {s.emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Attached Photos */}
                  {entry.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {entry.images.map((img, idx) => (
                        <a
                          key={idx}
                          href={img.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block w-16 h-16 rounded-xl border-2 border-[#0a1b10] overflow-hidden hover:opacity-90 transition shadow-[2px_2px_0px_#0a1b10]"
                        >
                          <img
                            src={img.image_url}
                            alt="Attachment"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions (Copy / Edit / Delete) */}
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t-2 border-[#0a1b10]/15">
                  <button
                    type="button"
                    onClick={() => copyAsMarkdown(entry)}
                    className="p-2 text-slate-400 hover:text-emerald-700 rounded-full hover:bg-emerald-50 transition cursor-pointer"
                    title="Copy formatted Markdown (Obsidian / Notion)"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setEditingEntry(entry);
                    }}
                    className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition cursor-pointer"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={isDeletingId === entry.id}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition cursor-pointer disabled:opacity-50"
                    title="Delete entry"
                  >
                    {isDeletingId === entry.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => {
              sounds.playClick();
              fetchEntries(pagination.page - 1);
            }}
            className="p-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-slate-800 hover:bg-[#90D786] cursor-pointer disabled:opacity-40 shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-800">
            [ PAGE {pagination.page} OF {pagination.totalPages} ]
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              sounds.playClick();
              fetchEntries(pagination.page + 1);
            }}
            className="p-2.5 rounded-xl border-2 border-[#0a1b10] bg-white text-slate-800 hover:bg-[#90D786] cursor-pointer disabled:opacity-40 shadow-[2px_2px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FCFAF4] max-w-lg w-full p-6 sm:p-7 rounded-2xl border-2 border-[#0a1b10] shadow-[5px_5px_0px_0px_#0a1b10]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#0a1b10]/20">
              <h3 className="text-lg font-black text-[#0a1b10] font-display">
                Edit Dev Journal Entry
              </h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1 border border-[#0a1b10] bg-white text-slate-700 hover:text-black rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-black text-[#0a1b10] block mb-1">
                  DOMINANT MOOD
                </label>
                <select
                  value={editingEntry.mood}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, mood: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] text-xs sm:text-sm font-bold bg-white focus:outline-none cursor-pointer"
                >
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.emoji} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-mono font-black text-[#0a1b10] block mb-1">
                  REFLECTION CONTENT
                </label>
                <textarea
                  rows={4}
                  value={editingEntry.content || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, content: e.target.value })
                  }
                  className="w-full p-3.5 rounded-xl border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] text-xs sm:text-sm font-bold bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 rounded-xl border-2 border-[#0a1b10] bg-white text-xs font-mono font-black text-slate-700 hover:bg-slate-100 shadow-[2px_2px_0px_#0a1b10] cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl border-2 border-[#0a1b10] bg-[#0a1b10] text-[#64DC4C] text-xs font-mono font-black hover:bg-black shadow-[2px_2px_0px_#64DC4C] cursor-pointer"
                >
                  SAVE CHANGES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalHistory;
