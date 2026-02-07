import { motion } from "framer-motion";
import { BookOpen, Globe, Skull, Shield, AlertTriangle, Leaf, Crosshair, Swords, Flame, Wind, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const STORY_SECTIONS = [
  {
    title: "A Dying World",
    icon: Globe,
    iconColor: "text-blue-400",
    iconGlow: "rgba(96,165,250,0.15)",
    borderColor: "border-blue-500/10",
    paragraphs: [
      "Far beyond Earth, in a corner of space no telescope could reach, there existed a planet called Draxxon. Once, it was alive. Green lands stretched for miles, rivers ran clear, and the air carried the scent of wildflowers.",
      "But its people grew careless. Factories rose like mountains. Waste was dumped into rivers, buried under soil, launched into orbit. The oceans turned black. The skies went grey. Within a few generations, Draxxon became a graveyard of its own making.",
      "The last ruler of Draxxon was a figure known only as The Collector. He watched his world rot beneath him, and instead of feeling regret, he felt rage.",
    ],
  },
  {
    title: "The Collector",
    icon: Skull,
    iconColor: "text-red-400",
    iconGlow: "rgba(248,113,113,0.15)",
    borderColor: "border-red-500/10",
    paragraphs: [
      "The Collector was not born evil. He was born desperate. As the last leader of a planet that destroyed itself, he carried the weight of billions of souls lost to pollution, neglect, and greed.",
      "He believed the universe owed him a new world. And when his scanners found Earth, a planet still green, still breathing, still alive, he did not feel wonder. He felt envy.",
      "\"If my world cannot live,\" he whispered to the void, \"then neither shall theirs.\"",
      "He began to engineer something terrible: a weapon made not of fire or steel, but of garbage. The very waste that killed Draxxon would now be aimed at Earth.",
    ],
  },
  {
    title: "The Ultimatum",
    icon: Shield,
    iconColor: "text-amber-400",
    iconGlow: "rgba(251,191,36,0.15)",
    borderColor: "border-amber-500/10",
    paragraphs: [
      "A signal was sent across the stars. Not a greeting, not a warning, but a demand.",
      "\"Surrender your resources. Your water. Your soil. Your wealth. Give us a new home, or we will bury yours in the filth of ours.\"",
      "The message was received by no government, no military, no leader. It was received by the planet itself. Earth did not respond with words. It did not negotiate. It did not beg.",
      "Earth's silence was not weakness. It was dignity. A living planet does not bargain with those who destroy life.",
    ],
  },
  {
    title: "The Attack Begins",
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    iconGlow: "rgba(251,146,60,0.15)",
    borderColor: "border-orange-500/10",
    paragraphs: [
      "The Collector's patience ended. From Draxxon's orbit, massive cannons began firing. Not missiles. Not bombs. Something far more insidious.",
      "Compressed garbage, industrial waste, toxic chemicals, broken machinery, everything Draxxon could no longer contain was aimed at Earth and launched at terrifying speed.",
      "The debris entered Earth's atmosphere silently. No explosions. No alarms. Just a slow, steady rain of pollution falling across forests, settling into oceans, coating cities in a thin layer of filth that nobody could explain.",
      "People noticed the rivers getting murkier. The air tasting different. Fish washing up on shores. Trees browning in summer. But nobody looked up. Nobody knew the sky was poisoned.",
      "The Collector watched from orbit, smiling. \"They don't even know it's happening.\"",
    ],
  },
  {
    title: "The Planet Fights Back",
    icon: Leaf,
    iconColor: "text-emerald-400",
    iconGlow: "rgba(52,211,153,0.15)",
    borderColor: "border-emerald-500/10",
    paragraphs: [
      "But Earth was not defenseless. Not truly.",
      "Deep within its core, in a place where roots reach down through millennia of stone, where water flows through channels older than any civilization, something stirred.",
      "Earth had always had protectors. Not soldiers. Not machines. Beings woven from the fabric of nature itself, keepers who exist between the trees and the wind, between the rivers and the mountains.",
      "For centuries they had slept, because Earth was safe. The balance held. Humans made mistakes, but the planet endured.",
      "Now, for the first time in recorded memory, Earth called upon its keeper.",
    ],
  },
  {
    title: "You",
    icon: Eye,
    iconColor: "text-emerald-300",
    iconGlow: "rgba(110,231,183,0.2)",
    borderColor: "border-emerald-400/15",
    paragraphs: [
      "You were chosen. Not for strength. Not for speed. Not for fame.",
      "You were chosen because you care.",
      "The Earth Keeper is not a warrior in the traditional sense. You carry no sword, wear no armor. Instead, you carry the will of a living planet. You shoot seeds of purification that destroy garbage on contact. You catch falling waste in containers that neutralize toxins.",
      "Your existence is a secret. The people of Earth will never know your name. They will never see you standing in the sky, intercepting waves of trash before it reaches the ground.",
      "And that is exactly how it should be. Earth does not need a hero seeking glory. It needs a keeper who never stops.",
    ],
  },
  {
    title: "The Silent War",
    icon: Crosshair,
    iconColor: "text-amber-300",
    iconGlow: "rgba(252,211,77,0.15)",
    borderColor: "border-amber-400/10",
    paragraphs: [
      "Every night, the sky fills with garbage launched from Draxxon. Each wave is stronger than the last. The Collector adapts, sending faster projectiles, toxic variants, heavier loads.",
      "You stand alone in the atmosphere, between the stars and the soil. Your seeds fire upward, purifying what they touch. Your container catches what slips through. The wind pushes the garbage sideways, making your job harder.",
      "Some garbage carries toxic chemicals, the kind that can poison an entire river if it reaches the ground. These glow red, and destroying them takes precision.",
      "Power-ups appear in the debris field: shields to protect you, energy beams for rapid fire, time-slow effects to give you breathing room, and seed bursts that clear the entire sky in one flash of green light.",
    ],
  },
  {
    title: "The Stakes",
    icon: Flame,
    iconColor: "text-red-300",
    iconGlow: "rgba(252,165,165,0.15)",
    borderColor: "border-red-400/10",
    paragraphs: [
      "Every piece of garbage that slips past you damages the planet. Health drops. The sky darkens. The forest below you begins to wilt.",
      "But every piece you destroy gives Earth another breath. Every second you survive secures a future. The combo system rewards precision: chain your hits, keep your streak alive, and the multiplier grows.",
      "At 10 consecutive hits, you earn a streak bonus. At 20, the bonus doubles. At 30, you become unstoppable, and the sky briefly glows gold.",
      "Near-misses count too. When garbage falls just barely past your container, your reflexes are acknowledged. A close call is still a sign of skill.",
    ],
  },
  {
    title: "The Collector Watches",
    icon: Wind,
    iconColor: "text-teal-300",
    iconGlow: "rgba(94,234,212,0.15)",
    borderColor: "border-teal-400/10",
    paragraphs: [
      "The Collector is not finished. He never will be. As you progress through the levels, from Awakening to Gaia's Chosen, his attacks intensify.",
      "Wind patterns shift, pushing garbage in unpredictable directions. New types of waste appear: e-waste with circuit boards, oil drums that leave dark trails, compressed barrels that fall faster than anything else.",
      "He watches your every move, adjusting his strategy. But he underestimates one thing: the keeper does not tire. The keeper does not give up.",
      "What falls today is what we leave behind tomorrow. And the keeper ensures that nothing falls.",
    ],
  },
];

export default function Story() {
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-[-2]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, hsl(150, 25%, 10%) 0%, hsl(160, 15%, 4%) 40%, #000 100%)",
        }}
      />
      <div className="fixed inset-0 z-[-1] bg-black/40" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center mb-16"
        >
          <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "radial-gradient(circle, rgba(74,222,128,0.12) 0%, transparent 70%)",
              boxShadow: "0 0 40px rgba(74,222,128,0.08)",
            }}
          >
            <BookOpen className="w-7 h-7 text-emerald-400/70" />
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-bold text-white/90 tracking-tight mb-4">
            A Silent War
          </h1>
          <p className="text-lg md:text-xl font-display text-white/30 tracking-wide mb-6">
            for a Living Planet
          </p>

          <div className="w-20 h-px mx-auto bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-6" />

          <p className="text-white/35 font-body text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Somewhere beyond the stars, a dying world turned its rage toward Earth.
            This is the story of how the planet chose its secret protector, and the silent war
            that no one was ever meant to see.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.06] via-white/[0.04] to-transparent" />

          <div className="space-y-8">
            {STORY_SECTIONS.map((section, sIdx) => {
              const SectionIcon = section.icon;
              return (
                <motion.div
                  key={sIdx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + sIdx * 0.1, duration: 0.6 }}
                  className="relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-white/[0.08]"
                      style={{
                        background: `radial-gradient(circle, ${section.iconGlow} 0%, rgba(0,0,0,0.6) 100%)`,
                        boxShadow: `0 0 20px ${section.iconGlow}`,
                      }}
                    >
                      <SectionIcon className={`w-4 h-4 ${section.iconColor}`} />
                    </div>

                    <div className={`flex-1 rounded-xl p-5 md:p-6 bg-white/[0.02] backdrop-blur-sm border ${section.borderColor}`}
                      style={{
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.2)`,
                      }}
                    >
                      <h2 className="text-lg md:text-xl font-display text-white/75 tracking-tight mb-4">{section.title}</h2>
                      <div className="space-y-3">
                        {section.paragraphs.map((p, pIdx) => {
                          const isQuote = p.startsWith("\"");
                          const isHighlight = p === "You were chosen because you care." || p === "But Earth was not defenseless. Not truly.";
                          return (
                            <p
                              key={pIdx}
                              className={
                                isQuote
                                  ? "text-sm md:text-base font-body text-amber-300/60 leading-relaxed italic pl-3 border-l-2 border-amber-400/20"
                                  : isHighlight
                                  ? "text-sm md:text-base font-display text-emerald-300/70 leading-relaxed"
                                  : "text-sm md:text-base font-body text-white/40 leading-relaxed"
                              }
                              data-testid={`text-story-paragraph-${sIdx}-${pIdx}`}
                            >
                              {p}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
          className="mt-20 flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)",
            }}
          >
            <Sparkles className="w-5 h-5 text-emerald-400/30" />
          </div>

          <div className="text-center mb-8">
            <p className="text-emerald-300/50 font-body text-base italic leading-relaxed">
              Earth does not need a hero seeking glory.
            </p>
            <p className="text-emerald-300/50 font-body text-base italic leading-relaxed">
              It needs a keeper who never stops.
            </p>
          </div>

          <Link href="/">
            <Button
              size="lg"
              className="rounded-full font-display text-sm tracking-[0.2em] uppercase border border-emerald-500/25 bg-emerald-600/70 text-white/90"
              data-testid="button-enter-game"
            >
              <Swords className="mr-2 h-4 w-4" />
              ENTER THE GAME
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
