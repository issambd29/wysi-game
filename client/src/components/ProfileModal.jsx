import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Leaf, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileModal({ isOpen, onClose, onSubmit }) {
  const [nickname, setNickname] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(nickname);
    setIsSubmitting(false);
    
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/80 backdrop-blur-xl border-accent/20 text-white max-w-md overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        
        <DialogHeader className="space-y-4 relative z-10">
          <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-2">
            <Leaf className="w-8 h-8 text-primary animate-pulse-slow" />
          </div>
          <DialogTitle className="text-center font-display text-2xl tracking-widest text-accent">
            Identify Yourself
          </DialogTitle>
          <DialogDescription className="text-center text-white/70 font-body text-lg">
            The forest spirits need a name to weave into the roots of this world.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4 relative z-10">
          <div className="space-y-2">
            <div className="relative group">
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your keeper name..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 text-center text-lg font-display tracking-wide focus:border-accent/50 focus:ring-accent/20 transition-all"
                autoFocus
              />
              <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent/50 opacity-0 group-focus-within:opacity-100 transition-opacity" />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={!nickname.trim() || isSubmitting}
            className={cn(
              "w-full h-12 text-lg font-display tracking-wider relative overflow-hidden group transition-all duration-300",
              "bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90",
              "border border-primary/50 shadow-lg shadow-primary/20"
            )}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isSubmitting ? "Weaving..." : "Begin Journey"} 
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
