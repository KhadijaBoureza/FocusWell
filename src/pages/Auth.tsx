import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User as UserIcon, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/dashboard/ThemeToggle";

const Auth = () => {
  const navigate = useNavigate();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Sign in — FocusWell";
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!email.trim()) {
        toast.error("Please enter your email.");
        return;
      }

      if (password.length < 6) {
        toast.error("Password must be at least 6 characters.");
        return;
      }

      if (mode === "signup" && !displayName.trim()) {
        toast.error("Please enter your name.");
        return;
      }

      toast.success(
        mode === "signin" ? "Welcome back!" : "Account created!"
      );

      navigate("/app");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4 md:p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-mono text-lg font-bold">FocusWell</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-mono text-3xl font-bold text-foreground mb-2">
              {mode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to keep your focus going."
                : "Start tracking your wellbeing in seconds."}
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-lg space-y-5">
            <Tabs
              value={mode}
              onValueChange={(v) => setMode(v as "signin" | "signup")}
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-5">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <EmailField email={email} setEmail={setEmail} />
                  <PasswordField
                    password={password}
                    setPassword={setPassword}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Sign in
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-5">
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display name</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={displayName}
                        onChange={(e) =>
                          setDisplayName(e.target.value)
                        }
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <EmailField email={email} setEmail={setEmail} />
                  <PasswordField
                    password={password}
                    setPassword={setPassword}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting && (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    )}
                    Create account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing you agree to our terms and privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
};

const EmailField = ({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor="email">Email</Label>
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id="email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="pl-9"
      />
    </div>
  </div>
);

const PasswordField = ({
  password,
  setPassword,
}: {
  password: string;
  setPassword: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label htmlFor="password">Password</Label>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="pl-9"
      />
    </div>
  </div>
);

export default Auth;
