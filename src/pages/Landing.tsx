import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Calendar,
  StickyNote,
  Brain,
  Bell,
  Heart,
  BarChart3,
  Trophy,
  Lock,
  ArrowRight,
  Star,
  Target,
  Flame,
  CheckCircle2,
} from "lucide-react";

const features = [
  { icon: ListTodo, label: "Kanban tasks", desc: "Drag-and-drop boards with live priority counters.", color: "text-primary" },
  { icon: Clock, label: "Pomodoro timer", desc: "High-precision focus sessions with mindful breaks.", color: "text-neon-blue" },
  { icon: Calendar, label: "Calendar", desc: "Up to 9 cooured events per day at a glance.", color: "text-neon-cyan" },
  { icon: Bell, label: "Reminders", desc: "Push any reminder straight to your calendar.", color: "text-neon-pink" },
  { icon: StickyNote, label: "Quick notes", desc: "Capture ideas as colour-coded sticky notes.", color: "text-primary" },
  { icon: Brain, label: "Thought organiser", desc: "Structure scattered thoughts in one calm place.", color: "text-neon-blue" },
  { icon: Star, label: "Life aspirations", desc: "Set goals with target dates.", color: "text-neon-cyan" },
  { icon: Heart, label: "Wellbeing & journal", desc: "Mood trends, check-ins, lockable private journal.", color: "text-neon-pink" },
  { icon: BarChart3, label: "Trends & analytics", desc: "Daily focus, tasks and mood, day over day.", color: "text-primary" },
  { icon: Trophy, label: "Achievements", desc: "Unlock 18 badges as you focus, reflect and rest.", color: "text-neon-green" },
];

const stats = [
  { label: "Focus tools", value: "10", icon: Target, color: "text-primary" },
  { label: "Badges", value: "18", icon: Trophy, color: "text-neon-green" },
  { label: "AI nudges", value: "0", icon: Flame, color: "text-neon-pink" },
  { label: "Yours", value: "100%", icon: CheckCircle2, color: "text-neon-blue" },
];

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "FocusWell. Your mind's command centre";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="px-4 md:px-6 py-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center neon-glow-violet">
            <LayoutDashboard size={16} className="text-primary" />
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

      <main className="px-4 md:px-6 py-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
        <section className="glass-card p-6 md:p-10">
          <div className="grid md:grid-cols-5 gap-6 items-center">
            <div className="md:col-span-3 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs text-primary">
                <Lock size={12} /> No AI. No noise. Just you.
              </div>

              <h1 className="font-mono text-3xl md:text-5xl font-bold leading-tight">
                Your mind&apos;s{" "}
                <span className="neon-text-violet">command centre</span>
              </h1>

              <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                One calm space for tasks, focus, journalling, calendar and reminders.
                Built for digital wellbeing  your data, your pace, your rules.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button onClick={() => navigate("/auth")} className="gap-2">
                  Get started <ArrowRight size={14} />
                </Button>

                <Button variant="outline" onClick={() => navigate("/app")}>
                  Explore demo
                </Button>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="glass-card p-4 flex items-center gap-3">
                  <s.icon size={20} className={s.color} />
                  <div>
                    <p className="font-mono text-xl font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass-card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-primary" />
            <h2 className="font-mono text-xl md:text-2xl font-bold">
              About FocusWell
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              FocusWell is a self-managed productivity dashboard for people who want to
              take back control of their attention. Tasks, focus sessions, journalling,
              calendar and reminders live together in one calm space, not scattered
              across a dozen apps.
            </p>

            <p>
              Built on a simple belief: you don&apos;t need an algorithm to know what&apos;s good
              for you. No AI suggestions, no nudges, no scoring. Every choice what to
              focus on, when to rest  stays yours.
            </p>


            <p>
              Deep-work tools like the Pomodoro timer and Kanban board pair with
              reflective ones: a private journal, mood check-ins and a thought organiser.
            </p>


            <p>
              FocusWell is not a medical or clinical tool. Its wellbeing features are for
              reflection, organisation and self-awareness only.
            </p>
            <div className="md:col-span-2">
              <div className="my-3 border-t border-gray-400/40" />

              <p>
                Privacy is the foundation. Your notes, journal entries and habits belong to
                you  not to a feed, not to an advertiser. FocusWell stays quiet and out of
                the way.
              </p>
            </div>
             </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-mono text-xl md:text-2xl font-bold">
              What&apos;s inside
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ten focused tools, nothing extra.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="glass-card p-4 hover:border-primary/40 transition-all"
              >
                <f.icon size={20} className={`${f.color} mb-2`} />
                <div className="font-medium text-sm mb-1">{f.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-6 md:p-8 text-center">
          <h3 className="font-mono text-xl md:text-2xl font-bold mb-2">
            Ready to <span className="neon-text-violet">focus well</span>?
          </h3>

          <p className="text-sm text-muted-foreground mb-4">
            Free, private, and yours. Step into your command centre.
          </p>

          <Button onClick={() => navigate("/auth")} className="gap-2">
            Get started <ArrowRight size={14} />
          </Button>
        </section>

        <footer className="py-6 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock size={12} /> Privacy-first. Your data stays yours.
          </div>
          © {new Date().getFullYear()} FocusWell
        </footer>
      </main>
    </div>
  );
};

export default Landing;