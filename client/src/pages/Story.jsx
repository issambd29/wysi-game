import { motion } from "framer-motion";
import { BookOpen, Globe, Skull, Shield, AlertTriangle, Leaf, Crosshair, Swords, Flame, Wind, Sparkles, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const STORY_SECTIONS = [
  {
    title: "Chapter I: A Dying World",
    icon: Globe,
    iconColor: "text-blue-400",
    iconGlow: "rgba(96,165,250,0.15)",
    borderColor: "border-blue-500/10",
    paragraphs: [
      "Far beyond Earth, in a corner of space no telescope could reach, there existed a planet called Draxxon. Once, it was alive. Green lands stretched for miles, rivers ran clear, and the air carried the scent of wildflowers. Children played in forests that touched the clouds.",
      "But the people of Draxxon grew careless. Factories rose like mountains. Waste was dumped into rivers, buried under soil, launched into orbit. The oceans turned black. The skies went grey. Species vanished overnight. Within a few generations, Draxxon became a graveyard of its own making.",
      "The planet did not die in fire. It died slowly, choking on the mess its own children made. And when the last river dried and the last tree crumbled to dust, there was no one left to mourn, except one man.",
    ],
  },
  {
    title: "Chapter II: Dr. Alistair Malakar",
    icon: Skull,
    iconColor: "text-red-400",
    iconGlow: "rgba(248,113,113,0.15)",
    borderColor: "border-red-500/10",
    paragraphs: [
      "Dr. Alistair Malakar was not born evil. He was born brilliant. A scientist, an engineer, a visionary. He had warned Draxxon's leaders for decades that their waste would consume them. He built filtration systems, designed recycling plants, begged councils to change course. They laughed at him. Called him a fool.",
      "When Draxxon finally collapsed, Malakar was the only one who survived, sealed inside the bunker he had built to save thousands. But thousands never came. He sat alone in the dark, surrounded by the technology that could have saved a world, listening to the silence of extinction.",
      "Something broke inside him that day. The grief hardened into rage. The brilliance twisted into cruelty. He no longer wanted to save worlds. He wanted to punish them.",
      "\"If my world cannot live,\" he whispered to the void, \"then neither shall theirs.\"",
      "His scanners found Earth, a planet still green, still breathing, still alive. And instead of wonder, Dr. Malakar felt envy. He began to engineer something terrible: a weapon made not of fire or steel, but of garbage. The very waste that killed Draxxon would now be aimed at Earth.",
    ],
  },
  {
    title: "Chapter III: The Ultimatum",
    icon: Shield,
    iconColor: "text-amber-400",
    iconGlow: "rgba(251,191,36,0.15)",
    borderColor: "border-amber-500/10",
    paragraphs: [
      "From orbit, Malakar broadcast a signal across the stars. Not a greeting, not a warning, but a demand.",
      "\"Surrender your resources. Your water. Your soil. Your wealth. Give me a new home, or I will bury yours in the filth of mine. You have one rotation of your sun to comply.\"",
      "The message was received by no government, no military, no leader. It was received by the planet itself. Deep in the mantle, in places where magma meets ancient stone, Earth listened.",
      "Earth did not respond with words. It did not negotiate. It did not beg. The planet's silence was not weakness. It was dignity. A living world does not bargain with those who destroy life.",
      "Malakar waited. One day passed. Two. A week. Nothing. The silence enraged him more than any weapon could. \"So be it,\" he said, his voice cold. \"You chose this.\"",
    ],
  },
  {
    title: "Chapter IV: The Garbage Weapon",
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    iconGlow: "rgba(251,146,60,0.15)",
    borderColor: "border-orange-500/10",
    paragraphs: [
      "Malakar's patience ended. From Draxxon's orbit, he activated the weapon he had spent years building: massive electromagnetic cannons loaded not with missiles or bombs, but with something far more insidious.",
      "Compressed garbage. Industrial waste. Toxic chemicals. Broken machinery. Plastic that would never decompose. Oil that would poison rivers for centuries. E-waste leaking heavy metals. Everything Draxxon could no longer contain was aimed at Earth and launched at terrifying speed.",
      "The debris entered Earth's atmosphere silently. No explosions. No alarms. Just a slow, steady rain of pollution falling across forests, settling into oceans, coating cities in a thin layer of filth that nobody could explain.",
      "People noticed the rivers getting murkier. The air tasting different. Fish washing up on shores. Trees browning in summer. Birds falling mid-flight. But nobody looked up. Nobody knew the sky itself was poisoned.",
      "Malakar watched from orbit through his screens, a thin smile crossing his scarred face. \"They don't even know it's happening. Just like Draxxon. History always repeats.\"",
    ],
  },
  {
    title: "Chapter V: Earth Awakens",
    icon: Leaf,
    iconColor: "text-emerald-400",
    iconGlow: "rgba(52,211,153,0.15)",
    borderColor: "border-emerald-500/10",
    paragraphs: [
      "But Earth was not defenseless. Not truly.",
      "Deep within its core, in a place where roots reach down through millennia of stone, where water flows through channels older than any civilization, something stirred. A pulse. A heartbeat. The planet itself was waking up.",
      "Earth had always had protectors. Not soldiers. Not machines. Beings woven from the fabric of nature itself, keepers who exist between the trees and the wind, between the rivers and the mountains. They are born from the planet's will, given form by its need.",
      "For centuries they had slept, because Earth was safe. The balance held. Humans made mistakes, but the planet endured. The forests regrew. The oceans cleansed themselves. The cycle continued.",
      "Now, for the first time in recorded memory, the balance was under attack from beyond. A foreign poison fell from the sky, one that Earth's natural systems could not filter. The planet needed something it had not needed in an age.",
      "It needed its keeper.",
    ],
  },
  {
    title: "Chapter VI: The Chosen One",
    icon: Eye,
    iconColor: "text-emerald-300",
    iconGlow: "rgba(110,231,183,0.2)",
    borderColor: "border-emerald-400/15",
    paragraphs: [
      "You were chosen. Not for strength. Not for speed. Not for fame.",
      "You were chosen because you care. Because when you see a river choked with waste, something inside you aches. Because when you see a forest burning, you feel it in your bones. The planet knows its own.",
      "The Earth Keeper is not a warrior in the traditional sense. You carry no sword, wear no armor. Instead, you carry the will of a living planet. You fire seeds of purification that destroy garbage on contact, breaking down toxins into harmless particles that drift back to the soil. You catch falling waste in containers that neutralize poisons, turning Malakar's weapons into fertilizer.",
      "Your existence is a secret. The people of Earth will never know your name. They will never see you standing in the atmosphere, a lone figure between the stars and the soil, intercepting waves of trash before it reaches the ground below.",
      "And that is exactly how it should be. Earth does not need a hero seeking glory. It needs a keeper who never stops. A guardian who fights not for applause, but because every leaf, every river, every breath of wind deserves to live.",
    ],
  },
  {
    title: "Chapter VII: The Silent War",
    icon: Crosshair,
    iconColor: "text-amber-300",
    iconGlow: "rgba(252,211,77,0.15)",
    borderColor: "border-amber-400/10",
    paragraphs: [
      "And so the silent war began. Every night, the sky fills with garbage launched from Malakar's orbital cannons. Each wave is stronger than the last. He adapts, sending faster projectiles, toxic variants, heavier loads. He studies your patterns. He learns.",
      "You stand alone in the atmosphere, between the stars and the soil. Your seeds fire upward, purifying what they touch. Your container catches what slips through. The wind, Malakar's cruel ally, pushes the garbage sideways, making your job harder with every gust.",
      "Some garbage carries toxic chemicals, the kind that can poison an entire river if even a single drop reaches the ground. These glow red with warning, and destroying them takes precision and courage.",
      "But nature provides. Power-ups appear in the debris field, gifts from Earth itself: shields of living bark to protect you, energy beams of concentrated sunlight for rapid fire, time-slow effects drawn from the patience of ancient trees, and seed bursts that clear the entire sky in one flash of brilliant green light.",
    ],
  },
  {
    title: "Chapter VIII: The Levels of War",
    icon: Flame,
    iconColor: "text-red-300",
    iconGlow: "rgba(252,165,165,0.15)",
    borderColor: "border-red-400/10",
    paragraphs: [
      "The war unfolds in stages, each more desperate than the last. It begins with the Awakening, when the first debris falls and you learn your purpose. Then comes Rising Pollution, the Toxic Storm, Dark Currents, Acid Rain.",
      "By the time you reach Smog Siege and Chemical Tide, Malakar is throwing everything he has. The sky is thick with falling waste. The wind howls. Your container overflows with neutralized poison.",
      "Every piece of garbage that slips past you damages the planet. The sky darkens. The forest below you begins to wilt. Health drops. But every piece you destroy gives Earth another breath. Every second you survive secures a future.",
      "The combo system rewards precision: chain your hits, keep your streak alive, and the multiplier grows. At 10 consecutive hits, you earn a streak bonus and Earth's health surges. At 20, nature itself celebrates. At 30, you become unstoppable, a force of nature as old as the mountains.",
      "If you can survive long enough, you reach the final level: Gaia's Chosen. Here, the full might of Malakar's arsenal falls upon you. But if you endure, if you hold the line for just sixty seconds of total battle, the cannons overheat. The weapon fails. Earth is saved.",
    ],
  },
  {
    title: "Chapter IX: Malakar's Final Game",
    icon: Swords,
    iconColor: "text-purple-400",
    iconGlow: "rgba(192,132,252,0.15)",
    borderColor: "border-purple-500/10",
    paragraphs: [
      "But defeating the weapon is not the end. Malakar himself awaits.",
      "When the last cannon falls silent, a rift tears open in the sky. You are pulled through, into a twisted dimension of floating rocks and violet skies, Malakar's personal realm between the stars.",
      "He stands before you, broken but unbowed. His weapon is destroyed, but his mind remains sharp. And he has one last game to play.",
      "\"You fought so hard for Earth,\" he rasps, his voice echoing through the void. \"But do you truly know it? Do you understand the world you sacrificed so much to save? Five questions. Answer four correctly, and I return you to your precious planet. Fail, and you remain here with me forever.\"",
      "This is the Malakar Quiz, the final trial. Not of reflexes or speed, but of knowledge. A test of whether you truly understand the Earth you protect. Because a keeper who does not know their world cannot truly defend it.",
    ],
  },
  {
    title: "Chapter X: The Keeper's Oath",
    icon: Wind,
    iconColor: "text-teal-300",
    iconGlow: "rgba(94,234,212,0.15)",
    borderColor: "border-teal-400/10",
    paragraphs: [
      "If you pass Malakar's quiz, the dimension shatters. Light floods in. You are returned to Earth, and the portal seals behind you. Malakar's voice echoes one final time: \"I will return, keeper. I always return.\"",
      "And perhaps he will. Perhaps there will always be a Malakar, someone who destroys rather than builds, someone who turns waste into weapons. The threat changes its face, but it never truly disappears.",
      "That is why the keeper exists. Not for a single battle. Not for one villain. But for the eternal promise that as long as the Earth breathes, someone will stand between it and harm.",
      "You are the Earth Keeper. You carry no banner. You seek no reward. You simply stand in the gap, between the poison and the soil, between destruction and life, between the darkness above and the green below.",
      "And the keeper never stops.",
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-28">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6"
            style={{
              background: "radial-gradient(circle, rgba(74,222,128,0.15) 0%, transparent 70%)",
              boxShadow: "0 0 50px rgba(74,222,128,0.1), 0 0 15px rgba(74,222,128,0.05)",
            }}
          >
            <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400/60" />
          </div>

          <p className="text-[10px] md:text-xs font-sans uppercase tracking-[0.5em] text-emerald-400/40 mb-3 sm:mb-4">
            The Lore of Earth Keeper
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight mb-2 sm:mb-3">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50">A Silent War</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-display text-white/25 tracking-[0.15em] italic mb-6 sm:mb-8">
            for a Living Planet
          </p>

          <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-emerald-500/30" />
            <Leaf className="w-3 h-3 text-emerald-500/30" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-emerald-500/30" />
          </div>

          <p className="text-white/30 font-body text-sm sm:text-base md:text-lg leading-loose max-w-md mx-auto italic px-2">
            Somewhere beyond the stars, a dying world turned its rage toward Earth.
            This is the story of how the planet chose its secret protector, and the silent war
            that no one was ever meant to see.
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.06] via-white/[0.04] to-transparent hidden sm:block" />

          <div className="space-y-6 sm:space-y-8">
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
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="relative z-10 flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-white/[0.08]"
                      style={{
                        background: `radial-gradient(circle, ${section.iconGlow} 0%, rgba(0,0,0,0.6) 100%)`,
                        boxShadow: `0 0 20px ${section.iconGlow}`,
                      }}
                    >
                      <SectionIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${section.iconColor}`} />
                    </div>

                    <div className={`flex-1 rounded-xl p-4 sm:p-5 md:p-6 bg-white/[0.02] backdrop-blur-sm border ${section.borderColor}`}
                      style={{
                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.03), 0 4px 24px rgba(0,0,0,0.2)`,
                      }}
                    >
                      <h2 className="text-base sm:text-lg md:text-xl font-display text-white/75 tracking-tight mb-3 sm:mb-4">{section.title}</h2>
                      <div className="space-y-2.5 sm:space-y-3">
                        {section.paragraphs.map((p, pIdx) => {
                          const isQuote = p.startsWith("\"");
                          const isHighlight = p === "You were chosen because you care. Because when you see a river choked with waste, something inside you aches. Because when you see a forest burning, you feel it in your bones. The planet knows its own." || p === "But Earth was not defenseless. Not truly." || p === "It needed its keeper." || p === "And the keeper never stops.";
                          return (
                            <p
                              key={pIdx}
                              className={
                                isQuote
                                  ? "text-xs sm:text-sm md:text-base font-body text-amber-300/60 leading-relaxed italic pl-3 border-l-2 border-amber-400/20"
                                  : isHighlight
                                  ? "text-xs sm:text-sm md:text-base font-display text-emerald-300/70 leading-relaxed"
                                  : "text-xs sm:text-sm md:text-base font-body text-white/40 leading-relaxed"
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
          className="mt-14 sm:mt-20 flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-6"
            style={{
              background: "radial-gradient(circle, rgba(74,222,128,0.1) 0%, transparent 70%)",
            }}
          >
            <Sparkles className="w-5 h-5 text-emerald-400/30" />
          </div>

          <div className="text-center mb-8">
            <p className="text-emerald-300/50 font-body text-sm sm:text-base italic leading-relaxed">
              Earth does not need a hero seeking glory.
            </p>
            <p className="text-emerald-300/50 font-body text-sm sm:text-base italic leading-relaxed">
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
