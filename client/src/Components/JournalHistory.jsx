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

  return (
    <div id="history" className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8 scroll-mt-24 space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/60 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reflections Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Your Dev Journal Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
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
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSearch("");
                fetchEntries(1);
              }}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
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
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
            selectedMoodFilter === ""
              ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All Moods
        </button>
        {MOOD_OPTIONS.map((mood) => {
          const isSelected = selectedMoodFilter === mood.name;
          return (
            <button
              key={mood.name}
              type="button"
              onClick={() => {
                sounds.playClick();
                setSelectedMoodFilter(isSelected ? "" : mood.name);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border ${
                isSelected
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tags:</span>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setSelectedTagFilter("");
          }}
          className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition border cursor-pointer ${
            selectedTagFilter === ""
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => {
              sounds.playClick();
              setSelectedTagFilter(selectedTagFilter === tag ? "" : tag);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition border cursor-pointer ${
              selectedTagFilter === tag
                ? "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
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
            <div key={i} className="h-44 bg-slate-100 rounded-3xl border border-slate-200/60 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 shadow-sm">
          <span className="text-4xl block mb-2">📜</span>
          <h3 className="text-base font-bold text-slate-900 font-display">
            No Journal Entries Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
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
              className="px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
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
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Date, Mood Badge, & Privacy */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{entry.entry_date}</span>
                      {entry.is_private && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      )}
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${moodObj.color}`}
                    >
                      <span>{moodObj.emoji}</span>
                      <span>{entry.mood}</span>
                    </div>
                  </div>

                  {/* Content text */}
                  {entry.content && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4 font-normal">
                      {entry.content}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {entry.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
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
                          className="text-lg bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-xl"
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
                          className="block w-16 h-16 rounded-2xl border border-slate-200 overflow-hidden hover:opacity-90 transition shadow-2xs"
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

                {/* Footer Actions (Edit / Delete) */}
                <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100">
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
            className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-40 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              sounds.playClick();
              fetchEntries(pagination.page + 1);
            }}
            className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-40 shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Edit Dev Journal Entry
              </h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mood
                </label>
                <select
                  value={editingEntry.mood}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, mood: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none cursor-pointer"
                >
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.emoji} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Content
                </label>
                <textarea
                  rows={4}
                  value={editingEntry.content || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, content: e.target.value })
                  }
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Save Changes
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
