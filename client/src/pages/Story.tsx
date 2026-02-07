import { motion } from "framer-motion";
import { BookOpen, Sparkles, Globe, Skull, Shield, AlertTriangle, Leaf, Crosshair, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const STORY_SECTIONS = [
  {
    icon: Globe,
    iconColor: "text-blue-400",
    paragraphs: [
      "Not long from now... the threat did not rise from Earth, but from a planet that forgot what life means.",
      "A villain ruled a dying world, one that drowned in its own waste. Unable to restore balance, he chose a darker solution.",
    ],
  },
  {
    icon: Skull,
    iconColor: "text-red-400",
    paragraphs: [
      "He turned garbage into a weapon.",
      "An ultimatum was sent to Earth. Pay the ransom. Resources. Wealth. Control.",
      "Earth did not answer. Not out of weakness\u2014but dignity.",
    ],
  },
  {
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    paragraphs: [
      "Enraged, the villain unleashed his punishment. From his planet, waves of trash were launched toward Earth. Not random debris... but a calculated storm.",
      "Garbage rained from the sky, falling onto forests, choking oceans, darkening cities in silence. The people never knew. Life continued. But the planet was suffocating.",
    ],
  },
  {
    icon: Leaf,
    iconColor: "text-emerald-400",
    paragraphs: [
      "In secrecy, Earth awakened its last protector.",
      "You.",
      "No medals. No fame. No witnesses. Your mission is to protect... without being seen.",
    ],
  },
  {
    icon: Crosshair,
    iconColor: "text-amber-300",
    paragraphs: [
      "Every piece of garbage you destroy gives Earth another breath. Every second you survive secures a future.",
      "The villain watches. The attacks grow stronger. Time grows shorter.",
      "What falls today... is what we leave behind tomorrow.",
    ],
  },
];

export default function Story() {
  return (
    <div className="min-h-screen pt-16 pb-24 px-6 flex flex-col items-center max-w-3xl mx-auto relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="mx-auto w-16 h-16 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-6"
      >
        <BookOpen className="w-8 h-8 text-accent" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-3xl md:text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent pb-2 mb-2 text-center"
      >
        A Silent War for a Living Planet
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-white/30 font-body text-sm tracking-wide mb-12 text-center"
      >
        The story of the Earth Keeper
      </motion.p>

      <div className="space-y-10 w-full">
        {STORY_SECTIONS.map((section, sIdx) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + sIdx * 0.3, duration: 0.8 }}
              className="flex gap-4"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mt-1">
                <SectionIcon className={`w-5 h-5 ${section.iconColor}`} />
              </div>
              <div className="space-y-3">
                {section.paragraphs.map((p, pIdx) => {
                  const isHighlight = p === "You." || p.startsWith("He turned garbage");
                  return (
                    <p
                      key={pIdx}
                      className={
                        isHighlight
                          ? "text-lg md:text-xl font-display text-amber-300/90 leading-relaxed"
                          : "text-base md:text-lg font-body text-white/60 leading-relaxed"
                      }
                    >
                      {p}
                    </p>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 1 }}
        className="mt-14 flex flex-col items-center gap-4"
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-emerald-300/70 font-body text-base italic">
            Earth does not need a hero seeking glory.
          </p>
          <p className="text-emerald-300/70 font-body text-base italic">
            It needs a keeper who never stops.
          </p>
        </div>

        <Link href="/">
          <Button
            size="lg"
            className="rounded-full font-display text-base tracking-widest border border-emerald-500/30 bg-emerald-600/80 text-white"
            data-testid="button-enter-game"
          >
            <Swords className="mr-2 h-5 w-5" />
            ENTER THE GAME
          </Button>
        </Link>
      </motion.div>

      <div className="fixed inset-0 z-[-1] bg-black/50" />
      <div className="fixed inset-0 z-[-2] opacity-20">
        <div
          className="w-full h-full"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, hsl(150, 20%, 8%) 0%, hsl(160, 10%, 3%) 60%, #000 100%)",
          }}
        />
      </div>
    </div>
  );
}
