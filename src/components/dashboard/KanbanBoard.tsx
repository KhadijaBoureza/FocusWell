import { useState } from "react";
import {
  Plus,
  Trash2,
  Check,
  Pencil,
  X,
  Save,
} from "lucide-react";
import { Task, KanbanColumn, TaskPriority } from "@/types/dashboard";

const COLUMNS: { id: KanbanColumn; title: string; colorClass: string }[] = [
  { id: "todo", title: "To Do", colorClass: "neon-text-violet" },
  { id: "inprogress", title: "In Progress", colorClass: "neon-text-blue" },
  { id: "done", title: "Done", colorClass: "neon-text-cyan" },
];

const priorityColors: Record<string, string> = {
  low: "bg-neon-green/20 text-neon-green",
  medium: "bg-neon-blue/20 text-neon-blue",
  high: "bg-neon-pink/20 text-neon-pink",
};

function KanbanBoard({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTo, setAddingTo] = useState<KanbanColumn | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] =
    useState<TaskPriority>("medium");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");

  async function addTask(column: KanbanColumn) {
    if (!newTaskTitle.trim()) return;

    const payload = {
      title: newTaskTitle,
      column,
      priority: selectedPriority,
      completed: column === "done",
      completedAt: column === "done" ? new Date().toISOString() : null,
    };

    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to add task");
      return;
    }

    const newTask = await res.json();

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setSelectedPriority("medium");
    setAddingTo(null);
  }

  async function deleteTask(id: string) {
    const res = await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t._id !== id));
    }
  }

  async function moveTask(taskId: string, newColumn: KanbanColumn) {
    const now = new Date().toISOString();

    const updatedFields =
      newColumn === "done"
        ? {
          column: newColumn,
          completed: true,
          completedAt: now,
        }
        : {
          column: newColumn,
          completed: false,
          completedAt: null,
        };

    const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });

    if (!res.ok) {
      console.error("Failed to move task");
      return;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId
          ? {
            ...t,
            ...updatedFields,
          }
          : t
      )
    );
  }

  function startEdit(task: Task) {
    setEditingTaskId(task._id);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setAddingTo(null);
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditPriority("medium");
  }

  async function saveEdit(taskId: string) {
    if (!editTitle.trim()) return;

    const payload = {
      title: editTitle,
      priority: editPriority,
    };

    const res = await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to edit task");
      return;
    }

    const updatedTask = await res.json();

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? updatedTask : t))
    );

    cancelEdit();
  }

  function handleDragStart(taskId: string) {
    setDraggedTask(taskId);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  function handleDrop(column: KanbanColumn) {
    if (draggedTask) {
      moveTask(draggedTask, column);
      setDraggedTask(null);
    }
  }

  return (
    <div className="glass-card neon-border-blue p-6">
      <h2 className="mb-4 font-mono text-lg font-semibold text-foreground">
        Task Board
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            className="min-h-[200px] rounded-lg bg-muted/30 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`font-mono text-sm font-semibold ${col.colorClass}`}>
                {col.title}
                <span className="ml-2 text-muted-foreground">
                  {tasks.filter((t) => t.column === col.id).length}
                </span>
              </h3>

              <button
                onClick={() => {
                  setAddingTo(addingTo === col.id ? null : col.id);
                  setNewTaskTitle("");
                  setSelectedPriority("medium");
                  setEditingTaskId(null);
                }}
                className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                <Plus size={16} />
              </button>
            </div>

            {addingTo === col.id && (
              <div className="mb-3 space-y-2">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask(col.id);
                  }}
                  placeholder="Task title..."
                  autoFocus
                  className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <div className="flex gap-2">
                  {(["low", "medium", "high"] as TaskPriority[]).map(
                    (priority) => (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => setSelectedPriority(priority)}
                        className={`rounded px-2 py-1 text-[10px] font-mono capitalize transition-all ${priorityColors[priority]
                          } ${selectedPriority === priority
                            ? "scale-105 ring-1 ring-foreground"
                            : "opacity-80 hover:opacity-100"
                          }`}
                      >
                        {priority}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {tasks
                .filter((t) => t.column === col.id)
                .map((task) => (
                  <div
                    key={task._id}
                    draggable={editingTaskId !== task._id}
                    onDragStart={() => handleDragStart(task._id)}
                    className={`group cursor-grab rounded-md border border-border/50 bg-card p-3 transition-all hover:border-primary/30 active:cursor-grabbing ${draggedTask === task._id ? "opacity-50" : ""
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">

                      <div className="min-w-0 flex-1 overflow-hidden">
                        {editingTaskId === task._id ? (
                          <div className="space-y-2">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />

                            <div className="flex gap-2">
                              {(["low", "medium", "high"] as TaskPriority[]).map(
                                (priority) => (
                                  <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setEditPriority(priority)}
                                    className={`rounded px-2 py-1 text-[10px] font-mono capitalize transition-all ${priorityColors[priority]
                                      } ${editPriority === priority
                                        ? "scale-105 ring-1 ring-foreground"
                                        : "opacity-80 hover:opacity-100"
                                      }`}
                                  >
                                    {priority}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`text-sm break-words whitespace-normal ${task.completed
                                  ? "line-through text-muted-foreground"
                                  : "text-foreground"
                                }`}
                            >
                              {task.title}
                            </p>

                            <span
                              className={`mt-1 inline-block rounded px-2 py-0.5 text-[10px] font-mono capitalize ${priorityColors[task.priority] ||
                                "bg-muted text-muted-foreground"
                                }`}
                            >
                              {task.priority}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {editingTaskId === task._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(task._id)}
                              className="p-1 text-neon-green hover:text-neon-green/80"
                              type="button"
                            >
                              <Save size={14} />
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="p-1 text-muted-foreground hover:text-foreground"
                              type="button"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(task)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                              type="button"
                            >
                              <Pencil size={14} />
                            </button>

                            {col.id !== "done" && (
                              <button
                                onClick={() => moveTask(task._id, "done")}
                                className="p-1 text-neon-green hover:text-neon-green/80"
                                type="button"
                              >
                                <Check size={14} />
                              </button>
                            )}

                            <button
                              onClick={() => deleteTask(task._id)}
                              className="p-1 text-destructive hover:text-destructive/80"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KanbanBoard;
