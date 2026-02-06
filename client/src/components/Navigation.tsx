import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Gamepad2, Trophy, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/controls", label: "Controls", icon: Gamepad2 },
    { href: "/leaderboard", label: "Records", icon: Trophy },
    { href: "/story", label: "Story", icon: ScrollText },
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div className="glass-panel rounded-full px-6 py-3 flex items-center space-x-2 md:space-x-8">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          
          return (
            <Link key={link.href} href={link.href} className={cn(
              "relative group flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-300",
              isActive 
                ? "text-accent bg-white/5" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}>
              <Icon className={cn("w-5 h-5", isActive && "text-accent drop-shadow-lg")} />
              <span className={cn(
                "hidden md:block font-sans text-sm font-medium tracking-wide",
                isActive ? "text-accent" : "text-inherit"
              )}>
                {link.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/5 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-accent/5 -z-10 blur-sm" />
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
