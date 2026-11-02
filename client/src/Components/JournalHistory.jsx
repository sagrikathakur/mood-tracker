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
    <div id="history" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 scroll-mt-24 space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-['Silkscreen'] text-[#0984E3] uppercase block mb-1">
            ARCHIVED THOUGHTS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
            Your Journal Timeline
          </h2>
          <p className="text-xs sm:text-sm text-[#18181B]/70 mt-0.5">
            Search, filter by emotional vibe, and revisit previous entries.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or tags..."
            className="w-full pl-9 pr-8 py-2 bg-white border-2 border-[#18181B] rounded-lg text-xs sm:text-sm text-[#18181B] placeholder-[#18181B]/40 focus:outline-none shadow-[2px_2px_0px_#18181B]"
          />
          <Search className="w-4 h-4 text-[#18181B]/40 absolute left-3 top-2.5 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => {
                sounds.playPop();
                setSearch("");
                fetchEntries(1);
              }}
              className="absolute right-2.5 top-2.5 text-[#18181B]/50 hover:text-[#18181B] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setSelectedMoodFilter("");
          }}
          className={`px-3 py-1 rounded text-xs font-['Silkscreen'] whitespace-nowrap transition cursor-pointer border-2 border-[#18181B] ${
            selectedMoodFilter === ""
              ? "bg-[#18181B] text-white shadow-[2px_2px_0px_#18181B]"
              : "bg-white text-[#18181B] hover:bg-[#FAF8F5]"
          }`}
        >
          ALL MOODS
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
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-['Silkscreen'] whitespace-nowrap transition cursor-pointer border-2 border-[#18181B] ${
                isSelected
                  ? `${mood.color} shadow-[2px_2px_0px_#18181B]`
                  : "bg-white text-[#18181B] hover:bg-[#FAF8F5]"
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tag Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 uppercase mr-1">TAGS:</span>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setSelectedTagFilter("");
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-['Silkscreen'] whitespace-nowrap transition border border-[#18181B] cursor-pointer ${
            selectedTagFilter === ""
              ? "bg-[#0984E3] text-white"
              : "bg-white text-[#18181B] hover:bg-[#FAF8F5]"
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
            className={`px-2 py-0.5 rounded text-[10px] font-['Silkscreen'] whitespace-nowrap transition border border-[#18181B] cursor-pointer ${
              selectedTagFilter === tag
                ? "bg-[#FFEAA7] text-[#18181B] font-bold"
                : "bg-white text-[#18181B] hover:bg-[#FAF8F5]"
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
            <div key={i} className="h-44 bg-white border-2 border-[#18181B] rounded-xl shadow-[3px_3px_0px_#18181B] animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="pixel-card p-10 text-center bg-[#FAF8F5]">
          <span className="text-4xl block mb-2">📜</span>
          <h3 className="text-base font-black font-['Bricolage_Grotesque'] text-[#18181B]">
            No Journal Entries Found
          </h3>
          <p className="text-xs text-[#18181B]/60 max-w-sm mx-auto mt-1 mb-4">
            {search || selectedMoodFilter || selectedTagFilter
              ? "Try adjusting search query or active tags."
              : "Express how you feel above to populate your timeline!"}
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
              className="pixel-btn px-3 py-1 text-[11px] font-['Silkscreen'] cursor-pointer"
            >
              RESET FILTERS
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
                className="pixel-card p-5 bg-white flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Date, Mood Badge, & Privacy */}
                  <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#18181B]/10">
                    <div className="flex items-center gap-2 text-xs font-['Silkscreen'] text-[#18181B]/60">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{entry.entry_date}</span>
                      {entry.is_private && (
                        <span className="flex items-center gap-0.5 text-[9px] text-[#18181B] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#18181B]/20">
                          <Lock className="w-3 h-3" /> PRIVATE
                        </span>
                      )}
                    </div>

                    <div
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-['Silkscreen'] border border-[#18181B] ${moodObj.color}`}
                    >
                      <span>{moodObj.emoji}</span>
                      <span>{entry.mood}</span>
                    </div>
                  </div>

                  {/* Content text */}
                  {entry.content && (
                    <p className="text-xs sm:text-sm text-[#18181B] leading-relaxed whitespace-pre-wrap mb-3 font-normal">
                      {entry.content}
                    </p>
                  )}

                  {/* Tags */}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {entry.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-['Silkscreen'] text-[#18181B] bg-[#FFEAA7] border border-[#18181B] px-1.5 py-0.5 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Attached Stickers */}
                  {entry.stickers?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2.5">
                      {entry.stickers.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-base bg-[#FAF8F5] border border-[#18181B] p-1 rounded"
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
                          className="block w-14 h-14 rounded border-2 border-[#18181B] overflow-hidden hover:opacity-90 transition shadow-[1.5px_1.5px_0px_#18181B]"
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
                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-[#18181B]/10">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setEditingEntry(entry);
                    }}
                    className="p-1.5 text-[#18181B]/60 hover:text-[#0984E3] rounded transition cursor-pointer"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    disabled={isDeletingId === entry.id}
                    className="p-1.5 text-[#18181B]/60 hover:text-[#D63031] rounded transition cursor-pointer disabled:opacity-50"
                    title="Delete entry"
                  >
                    {isDeletingId === entry.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#D63031]" />
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
            className="pixel-btn p-2 cursor-pointer disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-['Silkscreen'] text-[#18181B]">
            PAGE {pagination.page} OF {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => {
              sounds.playClick();
              fetchEntries(pagination.page + 1);
            }}
            className="pixel-btn p-2 cursor-pointer disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/70 backdrop-blur-xs">
          <div className="pixel-card bg-[#FAF8F5] max-w-lg w-full p-6 sm:p-7 shadow-[6px_6px_0px_#18181B]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#18181B]/15">
              <h3 className="text-lg font-black font-['Bricolage_Grotesque'] text-[#18181B]">
                Edit Journal Entry
              </h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="p-1 text-[#18181B]/60 hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} className="space-y-4">
              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  MOOD
                </label>
                <select
                  value={editingEntry.mood}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, mood: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                >
                  {MOOD_OPTIONS.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.emoji} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  CONTENT
                </label>
                <textarea
                  rows={4}
                  value={editingEntry.content || ""}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, content: e.target.value })
                  }
                  className="w-full p-3 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="pixel-btn px-4 py-2 text-xs font-black uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="pixel-btn pixel-btn-green px-5 py-2 text-xs font-black uppercase cursor-pointer"
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
