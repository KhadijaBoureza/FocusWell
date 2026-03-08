import { useState } from "react";
import { Plus, GripVertical, Trash2, Check } from "lucide-react";
import { Task, KanbanColumn } from "@/types/dashboard";
import { mockTasks } from "@/data/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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

function KanbanBoard() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("kanban-tasks", mockTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addingTo, setAddingTo] = useState<KanbanColumn | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  function addTask(column: KanbanColumn) {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: column === "done",
      priority: "medium",
      column,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, task]);
    setNewTaskTitle("");
    setAddingTo(null);
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
  }

  function moveTask(taskId: string, newColumn: KanbanColumn) {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
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
    if (draggedTask) {
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
            {/* Column header */}
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
                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Add task input */}
            {addingTo === col.id && (
              <div className="mb-3">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask(col.id)}
                  placeholder="Task title..."
                  autoFocus
                  className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            )}

            {/* Task list */}
            <div className="space-y-2">
              {tasks
                .filter((t) => t.column === col.id)
                .map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    className={`group bg-card border border-border rounded-md p-3 cursor-grab active:cursor-grabbing hover:border-primary/40 transition ${
                      draggedTask === task.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        size={14}
                        className="text-muted-foreground mt-0.5 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            task.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </p>

                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== "done" && (
                          <button
                            onClick={() => moveTask(task.id, "done")}
                            className="p-1 text-green-600 hover:text-green-500"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-destructive hover:text-destructive/80"
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
