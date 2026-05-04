import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import ThemeToggle from "@/components/dashboard/ThemeToggle";
import {
  Sparkles, ListTodo, Clock, Calendar, StickyNote,
  Brain, Bell, Heart, BarChart3, Trophy, Lock, ArrowRight, Star
} from "lucide-react";

const features = [
  { icon: ListTodo, label: "Kanban tasks", desc: "Organise work by priority with drag-and-drop boards. Live counters for to-do, in progress and done." },
  { icon: Clock, label: "Pomodoro timer", desc: "Deep focus sessions with high-precision timing, plus break prompts so resting earns badges too." },
  { icon: Calendar, label: "Calendar with dots", desc: "Add up to 9 events per day. Coloured dots show busy days at a glance, no counting required." },
  { icon: Bell, label: "One-click reminders", desc: "Push any reminder straight to your calendar with a single click." },
  { icon: StickyNote, label: "Quick notes", desc: "Capture ideas with colour-coded sticky notes." },
  { icon: Brain, label: "Thought organiser", desc: "Capture and structure scattered thoughts and life aspirations in one calm place." },
  { icon: Star, label: "Life aspirations", desc: "Set a wish, goal or dream with a target date and watch a live countdown keep you motivated." },
  { icon: Heart, label: "Wellbeing & journal", desc: "Mood trends, daily check-ins and a private journal you can lock, or export as PDF, text or Markdown." },
  { icon: BarChart3, label: "Trends & analytics", desc: "Daily focus, daily task and mood trends, compared day over day." },
  { icon: Trophy, label: "Achievements", desc: "Unlock 18 badges as you focus, reflect and rest." },
];


const Landing = () => {
  const navigate = useNavigate();


  useEffect(() => {
    document.title = "FocusWell. Your mind's command centre";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 md:px-8 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-violet">
            <Sparkles size={16} className="text-primary" />
          </div>
          <span className="font-mono text-base font-bold neon-text-violet">
            FocusWell
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
            Sign in
          </Button>

          <Button size="sm" onClick={() => navigate("/app")}>
            Open dashboard <ArrowRight size={14} />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 md:px-8 py-16 md:py-20 text-center max-w-3xl mx-auto">
        <h1 className="font-mono text-2xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
          Your mind's <span className="neon-text-violet">command centre</span>
        </h1>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
          FocusWell. No AI. No noise. Just you.
        </div>
      </section>

      {/* About + What's inside split */}
      <section className="px-4 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* About */}
          <div className="glass-card border border-border rounded-2xl p-6 md:p-8">
            <h2 className="font-mono text-2xl font-bold mb-4">About FocusWell</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                FocusWell is a self-managed productivity dashboard built for people who
                want to take back control of their attention. It brings tasks, focus
                sessions, journalling, calendar and reminders together in one calm space,
                so your day lives in one place instead of scattered across a dozen apps.
              </p>
              <p>
                It was built on a simple belief: you don't need an algorithm to know
                what's good for you. There are no AI suggestions, no nudges, no scoring
                you against strangers. Every choice, what to focus on, when to rest, what
                to write down, stays yours.
              </p>
              <p>
                Designed for digital wellbeing, FocusWell pairs deep-work tools like the
                Pomodoro timer and Kanban board with reflective ones like a private
                journal, mood check-ins and a thought organiser. Track your week with
                clean analytics, celebrate progress with achievements, and shape your own
                rhythm at your own pace.
              </p>
              <p>
                Privacy is the foundation. Your notes, journal entries and habits belong
                to you, not to a feed, not to an advertiser. FocusWell stays quiet, stays
                out of the way, and lets you do your best work while staying well.
              </p>
            </div>
          </div>


          {/* What's inside */}
          <div className="glass-card border border-border rounded-2xl p-6 md:p-8">
            <h2 className="font-mono text-2xl font-bold mb-4">What's inside</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <div key={f.label} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <f.icon size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm">{f.label}</div>
                    <div className="text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 md:px-8 py-8 border-t border-border text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Lock size={12} /> Privacy-first. Your data stays yours.
        </div>
        © {new Date().getFullYear()} FocusWell
      </footer>
    </div>
  );
};

export default Landing;
