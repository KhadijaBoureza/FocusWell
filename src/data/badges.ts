import {
  Trophy, Flame, Clock, CheckCircle2, Brain, Zap, Star, Target,
  Award, Coffee, Bookmark, Sunrise, Rocket, Crown, Heart,
  Sparkles, Shield, Diamond
} from "lucide-react";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  glowClass: string;
  check: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  sessions: number;
  minutes: number;
  breaks: number;
  tasksCompleted: number;
  totalTasks: number;
  notesCount: number;
  thoughtsCount: number;
  remindersCount: number;
}

export const allBadges: Badge[] = [
  // Focus sessions
  { id: "first-focus", title: "First Focus", description: "Complete your first focus session", icon: Zap, colorClass: "text-neon-cyan", bgClass: "bg-neon-cyan/10 border-neon-cyan/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)]", check: (s) => s.sessions >= 1 },
  { id: "five-sessions", title: "Warming Up", description: "Complete 5 focus sessions", icon: Flame, colorClass: "text-neon-pink", bgClass: "bg-neon-pink/10 border-neon-pink/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]", check: (s) => s.sessions >= 5 },
  { id: "ten-sessions", title: "On Fire", description: "Complete 10 focus sessions", icon: Flame, colorClass: "text-neon-violet", bgClass: "bg-neon-violet/10 border-neon-violet/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-violet)/0.3)]", check: (s) => s.sessions >= 10 },
  { id: "twenty-sessions", title: "Unstoppable", description: "Complete 20 focus sessions", icon: Rocket, colorClass: "text-neon-blue", bgClass: "bg-neon-blue/10 border-neon-blue/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-blue)/0.3)]", check: (s) => s.sessions >= 20 },

  // Focus minutes
  { id: "hour-focus", title: "Hour Power", description: "Accumulate 60 minutes of focus", icon: Clock, colorClass: "text-neon-blue", bgClass: "bg-neon-blue/10 border-neon-blue/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-blue)/0.3)]", check: (s) => s.minutes >= 60 },
  { id: "marathon", title: "Marathon Mind", description: "Accumulate 500 minutes of focus", icon: Target, colorClass: "text-neon-green", bgClass: "bg-neon-green/10 border-neon-green/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]", check: (s) => s.minutes >= 500 },
  { id: "time-lord", title: "Time Lord", description: "Accumulate 1000 minutes of focus", icon: Crown, colorClass: "text-neon-pink", bgClass: "bg-neon-pink/10 border-neon-pink/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]", check: (s) => s.minutes >= 1000 },

  // Breaks
  { id: "break-taker", title: "Rest & Recharge", description: "Take 5 breaks", icon: Coffee, colorClass: "text-neon-cyan", bgClass: "bg-neon-cyan/10 border-neon-cyan/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)]", check: (s) => s.breaks >= 5 },
  { id: "zen-master", title: "Zen Master", description: "Take 20 breaks", icon: Sunrise, colorClass: "text-neon-green", bgClass: "bg-neon-green/10 border-neon-green/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]", check: (s) => s.breaks >= 20 },

  // Tasks
  { id: "task-starter", title: "Task Slayer", description: "Complete 10 tasks", icon: CheckCircle2, colorClass: "text-neon-green", bgClass: "bg-neon-green/10 border-neon-green/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]", check: (s) => s.tasksCompleted >= 10 },
  { id: "task-master", title: "Task Master", description: "Complete 50 tasks", icon: Shield, colorClass: "text-neon-violet", bgClass: "bg-neon-violet/10 border-neon-violet/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-violet)/0.3)]", check: (s) => s.tasksCompleted >= 50 },
  { id: "task-creator", title: "Planner", description: "Create 20 tasks total", icon: Bookmark, colorClass: "text-neon-blue", bgClass: "bg-neon-blue/10 border-neon-blue/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-blue)/0.3)]", check: (s) => s.totalTasks >= 20 },

  // Notes
  { id: "note-keeper", title: "Scribe", description: "Write 5 notes", icon: Star, colorClass: "text-neon-blue", bgClass: "bg-neon-blue/10 border-neon-blue/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-blue)/0.3)]", check: (s) => s.notesCount >= 5 },
  { id: "note-hoarder", title: "Archivist", description: "Write 20 notes", icon: Bookmark, colorClass: "text-neon-cyan", bgClass: "bg-neon-cyan/10 border-neon-cyan/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)]", check: (s) => s.notesCount >= 20 },

  // Thoughts
  { id: "deep-thinker", title: "Deep Thinker", description: "Log 10 thoughts", icon: Brain, colorClass: "text-neon-violet", bgClass: "bg-neon-violet/10 border-neon-violet/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-violet)/0.3)]", check: (s) => s.thoughtsCount >= 10 },
  { id: "philosopher", title: "Philosopher", description: "Log 30 thoughts", icon: Heart, colorClass: "text-neon-pink", bgClass: "bg-neon-pink/10 border-neon-pink/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-pink)/0.3)]", check: (s) => s.thoughtsCount >= 30 },

  // Reminders
  { id: "reminder-pro", title: "Never Forget", description: "Set 10 reminders", icon: Sparkles, colorClass: "text-neon-green", bgClass: "bg-neon-green/10 border-neon-green/30", glowClass: "shadow-[0_0_15px_hsl(var(--neon-green)/0.3)]", check: (s) => s.remindersCount >= 10 },

  // Meta
  { id: "legend", title: "Productivity Legend", description: "Unlock 12 other badges", icon: Diamond, colorClass: "text-neon-pink", bgClass: "bg-neon-pink/10 border-neon-pink/30", glowClass: "shadow-[0_0_20px_hsl(var(--neon-pink)/0.4)]", check: () => false },
];

export function getBadgeStats(localStorage: {
  sessions: number;
  minutes: number;
  breaks: number;
  kanban: any[];
  notes: any[];
  thoughts: any[];
  reminders: any[];
}): BadgeStats {
  return {
    sessions: localStorage.sessions,
    minutes: localStorage.minutes,
    breaks: localStorage.breaks,
    tasksCompleted: localStorage.kanban.filter((t: any) => t.status === "done").length,
    totalTasks: localStorage.kanban.length,
    notesCount: localStorage.notes.length,
    thoughtsCount: localStorage.thoughts.length,
    remindersCount: localStorage.reminders.length,
  };
}

export function getUnlockedCount(stats: BadgeStats): { unlocked: number; total: number; legendUnlocked: boolean } {
  const earned = allBadges.filter((b) => b.id !== "legend" && b.check(stats));
  const legendUnlocked = earned.length >= 12;
  return { unlocked: earned.length + (legendUnlocked ? 1 : 0), total: allBadges.length, legendUnlocked };
}
