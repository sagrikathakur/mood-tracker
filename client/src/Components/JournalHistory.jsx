import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  Calendar,
  Trash2,
  Edit3,
  X,
  ChevronLeft,
  ChevronRight,
  Smile,
  Tag,
  Loader2,
  Check,
} from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";

const JournalHistory = ({ refreshKey, onEntryUpdated }) => {
  const [entries, setEntries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMoodFilter, setSelectedMoodFilter] = useState("");
  const [editingEntry, setEditingEntry] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchEntries = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (search.trim()) params.search = search.trim();
      if (selectedMoodFilter) params.mood = selectedMoodFilter;

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
  }, [refreshKey, selectedMoodFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEntries(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this journal entry?")) {
      return;
    }

    setIsDeletingId(id);
    try {
      await api.delete(`/api/journal/${id}`);
      toast.success("Entry deleted");
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

    try {
      await api.put(`/api/journal/${editingEntry.id}`, {
        mood: editingEntry.mood,
        content: editingEntry.content,
        entryDate: editingEntry.entry_date,
      });

      toast.success("Entry updated successfully!");
      setEditingEntry(null);
      fetchEntries(pagination.page);
      if (onEntryUpdated) onEntryUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update entry");
    }
  };

  return (
    <div id="history" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-12 scroll-mt-24">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Journal Timeline
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse, search and reflect on past days and feelings.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords or mood..."
            className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchEntries(1);
              }}
              className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Mood Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        <button
          type="button"
          onClick={() => setSelectedMoodFilter("")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
            selectedMoodFilter === ""
              ? "bg-slate-900 text-white shadow-md"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
              onClick={() => setSelectedMoodFilter(isSelected ? "" : mood.name)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                isSelected
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.name}</span>
            </button>
          );
        })}
      </div>

      {/* Entries List or Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-slate-200/60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white/80 rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <span className="text-5xl block mb-3">🌿</span>
          <h3 className="text-lg font-bold text-slate-800">No Journal Entries Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {search || selectedMoodFilter
              ? "Try adjusting your search terms or mood filters."
              : "Start recording your day above to look back on how you felt!"}
          </p>
          {(search || selectedMoodFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedMoodFilter("");
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {entries.map((entry) => {
            const moodObj =
              MOOD_OPTIONS.find((m) => m.name === entry.mood) || MOOD_OPTIONS[0];

            return (
              <div
                key={entry.id}
                className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-xl shadow-slate-100 flex flex-col justify-between transition hover:shadow-2xl hover:border-slate-300"
              >
                <div>
                  {/* Top Bar: Date & Mood Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{entry.entry_date}</span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${moodObj.bg} border ${moodObj.border}/40 shadow-sm`}
                    >
                      <span>{moodObj.emoji}</span>
                      <span>{entry.mood}</span>
                    </div>
                  </div>

                  {/* Content text */}
                  {entry.content && (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-4 font-normal">
                      {entry.content}
                    </p>
                  )}

                  {/* Attached Stickers */}
                  {entry.stickers?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {entry.stickers.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-lg bg-slate-50 border border-slate-200/80 p-1 rounded-xl shadow-2xs"
                          title={s.name}
                        >
                          {s.emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Attached Photos */}
                  {entry.images?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.images.map((img, idx) => (
                        <a
                          key={idx}
                          href={img.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm block hover:scale-105 transition"
                        >
                          <img
                            src={img.image_url}
                            alt="Attached memory"
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(entry)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingId === entry.id}
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Delete Note"
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
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => fetchEntries(pagination.page - 1)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => fetchEntries(pagination.page + 1)}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Edit Journal Entry
              </h3>
              <button
                type="button"
                onClick={() => setEditingEntry(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSave} className="space-y-4">
              {/* Mood Select */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                  Mood
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_OPTIONS.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() =>
                        setEditingEntry({ ...editingEntry, mood: m.name })
                      }
                      className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                        editingEntry.mood === m.name
                          ? `${m.bg} ${m.border} shadow-sm`
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Journal Content
                </label>
                <textarea
                  value={editingEntry.content}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, content: e.target.value })
                  }
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-indigo-600 shadow-md cursor-pointer"
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
