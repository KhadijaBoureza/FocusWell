import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { Task, KanbanColumn } from "@/types/dashboard";

const COLUMNS: { id: KanbanColumn; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "inprogress", title: "In Progress" },
  { id: "done", title: "Done" },
];

const priorityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
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

  async function addTask(column: KanbanColumn) {
    if (!newTaskTitle.trim()) return;

    const payload = {
      title: newTaskTitle,
      column,
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
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Task Board</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            className="min-h-[220px] rounded-lg bg-muted/40 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {col.title}
                <span className="ml-2 text-muted-foreground">
                  {tasks.filter((t) => t.column === col.id).length}
                </span>
              </h3>

              <button
                onClick={() => setAddingTo(addingTo === col.id ? null : col.id)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                type="button"
              >
                <Plus size={16} />
              </button>
            </div>

            {addingTo === col.id && (
              <div className="mb-3">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask(col.id);
                  }}
                  placeholder="Task title..."
                  className="w-full rounded border px-2 py-1"
                />
              </div>
            )}

            <div className="space-y-2">
              {tasks
                .filter((t) => t.column === col.id)
                .map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => handleDragStart(task._id)}
                    className={`cursor-grab rounded border p-3 ${
                      draggedTask === task._id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p
                          className={
                            task.completed ? "line-through text-gray-400" : ""
                          }
                        >
                          {task.title}
                        </p>

                        <span
                          className={`inline-block rounded px-2 py-1 text-xs font-medium capitalize ${
                            priorityColors[task.priority] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {col.id !== "done" && (
                          <button
                            onClick={() => moveTask(task._id, "done")}
                            type="button"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => deleteTask(task._id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
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
