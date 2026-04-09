import { useState } from "react";
import { Plus, GripVertical, Trash2, Check } from "lucide-react";
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

  // ADD TASK
  async function addTask(column: KanbanColumn) {
    if (!newTaskTitle.trim()) return;

    const res = await fetch("http://localhost:5000/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: newTaskTitle,
        column,
      }),
    });

    const newTask = await res.json();

    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle("");
    setAddingTo(null);
  }

  // DELETE TASK
  async function deleteTask(id: string) {
    const res = await fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t._id !== id));
    }
  }

  // MOVE TASK
  async function moveTask(taskId: string, newColumn: KanbanColumn) {
    await fetch(`http://localhost:5000/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ column: newColumn }),
    });

    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId
          ? { ...t, column: newColumn, completed: newColumn === "done" }
          : t
      )
    );
  }

  function handleDragStart(taskId: string) {
    setDraggedTask(taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(column: KanbanColumn) {
    if (draggedTask !== null) {
      moveTask(draggedTask, column);
      setDraggedTask(null);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold mb-4">Task Board</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
            className="bg-muted/40 rounded-lg p-3 min-h-[220px]"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                {col.title}
                <span className="ml-2 text-muted-foreground">
                  {tasks.filter((t) => t.column === col.id).length}
                </span>
              </h3>

              <button
                onClick={() =>
                  setAddingTo(addingTo === col.id ? null : col.id)
                }
                className="p-1 rounded text-muted-foreground hover:text-foreground"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* ADD INPUT */}
            {addingTo === col.id && (
              <div className="mb-3">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask(col.id)}
                  placeholder="Task title..."
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            )}

            {/* TASKS */}
            <div className="space-y-2">
              {tasks
                .filter((t) => t.column === col.id)
                .map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={() => handleDragStart(task._id)}
                    className={`p-3 border rounded cursor-grab ${
                      draggedTask === task._id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p
                          className={
                            task.completed ? "line-through text-gray-400" : ""
                          }
                        >
                          {task.title}
                        </p>

                        <span className={priorityColors[task.priority]}>
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {col.id !== "done" && (
                          <button
                            onClick={() => moveTask(task._id, "done")}
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => deleteTask(task._id)}
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
