import { motion } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Story() {
  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, 
      y: 0,
      transition: { delay: 0.5 + i * 0.3, duration: 1 }
    })
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-6 flex flex-col items-center justify-center max-w-4xl mx-auto relative">
      <div className="text-center space-y-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mx-auto w-20 h-20 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center mb-8 box-shadow-glow"
        >
          <BookOpen className="w-10 h-10 text-accent" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent via-white to-accent pb-2"
        >
          The Beginning
        </motion.h1>

        <div className="space-y-8 text-lg md:text-2xl font-body leading-relaxed text-white/80 max-w-3xl mx-auto text-justify md:text-center">
          <motion.p custom={0} variants={textVariants} initial="hidden" animate="visible">
            Before the cities rose, the world breathed as one. The roots connected every tree, every stone, every river in a silent song of life.
          </motion.p>
          
          <motion.p custom={1} variants={textVariants} initial="hidden" animate="visible">
            But the silence has been broken. A dark corruption seeps from the forgotten places, turning green to grey and water to dust. The song is fading.
          </motion.p>
          
          <motion.p custom={2} variants={textVariants} initial="hidden" animate="visible" className="text-accent/90 italic border-l-4 border-accent/50 pl-6 md:border-l-0 md:pl-0">
            "Only one who listens can hear the final verse. Only one who cares can sing it back."
          </motion.p>
          
          <motion.p custom={3} variants={textVariants} initial="hidden" animate="visible">
            You have been awakened. The forest has granted you its last strength. You are the Earth Keeper. Will you restore the balance?
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="pt-12"
        >
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg px-8 py-6 rounded-full shadow-[0_0_30px_rgba(74,222,128,0.4)] hover:shadow-[0_0_50px_rgba(74,222,128,0.6)] transition-all">
              <Sparkles className="mr-2 h-5 w-5" />
              Accept Your Destiny
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Atmospheric overlay */}
      <div className="fixed inset-0 z-[-1] bg-black/40" />
      
      {/* Background Image */}
      {/* Old tree roots or ancient forest */}
      <div className="fixed inset-0 z-[-2] opacity-30">
        <img 
          src="https://pixabay.com/get/ge3a217683e933a6b1d3523f950ab6a53fbb8f51d6223007e91926b7ffc58491b7fdd5bae8e205fe62487d746fc112a96d85daf7086688e3bd991650d1f6f50d9_1280.jpg"
          alt="Ancient Tree Roots"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
