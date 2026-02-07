import { motion } from "framer-motion";
import { BookOpen, Globe, Skull, Shield, AlertTriangle, Leaf, Crosshair, Swords, Flame, Mountain, Wind, Heart, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const STORY_SECTIONS = [
  {
    title: "A Dying World",
    icon: Globe,
    iconColor: "text-blue-400",
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
        className="text-white/40 font-body text-base leading-relaxed max-w-xl mb-12 text-center"
      >
        Somewhere beyond the stars, a dying world turned its rage toward Earth.
        This is the story of how the planet chose its secret protector, and the silent war
        that no one was ever meant to see.
      </motion.p>

      <div className="space-y-12 w-full">
        {STORY_SECTIONS.map((section, sIdx) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + sIdx * 0.15, duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <SectionIcon className={`w-5 h-5 ${section.iconColor}`} />
                </div>
                <h2 className="text-xl md:text-2xl font-display text-white/80 tracking-tight">{section.title}</h2>
              </div>
              <div className="space-y-3 pl-[52px]">
                {section.paragraphs.map((p, pIdx) => {
                  const isQuote = p.startsWith("\"");
                  const isHighlight = p === "You were chosen because you care." || p === "But Earth was not defenseless. Not truly.";
                  return (
                    <p
                      key={pIdx}
                      className={
                        isQuote
                          ? "text-base md:text-lg font-body text-amber-300/70 leading-relaxed italic"
                          : isHighlight
                          ? "text-base md:text-lg font-display text-emerald-300/80 leading-relaxed"
                          : "text-base md:text-lg font-body text-white/50 leading-relaxed"
                      }
                      data-testid={`text-story-paragraph-${sIdx}-${pIdx}`}
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
        transition={{ delay: 2.5, duration: 1 }}
        className="mt-16 flex flex-col items-center gap-4"
      >
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mb-2" />

        <div className="flex flex-col items-center gap-2 text-center">
          <Sparkles className="w-5 h-5 text-emerald-400/40 mb-1" />
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
            className="rounded-full font-display text-base tracking-widest border border-emerald-500/30 bg-emerald-600/80 text-white mt-4"
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
