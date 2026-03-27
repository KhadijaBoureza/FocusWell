import { useState } from "react";
import { Plus, Trash2, Edit3, X, Save } from "lucide-react";
import { Note } from "@/types/dashboard";

// ❌ OLD (Phase 1 - localStorage)

// import { mockNotes } from "@/data/mockData";
// import { useLocalStorage } from "@/hooks/useLocalStorage";

import { useEffect } from "react";

const colorMap: Record<string, string> = {
  violet: "border-l-purple-500",
  blue: "border-l-blue-500",
  cyan: "border-l-cyan-500",
};

function NotesWidget() {
  // const [notes, setNotes] = useLocalStorage<Note[]>("dashboard-notes", mockNotes);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const colors = ["violet", "blue", "cyan"];
  const [selectedColor, setSelectedColor] = useState("violet");

  useEffect(() => {
    fetch("http://localhost:5000/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error(err));
  }, []);

  // ❌ OLD addNote (local version) 
  // function addNote() {
  //   if (!title.trim()) return;

  //   const note: Note = {
  //     id: Date.now().toString(),
  //     title,
  //     content,
  //     color: selectedColor,
  //     createdAt: new Date().toISOString().split("T")[0],
  //   };

  //   async function addNote() {
  //   if (!title.trim()) return;

  //   const res = await fetch("http://localhost:5000/notes", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       title,
  //       content,
  //       color: selectedColor,
  //     }),
  //   });

  //   const newNote = await res.json();

  //   setNotes([newNote, ...notes]);
  //   setTitle("");
  //   setContent("");
  //   setIsAdding(false);
  // }

  //     setNotes([note, ...notes]);
  //     setTitle("");
  //     setContent("");
  //     setIsAdding(false);
  //   }

  // function deleteNote(id: string) {
  //   setNotes(notes.filter((n) => n.id !== id));
  // }


  // ✅ NEW addNote → sends to backend

  async function addNote() {
    if (!title.trim()) return;

    const res = await fetch("http://localhost:5000/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        color: selectedColor,
      }),
    });

    const newNote = await res.json();

    setNotes((prev) => [newNote, ...prev]);

    setTitle("");
    setContent("");
    setIsAdding(false);
  }

  async function deleteNote(id: string) {
    const res = await fetch(`http://localhost:5000/notes/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  }

  async function saveEdit(id: string) {
  const res = await fetch(`http://localhost:5000/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });

  if (res.ok) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title, content } : n))
    );

    setEditingId(null);
  }
}

  function startEdit(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Notes</h2>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setTitle("");
            setContent("");
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Add note */}
      {isAdding && (
        <div className="mb-4 space-y-2 p-3 bg-muted/40 rounded-lg">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            rows={3}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition ${c === "violet"
                      ? "bg-purple-500"
                      : c === "blue"
                        ? "bg-blue-500"
                        : "bg-cyan-500"
                    } ${selectedColor === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                    }`}
                />
              ))}
            </div>

            <button
              onClick={addNote}
              className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`border-l-2 ${colorMap[note.color] || "border-l-purple-500"
              } bg-muted/20 rounded-r-md p-3 group`}
          >
            {editingId === note.id ? (
              <div className="space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={2}
                  className="w-full border border-border rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />

                <button
                  onClick={() => saveEdit(note.id)}
                  className="p-1 text-green-600 hover:text-green-500"
                >
                  <Save size={14} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold">{note.title}</h4>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 size={12} />
                    </button>

                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 text-destructive hover:text-destructive/80"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {note.content}
                </p>

                <span className="text-[10px] text-muted-foreground/60 mt-1 block">
                  {note.createdAt}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NotesWidget;