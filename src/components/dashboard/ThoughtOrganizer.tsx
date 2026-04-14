import { useState, useEffect } from "react";
import {
  Brain,
  Plus,
  X,
  Trash2,
  Tag,
  Lightbulb,
  AlertCircle,
  Heart,
} from "lucide-react";

interface Thought {
  _id: string;
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

function ThoughtOrganizer() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState<Thought["category"]>("reflection");
  const [filter, setFilter] =
    useState<Thought["category"] | "all">("all");

  // FETCH thoughts
  useEffect(() => {
    fetch("http://localhost:5000/thoughts")
      .then((res) => res.json())
      .then((data) => setThoughts(data))
      .catch((err) => console.error(err));
  }, []);

  // ADD thought
  async function addThought() {
    if (!content.trim()) return;

    const res = await fetch("http://localhost:5000/thoughts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        category,
      }),
    });

    const newThought = await res.json();

    setThoughts((prev) => [newThought, ...prev]);
    setContent("");
    setIsAdding(false);
  }

  // DELETE thought
  async function deleteThought(id: string) {
    await fetch(`http://localhost:5000/thoughts/${id}`, {
      method: "DELETE",
    });

    setThoughts((prev) => prev.filter((t) => t._id !== id));
  }

  const filtered =
    filter === "all"
      ? thoughts
      : thoughts.filter((t) => t.category === filter);

  return (
    <div className="glass-card neon-border-violet p-6">
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

      {/* Filters */}
      <div className="flex gap-1 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-md text-xs ${filter === "all"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          All
        </button>

        {(Object.keys(categoryConfig) as Thought["category"][]).map(
          (cat) => {
            const cfg = categoryConfig[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-xs flex items-center gap-1 ${filter === cat
                    ? `${cfg.bg} ${cfg.color}`
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <cfg.icon size={12} />
                {cfg.label}
              </button>
            );
          }
        )}
      </div>

      {/* Add Thought */}
      {isAdding && (
        <div className="mb-4 p-3 bg-muted/40 rounded-lg space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <div className="flex justify-between">
            <div className="flex gap-1.5">
              {(Object.keys(categoryConfig) as Thought["category"][]).map(
                (cat) => {
                  const cfg = categoryConfig[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`p-1.5 rounded-md ${category === cat
                          ? `${cfg.bg} ${cfg.color}`
                          : "text-muted-foreground"
                        }`}
                    >
                      <cfg.icon size={14} />
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={addThought}
              className="px-3 py-1.5 bg-primary text-white rounded-md text-xs"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Thoughts */}
      <div className="space-y-2.5 max-h-[350px] overflow-y-auto scrollbar-thin pr-2">
        {filtered.map((thought) => {
          const cfg = categoryConfig[thought.category];

          return (
            <div
              key={thought._id}
              className={`p-3 rounded-lg border ${cfg.bg} group`}
            >
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <cfg.icon size={14} className={cfg.color} />
                  <p className="text-sm">{thought.content}</p>
                </div>

                <button
                  onClick={() => deleteThought(thought._id)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="flex gap-2 mt-2 text-xs">
                <Tag size={10} />
                <span className={cfg.color}>{cfg.label}</span>
                <span>
                  {new Date(thought.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ThoughtOrganizer;