import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, ArrowRight } from "lucide-react";

interface PremiumGateProps {
  feature: string;
  description?: string;
}

const PremiumGate = ({ feature, description }: PremiumGateProps) => {
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="relative rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-background to-background p-8 text-center neon-glow-violet">
        <div className="w-14 h-14 mx-auto rounded-full bg-primary/15 flex items-center justify-center mb-4">
          <Lock size={22} className="text-primary" />
        </div>
        <div className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 mb-3">
          <Sparkles size={12} /> Premium
        </div>
        <h2 className="font-mono text-xl font-bold mb-2">{feature}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {description || "Sign in to unlock this feature and sync your data across devices."}
        </p>
        <Button className="w-full" onClick={() => navigate("/auth")}>
          Sign in to unlock <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
};

export default PremiumGate;