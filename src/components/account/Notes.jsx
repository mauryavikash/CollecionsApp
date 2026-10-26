"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, NotebookPen, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { addNote, deleteNote, getNotes, updateNote } from "@/app/lib/api";

function readUserName() {
  try {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    return user?.name || user?.username || "";
  } catch {
    return "";
  }
}

function formatStamp(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function initials(name = "") {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?";
}

export default function Notes({ customerId, customerName }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(
    () =>
      getNotes(customerId)
        .then((response) => {
          const list = response?.notes ?? response?.data?.notes ?? [];
          setNotes([...list].sort((a, b) => String(b.updated_at ?? b.created_at).localeCompare(String(a.updated_at ?? a.created_at))));
          setError(null);
        })
        .catch((err) => {
          console.error("Notes API Error:", err);
          setError(err);
        })
        .finally(() => setLoading(false)),
    [customerId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setSaving(true);
    try {
      await addNote({ customer_id: String(customerId), customer_name: customerName, text, author: readUserName() || "Collector" });
      setDraft("");
      toast.success("Note added");
      await load();
    } catch (err) {
      console.error("Add note failed:", err);
      toast.error("Unable to add note");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (note) => {
    const text = editText.trim();
    if (!text || text === note.text) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      await updateNote(note.note_id, { text });
      setEditingId(null);
      toast.success("Note updated");
      await load();
    } catch (err) {
      console.error("Update note failed:", err);
      toast.error("Unable to update note");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (note) => {
    setSaving(true);
    try {
      await deleteNote(note.note_id);
      setConfirmId(null);
      toast.success("Note deleted");
      await load();
    } catch (err) {
      console.error("Delete note failed:", err);
      toast.error("Unable to delete note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
            <NotebookPen className="h-4 w-4 text-blue-600" aria-hidden="true" />
          </span>
          Notes
          <span className="rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-600">{notes.length}</span>
        </h2>
      </div>

      <form onSubmit={submit} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start">
        <label htmlFor="new-note" className="sr-only">New note</label>
        <textarea
          id="new-note"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={2}
          placeholder="Add a note about this account…"
          className="min-h-[44px] flex-1 resize-y rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={saving || !draft.trim()}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add Note
        </button>
      </form>

      {loading ? (
        <p className="py-6 text-center text-xs text-slate-500">Loading notes…</p>
      ) : error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">Unable to load notes for this account.</p>
      ) : notes.length === 0 ? (
        <p className="py-6 text-center text-xs text-slate-500">No notes yet for this account.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => {
            const editing = editingId === note.note_id;
            const edited = note.updated_at && note.updated_at !== note.created_at;
            return (
              <li key={note.note_id} className="group rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:border-blue-100 hover:bg-blue-50/40">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                    {initials(note.author)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{note.author || "Unknown"}</span>
                      <span>{formatStamp(note.created_at)}</span>
                      {edited && <span className="italic">(edited {formatStamp(note.updated_at)})</span>}
                    </div>
                    {editing ? (
                      <div className="mt-1.5 flex flex-col gap-2">
                        <textarea
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          rows={2}
                          autoFocus
                          aria-label="Edit note"
                          className="w-full resize-y rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-blue-500"
                        />
                        <div className="flex gap-2">
                          <button type="button" disabled={saving} onClick={() => saveEdit(note)} className="inline-flex h-7 items-center gap-1 rounded-md bg-blue-600 px-3 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                            <Check className="h-3.5 w-3.5" /> Save
                          </button>
                          <button type="button" onClick={() => setEditingId(null)} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-3 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-slate-700">{note.text}</p>
                    )}
                    {confirmId === note.note_id && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-red-600">
                        Delete this note?
                        <button type="button" disabled={saving} onClick={() => remove(note)} className="rounded-md bg-red-600 px-2.5 py-1 font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                          Delete
                        </button>
                        <button type="button" onClick={() => setConfirmId(null)} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  {!editing && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        title="Edit note"
                        aria-label="Edit note"
                        onClick={() => {
                          setEditingId(note.note_id);
                          setEditText(note.text ?? "");
                          setConfirmId(null);
                        }}
                        className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete note"
                        aria-label="Delete note"
                        onClick={() => setConfirmId(note.note_id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-slate-200 bg-white text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
