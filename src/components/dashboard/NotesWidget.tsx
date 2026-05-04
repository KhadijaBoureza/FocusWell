import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  StickyNote,
  Check,
  Brain,
  Heart,
  Activity,
  Coins,
  Palette,
  Users,
  Sparkles,
  Moon,
  Sun,
  CalendarRange,
  Infinity as InfinityIcon,
  ChevronDown,
} from "lucide-react";
import {
  Note,
  NoteColor,
  NoteKind,
  LifeArea,
  Horizon,
} from "@/types/dashboard";

const colorMap: Record<string, string> = {
  violet: "border-l-neon-violet",
  blue: "border-l-neon-blue",
  cyan: "border-l-neon-cyan",
};

const colors: NoteColor[] = ["violet", "blue", "cyan"];

const LIFE_AREAS: { key: LifeArea; label: string; icon: typeof Brain }[] = [
  { key: "mind", label: "Mind", icon: Brain },
  { key: "heart", label: "Heart", icon: Heart },
  { key: "body", label: "Body", icon: Activity },
  { key: "wealth", label: "Wealth", icon: Coins },
  { key: "craft", label: "Craft", icon: Palette },
  { key: "connection", label: "Connection", icon: Users },
];

const HORIZONS: { key: Horizon; label: string; icon: typeof Moon }[] = [
  { key: "month", label: "This month", icon: Moon },
  { key: "quarter", label: "Next 90 days", icon: Sun },
  { key: "year", label: "This year", icon: CalendarRange },
  { key: "someday", label: "Someday", icon: InfinityIcon },
];

const areaOf = (k?: LifeArea) =>
  LIFE_AREAS.find((a) => a.key === k) ?? LIFE_AREAS[0];

const horizonOf = (k?: Horizon) =>
  HORIZONS.find((h) => h.key === k) ?? HORIZONS[0];

function NotesWidget() {
  const [items, setItems] = useState<Note[]>([]);
  const [tab, setTab] = useState<NoteKind>("wish");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>("violet");
  const [selectedArea, setSelectedArea] = useState<LifeArea>("mind");
  const [selectedHorizon, setSelectedHorizon] = useState<Horizon>("month");
  const [filterHorizon, setFilterHorizon] = useState<Horizon | "all">("all");

  useEffect(() => {
    fetch("http://localhost:5000/notes")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  const reset = () => {
    setTitle("");
    setContent("");
    setSelectedColor("violet");
    setSelectedArea("mind");
    setSelectedHorizon("month");
  };

  const addItem = async () => {
    if (!title.trim()) return;

    const res = await fetch("http://localhost:5000/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: tab,
        title,
        content,
        color: selectedColor,
        area: tab === "wish" ? selectedArea : undefined,
        horizon: tab === "wish" ? selectedHorizon : undefined,
        done: tab === "wish" ? false : undefined,
      }),
    });

    if (!res.ok) return;

    const newItem = await res.json();

    setItems((prev) => [newItem, ...prev]);
    reset();
    setIsAdding(false);
  };

  const deleteItem = async (id: string) => {
    const res = await fetch(`http://localhost:5000/notes/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setItems((prev) => prev.filter((i) => i._id !== id));
    }
  };

  const toggleWish = async (item: Note) => {
    const updatedDone = !item.done;

    const res = await fetch(`http://localhost:5000/notes/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...item,
        done: updatedDone,
      }),
    });

    if (res.ok) {
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, done: updatedDone } : i
        )
      );
    }
  };

  const saveEdit = async (item: Note) => {
    const payload = {
      ...item,
      title,
      content,
      color: selectedColor,
      area: item.kind === "wish" ? selectedArea : undefined,
      horizon: item.kind === "wish" ? selectedHorizon : undefined,
    };

    const res = await fetch(`http://localhost:5000/notes/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return;

    const updated = await res.json();

    setItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));

    setEditingId(null);
    reset();
  };

  const startEdit = (item: Note) => {
    setEditingId(item._id);
    setTitle(item.title);
    setContent(item.content);
    setSelectedColor(item.color);
    setSelectedArea(item.area ?? "mind");
    setSelectedHorizon(item.horizon ?? "month");
    setIsAdding(false);
  };

  const visible = items.filter((i) => {
    const kind = i.kind ?? "note";

    if (kind !== tab) return false;

    if (
      tab === "wish" &&
      filterHorizon !== "all" &&
      i.horizon !== filterHorizon
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="glass-card neon-border-blue p-6 h-[393px] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-neon-violet" />
          <h2 className="font-mono text-lg font-semibold text-foreground">
            Life Aspirations
          </h2>
        </div>

        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingId(null);
            reset();
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <p className="text-[11px] font-mono text-muted-foreground mb-3 italic">
        Wishes by life area & time horizon
      </p>

      <div className="flex gap-1 mb-3 p-1 bg-muted/30 rounded-lg">
        <button
          onClick={() => setTab("wish")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-all ${tab === "wish"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Sparkles size={12} />
          Aspirations
        </button>

        <button
          onClick={() => setTab("note")}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-all ${tab === "note"
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <StickyNote size={12} />
          Notes
        </button>
      </div>

      {tab === "wish" && (
        <div className="mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="
    flex w-full items-center justify-between
    rounded-md border border-neon-violet/40
    bg-white dark:bg-black
    px-2 py-1.5
    text-left text-xs font-mono text-foreground
    transition-all
    hover:border-neon-violet hover:bg-muted/40 dark:hover:bg-zinc-800
    focus:outline-none focus:ring-1 focus:ring-neon-violet
  ">
                <span>
                  {filterHorizon === "all"
                    ? "All time horizons"
                    : horizonOf(filterHorizon).label}
                </span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="
    w-[var(--radix-dropdown-menu-trigger-width)]
    border border-neon-violet/40
    bg-white dark:bg-black
    text-black dark:text-white
    shadow-lg
  "
            >
              {/* ALL */}
              <DropdownMenuItem
                onClick={() => setFilterHorizon("all")}
                className="
      cursor-pointer text-xs font-mono
      text-black dark:text-white
      hover:text-black dark:hover:text-white
      focus:text-black dark:focus:text-white
      hover:bg-muted/50 dark:hover:bg-zinc-800
      focus:bg-muted/50 dark:focus:bg-zinc-800
      data-[highlighted]:text-black dark:data-[highlighted]:text-white
      data-[highlighted]:bg-muted/50 dark:data-[highlighted]:bg-zinc-800
    "
              >
                All time horizons
              </DropdownMenuItem>

              {/* OPTIONS */}
              {HORIZONS.map((h) => (
                <DropdownMenuItem
                  key={h.key}
                  onClick={() => setFilterHorizon(h.key)}
                  className="
        cursor-pointer text-xs font-mono
        text-black dark:text-white
        hover:text-black dark:hover:text-white
        focus:text-black dark:focus:text-white
        hover:bg-muted/50 dark:hover:bg-zinc-800
        focus:bg-muted/50 dark:focus:bg-zinc-800
        data-[highlighted]:text-black dark:data-[highlighted]:text-white
        data-[highlighted]:bg-muted/50 dark:data-[highlighted]:bg-zinc-800
      "
                >
                  {h.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isAdding && (
        <div className="mb-4 space-y-2 p-3 bg-muted/30 rounded-lg">
          {tab === "wish" && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value as LifeArea)}
                className="bg-black border border-border rounded-md px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {LIFE_AREAS.map((a) => (
                  <option className="bg-black text-foreground" key={a.key} value={a.key}>
                    {a.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedHorizon}
                onChange={(e) => setSelectedHorizon(e.target.value as Horizon)}
                className="bg-black border border-border rounded-md px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {HORIZONS.map((h) => (
                  <option className="bg-black text-foreground" key={h.key} value={h.key}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              tab === "wish" ? "What do you aspire to?" : "Note title..."
            }
            className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              tab === "wish" ? "Why does it matter to you?" : "Write something..."
            }
            rows={3}
            className="w-full bg-background/50 border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${c === "violet"
                    ? "bg-neon-violet"
                    : c === "blue"
                      ? "bg-neon-blue"
                      : "bg-neon-cyan"
                    } ${selectedColor === c
                      ? "border-foreground scale-125"
                      : "border-transparent"
                    }`}
                />
              ))}
            </div>

            <button
              onClick={addItem}
              className="px-3 py-1 rounded-md bg-primary/20 text-primary text-xs font-mono hover:bg-primary/30 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-[180px] overflow-y-auto scrollbar-thin flex-1">
        {visible.length === 0 && (
          <p className="text-center text-xs font-mono text-muted-foreground py-4">
            {tab === "wish"
              ? "Nothing here yet — what's calling you?"
              : "No notes yet."}
          </p>
        )}

        {visible.map((item) => {
          const area = areaOf(item.area);
          const horizon = horizonOf(item.horizon);
          const AreaIcon = area.icon;
          const HorizonIcon = horizon.icon;

          return (
            <div
              key={item._id}
              className={`border-l-2 ${colorMap[item.color] || "border-l-neon-violet"
                } bg-muted/20 rounded-r-md p-3 group ${item.done ? "opacity-60" : ""
                }`}
            >
              {editingId === item._id ? (
                <div className="space-y-2">
                  {item.kind === "wish" && (
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedArea}
                        onChange={(e) =>
                          setSelectedArea(e.target.value as LifeArea)
                        }
                        className="bg-black border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {LIFE_AREAS.map((a) => (
                          <option className="bg-black text-foreground" key={a.key} value={a.key}>
                            {a.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={selectedHorizon}
                        onChange={(e) =>
                          setSelectedHorizon(e.target.value as Horizon)
                        }
                        className="bg-black border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {HORIZONS.map((h) => (
                          <option className="bg-black text-foreground" key={h.key} value={h.key}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background/50 border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />

                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={2}
                    className="w-full bg-background/50 border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`w-4 h-4 rounded-full border-2 transition-all ${c === "violet"
                            ? "bg-neon-violet"
                            : c === "blue"
                              ? "bg-neon-blue"
                              : "bg-neon-cyan"
                            } ${selectedColor === c
                              ? "border-foreground scale-125"
                              : "border-transparent"
                            }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => saveEdit(item)}
                      className="p-1 text-neon-green"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {item.kind === "wish" && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide bg-muted/40 text-neon-violet">
                            <AreaIcon size={10} />
                            {area.label}
                          </span>

                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide bg-muted/40 text-neon-cyan">
                            <HorizonIcon size={10} />
                            {horizon.label}
                          </span>
                        </div>
                      )}

                      <h4
                        className={`text-sm font-semibold text-foreground ${item.done ? "line-through" : ""
                          }`}
                      >
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      {item.kind === "wish" && (
                        <button
                          onClick={() => toggleWish(item)}
                          title={
                            item.done ? "Mark as open" : "Mark as fulfilled"
                          }
                          className={`p-1 ${item.done
                            ? "text-neon-green"
                            : "text-muted-foreground hover:text-neon-green"
                            }`}
                        >
                          <Check size={12} />
                        </button>
                      )}

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Edit3 size={12} />
                        </button>

                        <button
                          onClick={() => deleteItem(item._id)}
                          className="p-1 text-destructive hover:text-destructive/80"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {item.content && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 italic">
                      {item.content}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotesWidget;