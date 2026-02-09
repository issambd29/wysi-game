import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Gamepad2, Trophy, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Home, testId: "link-home" },
    { href: "/controls", label: "Controls", icon: Gamepad2, testId: "link-controls" },
    { href: "/leaderboard", label: "Records", icon: Trophy, testId: "link-records" },
    { href: "/story", label: "Story", icon: ScrollText, testId: "link-story" },
  ];

  return (
    <>
      {/* Desktop: 3D floating nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0, rotateX: -20 }}
        animate={{ y: 0, opacity: 1, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.3, type: "spring", stiffness: 80 }}
        className="hidden md:flex fixed top-6 left-0 right-0 z-50 justify-center px-4"
        style={{ perspective: '1200px' }}
        data-testid="nav-desktop"
      >
        <div className="nav-3d-bar relative px-3 py-2 flex items-center gap-1">
          <div className="absolute inset-0 rounded-2xl -z-10" style={{
            background: 'linear-gradient(135deg, rgba(6,78,59,0.35) 0%, rgba(6,60,40,0.25) 50%, rgba(6,78,59,0.3) 100%)',
            backdropFilter: 'blur(20px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
            border: '1px solid rgba(74,222,128,0.12)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 40px rgba(74,222,128,0.04)',
          }} />

          <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10 pointer-events-none">
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '50%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)',
              borderRadius: '16px 16px 0 0',
            }} />
          </div>

          <div className="absolute -inset-1 rounded-3xl -z-20 pointer-events-none" style={{
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          }} />

          {links.map((link) => {
            const isActive = location === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-testid={link.testId}
                className={cn(
                  "nav-3d-item relative group flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-colors duration-300 outline-none",
                  isActive
                    ? "text-accent"
                    : "text-white/55 hover:text-white focus-visible:text-white"
                )}
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden -z-10">
                  {isActive && (
                    <motion.div
                      layoutId="activeTab3D"
                      className="absolute inset-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(34,197,94,0.06) 50%, rgba(16,185,129,0.1) 100%)',
                        borderRadius: '16px',
                        border: '1px solid rgba(74,222,128,0.2)',
                        boxShadow: '0 4px 20px rgba(74,222,128,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  />
                </div>

                <div className="nav-3d-icon">
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "text-accent" : "text-inherit"
                  )} style={{
                    filter: isActive ? 'drop-shadow(0 0 8px rgba(74,222,128,0.5)) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                  }} />
                </div>

                <span className={cn(
                  "nav-3d-label font-sans text-sm font-medium tracking-wide transition-all duration-300",
                  isActive ? "text-accent" : "text-inherit"
                )} style={{
                  textShadow: isActive ? '0 0 12px rgba(74,222,128,0.3)' : 'none',
                }}>
                  {link.label}
                </span>

                {isActive && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute -bottom-0.5 left-4 right-4 h-[2px] rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.6) 30%, rgba(74,222,128,0.8) 50%, rgba(74,222,128,0.6) 70%, transparent 100%)',
                      boxShadow: '0 0 8px rgba(74,222,128,0.4)',
                    }}
                  />
                )}

                <div className="nav-3d-shine absolute inset-0 rounded-2xl pointer-events-none -z-10" />

                <div className="absolute inset-0 rounded-2xl pointer-events-none -z-10 opacity-0 focus-visible:opacity-100 transition-opacity" style={{
                  boxShadow: '0 0 0 2px rgba(74,222,128,0.5)',
                }} />
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Mobile: 3D bottom tab bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        data-testid="nav-mobile"
      >
        <div className="relative">
          <div className="absolute inset-0 -z-10" style={{
            background: 'linear-gradient(180deg, rgba(6,78,59,0.4) 0%, rgba(6,60,40,0.6) 100%)',
            backdropFilter: 'blur(20px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
            borderTop: '1px solid rgba(74,222,128,0.1)',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
          }} />

          <div className="absolute top-0 left-0 right-0 h-[1px] -z-10 pointer-events-none" style={{
            background: 'linear-gradient(90deg, transparent 10%, rgba(74,222,128,0.15) 30%, rgba(74,222,128,0.2) 50%, rgba(74,222,128,0.15) 70%, transparent 90%)',
          }} />

          <div
            className="px-2 py-1.5 flex items-center justify-around"
            style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
          >
            {links.map((link) => {
              const isActive = location === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  data-testid={`${link.testId}-mobile`}
                  className={cn(
                    "nav-3d-mobile-item relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl min-w-[60px] outline-none",
                    isActive ? "text-accent" : "text-white/40"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile3D"
                      className="absolute inset-0 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      style={{
                        background: 'linear-gradient(180deg, rgba(74,222,128,0.1) 0%, rgba(74,222,128,0.04) 100%)',
                        borderRadius: '12px',
                        border: '1px solid rgba(74,222,128,0.15)',
                        boxShadow: '0 -2px 12px rgba(74,222,128,0.08)',
                      }}
                    />
                  )}

                  <div className="relative">
                    <Icon className={cn("w-5 h-5 transition-all duration-300", isActive && "text-accent")} style={{
                      filter: isActive ? 'drop-shadow(0 0 6px rgba(74,222,128,0.5))' : 'none',
                    }} />
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(74,222,128,0.3) 0%, transparent 70%)' }}
                      />
                    )}
                  </div>

                  <span className={cn(
                    "text-[10px] font-sans font-medium tracking-wide transition-all duration-300",
                    isActive ? "text-accent" : "text-inherit"
                  )} style={{
                    textShadow: isActive ? '0 0 8px rgba(74,222,128,0.3)' : 'none',
                  }}>
                    {link.label}
                  </span>

                  {isActive && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: 16 }}
                      className="absolute -top-0.5 h-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.7), transparent)',
                        boxShadow: '0 0 6px rgba(74,222,128,0.3)',
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </motion.nav>
    </>
  );
}
