import { useState } from "react";
import { Brain, Plus, X, Trash2, Tag, Lightbulb, AlertCircle, Heart } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Thought {
  id: string;
  content: string;
  category: "idea" | "worry" | "gratitude" | "reflection";
  createdAt: string;
}

const categoryConfig = {
  idea: {
    icon: Lightbulb,
    label: "Idea",
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  worry: {
    icon: AlertCircle,
    label: "Worry",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  gratitude: {
    icon: Heart,
    label: "Grateful",
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/20",
  },
  reflection: {
    icon: Brain,
    label: "Reflection",
    color: "text-purple-500",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
};

const defaultThoughts: Thought[] = [
  {
    id: "1",
    content: "I should take more breaks between deep work sessions to maintain quality focus.",
    category: "reflection",
    createdAt: "2026-02-17T10:00:00",
  },
  {
    id: "2",
    content: "What if I batched all meetings into Tuesday/Thursday and kept MWF for deep work?",
    category: "idea",
    createdAt: "2026-02-17T09:00:00",
  },
  {
    id: "3",
    content: "Grateful for the quiet mornings that let me think clearly.",
    category: "gratitude",
    createdAt: "2026-02-16T08:00:00",
  },
  {
    id: "4",
    content: "Feeling overwhelmed by the backlog — need to prioritise ruthlessly.",
    category: "worry",
    createdAt: "2026-02-16T14:00:00",
  },
];

function ThoughtOrganizer() {
  const [thoughts, setThoughts] = useLocalStorage<Thought[]>(
    "focuswell-thoughts",
    defaultThoughts
  );

  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Thought["category"]>("reflection");
  const [filter, setFilter] = useState<Thought["category"] | "all">("all");

  function addThought() {
    if (!content.trim()) return;

    setThoughts([
      {
        id: Date.now().toString(),
        content,
        category,
        createdAt: new Date().toISOString(),
      },
      ...thoughts,
    ]);

    setContent("");
    setIsAdding(false);
  }

  function deleteThought(id: string) {
    setThoughts(thoughts.filter((t) => t.id !== id));
  }

  const filtered =
    filter === "all"
      ? thoughts
      : thoughts.filter((t) => t.category === filter);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Thought Space</h2>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-md text-xs transition ${
            filter === "all"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>

        {(Object.keys(categoryConfig) as Thought["category"][]).map((cat) => {
          const cfg = categoryConfig[cat];

          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1 transition ${
                filter === cat
                  ? `${cfg.bg} ${cfg.color}`
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <cfg.icon size={12} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Add Thought */}
      {isAdding && (
        <div className="mb-4 p-3 bg-muted/40 rounded-lg space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            autoFocus
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {(Object.keys(categoryConfig) as Thought["category"][]).map(
                (cat) => {
                  const cfg = categoryConfig[cat];

                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-1.5 rounded-md transition ${
                        category === cat
                          ? `${cfg.bg} ${cfg.color}`
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title={cfg.label}
                    >
                      <cfg.icon size={14} />
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={addThought}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs hover:opacity-90 transition"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Thoughts List */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
        {filtered.map((thought) => {
          const cfg = categoryConfig[thought.category];

          return (
            <div
              key={thought.id}
              className={`p-3 rounded-lg border ${cfg.bg} group`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <cfg.icon
                    size={14}
                    className={`${cfg.color} mt-0.5 shrink-0`}
                  />

                  <p className="text-sm text-foreground leading-relaxed">
                    {thought.content}
                  </p>
                </div>

                <button
                  onClick={() => deleteThought(thought.id)}
                  className="p-1 text-destructive opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2 ml-6">
                <Tag size={10} className="text-muted-foreground" />

                <span className={`text-[10px] ${cfg.color}`}>
                  {cfg.label}
                </span>

                <span className="text-[10px] text-muted-foreground">
                  {new Date(thought.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            No thoughts yet. What's on your mind?
          </p>
        )}
      </div>
    </div>
  );
}

export default ThoughtOrganizer;