import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skull, CircleCheck, CircleX, RotateCcw, Home, Sparkles, Globe, AlertTriangle } from "lucide-react";

interface MalakarQuizProps {
  onPass: () => void;
  onPlayAgain: () => void;
  onExit: () => void;
}

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTION_POOL: Question[] = [
  { question: "What percentage of Earth's surface is covered by water?", options: ["50%", "61%", "71%", "85%"], correctIndex: 2 },
  { question: "Which gas makes up most of Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correctIndex: 2 },
  { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correctIndex: 3 },
  { question: "How many trees are estimated to exist on Earth?", options: ["3 billion", "30 billion", "300 billion", "3 trillion"], correctIndex: 3 },
  { question: "What is the deepest point in the ocean called?", options: ["Mariana Trench", "Tonga Trench", "Java Trench", "Puerto Rico Trench"], correctIndex: 0 },
  { question: "Which rainforest produces about 20% of the world's oxygen?", options: ["Congo", "Amazon", "Daintree", "Tongass"], correctIndex: 1 },
  { question: "How old is Earth approximately?", options: ["2.5 billion years", "4.5 billion years", "6.5 billion years", "10 billion years"], correctIndex: 1 },
  { question: "What is the most abundant element in Earth's crust?", options: ["Iron", "Silicon", "Oxygen", "Aluminum"], correctIndex: 2 },
  { question: "Which layer of the atmosphere protects us from UV radiation?", options: ["Troposphere", "Stratosphere (Ozone)", "Mesosphere", "Thermosphere"], correctIndex: 1 },
  { question: "What percentage of Earth's water is freshwater?", options: ["About 3%", "About 10%", "About 25%", "About 50%"], correctIndex: 0 },
  { question: "What is the longest river on Earth?", options: ["Amazon", "Yangtze", "Nile", "Mississippi"], correctIndex: 2 },
  { question: "How many species are estimated to live on Earth?", options: ["1 million", "8.7 million", "50 million", "100 million"], correctIndex: 1 },
  { question: "What causes the seasons on Earth?", options: ["Distance from the Sun", "Earth's tilted axis", "The Moon's gravity", "Solar winds"], correctIndex: 1 },
  { question: "Which continent has the most biodiversity?", options: ["Asia", "Africa", "South America", "Australia"], correctIndex: 2 },
  { question: "What is the tallest mountain on Earth measured from base to peak?", options: ["Mount Everest", "K2", "Mauna Kea", "Kilimanjaro"], correctIndex: 2 },
];

function pickRandomQuestions(count: number): Question[] {
  const shuffled = [...QUESTION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type Phase = "narrative" | "quiz" | "result";

export function MalakarQuiz({ onPass, onPlayAgain, onExit }: MalakarQuizProps) {
  const [phase, setPhase] = useState<Phase>("narrative");
  const [narrativePage, setNarrativePage] = useState(0);
  const [questions] = useState(() => pickRandomQuestions(5));
  const [currentQ, setCurrentQ] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [passed, setPassed] = useState(false);

  const narrativePages = [
    {
      text: "Darkness swallowed you whole. When you opened your eyes, you found yourself in a twisted, shimmering dimension of floating rocks and violet skies.",
    },
    {
      text: '"You defeated me, hero," he rasped, his voice echoing in the strange space. "But as I fell, I realized something... true victory without struggle tastes like ashes. Empty. Bitter."',
    },
    {
      text: '"I could simply destroy you now. But where\'s the flavor in that? Instead, let\'s play a final game. You fought so hard for Earth\u2014let\'s see how well you actually know it."',
    },
    {
      text: '"Five questions about the world you sacrificed so much to save. Answer four correctly, and I\'ll return you to your precious Earth. But... if you miss even two... you\'ll remain here with me forever."',
    },
  ];

  const handleAnswer = useCallback((index: number) => {
    if (answerRevealed) return;
    setSelectedAnswer(index);
    setAnswerRevealed(true);

    const isCorrect = index === questions[currentQ].correctIndex;
    const newCorrect = correctCount + (isCorrect ? 1 : 0);
    const newWrong = wrongCount + (isCorrect ? 0 : 1);

    setTimeout(() => {
      setCorrectCount(newCorrect);
      setWrongCount(newWrong);

      if (currentQ < 4) {
        if (newWrong >= 2) {
          setPassed(false);
          setPhase("result");
        } else if (newCorrect >= 4) {
          setPassed(true);
          setPhase("result");
        } else {
          setCurrentQ(c => c + 1);
          setSelectedAnswer(null);
          setAnswerRevealed(false);
        }
      } else {
        const didPass = newCorrect >= 4;
        setPassed(didPass);
        setPhase("result");
      }
    }, 1500);
  }, [answerRevealed, currentQ, correctCount, wrongCount, questions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-40 flex flex-col items-center justify-center p-4 text-center overflow-y-auto"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(76,29,149,0.4) 0%, rgba(0,0,0,0.92) 100%)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === "narrative" && (
          <motion.div
            key="narrative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center max-w-lg w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="relative mb-6"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center border border-purple-400/30"
                style={{
                  background: 'linear-gradient(135deg, rgba(76,29,149,0.6) 0%, rgba(109,40,217,0.3) 100%)',
                  boxShadow: '0 0 60px rgba(139,92,246,0.2)',
                }}
              >
                <Skull className="w-10 h-10 text-purple-300" style={{ filter: 'drop-shadow(0 0 12px rgba(139,92,246,0.5))' }} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="absolute -inset-4 rounded-3xl border border-purple-500/10"
              />
            </motion.div>

            <p className="text-[10px] tracking-[0.5em] uppercase font-display text-purple-400/60 mb-3">Dr. Alistair Malakar</p>

            <AnimatePresence mode="wait">
              <motion.div
                key={narrativePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8"
              >
                <p className="text-white/80 font-body text-sm md:text-base leading-relaxed italic px-4">
                  {narrativePages[narrativePage].text}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 mb-6">
              {narrativePages.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i === narrativePage ? 'bg-purple-400' : i < narrativePage ? 'bg-purple-400/40' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={() => {
                if (narrativePage < narrativePages.length - 1) {
                  setNarrativePage(p => p + 1);
                } else {
                  setPhase("quiz");
                }
              }}
              className="px-6 rounded-lg bg-purple-600/70 text-white font-display text-xs tracking-widest border border-purple-500/30"
              data-testid="button-quiz-continue"
            >
              {narrativePage < narrativePages.length - 1 ? "Continue" : "Accept the Challenge"}
            </Button>
          </motion.div>
        )}

        {phase === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center max-w-lg w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <Skull className="w-5 h-5 text-purple-400/60" />
              <p className="text-[10px] tracking-[0.4em] uppercase font-display text-purple-300/50">
                Question {currentQ + 1} of 5
              </p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full border transition-all duration-300 ${
                  i < correctCount + wrongCount
                    ? i < correctCount
                      ? 'bg-emerald-400/60 border-emerald-400/30'
                      : 'bg-red-400/60 border-red-400/30'
                    : i === currentQ
                    ? 'border-purple-400/60 bg-purple-400/20'
                    : 'border-white/10 bg-white/[0.03]'
                }`} />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="w-full"
              >
                <div className="px-5 py-4 mb-5 rounded-xl border border-purple-400/15 bg-purple-500/[0.06]">
                  <Globe className="w-5 h-5 text-purple-300/50 mx-auto mb-2" />
                  <p className="text-white/90 font-body text-base leading-relaxed">
                    {questions[currentQ].question}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 w-full">
                  {questions[currentQ].options.map((option, i) => {
                    let borderColor = "border-white/[0.08]";
                    let bgColor = "bg-white/[0.03]";
                    let textColor = "text-white/70";

                    if (answerRevealed) {
                      if (i === questions[currentQ].correctIndex) {
                        borderColor = "border-emerald-400/40";
                        bgColor = "bg-emerald-500/10";
                        textColor = "text-emerald-300";
                      } else if (i === selectedAnswer && i !== questions[currentQ].correctIndex) {
                        borderColor = "border-red-400/40";
                        bgColor = "bg-red-500/10";
                        textColor = "text-red-300";
                      }
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={answerRevealed}
                        className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgColor} ${textColor} text-left font-body text-sm transition-all duration-200 ${
                          !answerRevealed ? 'hover-elevate cursor-pointer' : ''
                        }`}
                        data-testid={`button-answer-${i}`}
                      >
                        <span className="text-white/20 font-display text-xs mr-3">{String.fromCharCode(65 + i)}.</span>
                        {option}
                        {answerRevealed && i === questions[currentQ].correctIndex && (
                          <CircleCheck className="w-4 h-4 text-emerald-400 inline ml-2" />
                        )}
                        {answerRevealed && i === selectedAnswer && i !== questions[currentQ].correctIndex && (
                          <CircleX className="w-4 h-4 text-red-400 inline ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-5 flex items-center gap-4 text-[9px] font-display tracking-widest uppercase">
              <span className="text-emerald-400/60">{correctCount} Correct</span>
              <span className="text-white/10">|</span>
              <span className="text-red-400/60">{wrongCount} Wrong</span>
              <span className="text-white/10">|</span>
              <span className="text-white/30">Need 4 to pass</span>
            </div>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
            className="flex flex-col items-center max-w-lg w-full"
          >
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative mb-6"
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${
                passed ? 'border-emerald-400/30' : 'border-red-400/30'
              }`}
                style={{
                  background: passed
                    ? 'linear-gradient(135deg, rgba(6,78,59,0.6) 0%, rgba(22,101,52,0.4) 100%)'
                    : 'linear-gradient(135deg, rgba(127,29,29,0.6) 0%, rgba(153,27,27,0.3) 100%)',
                  boxShadow: passed
                    ? '0 0 60px rgba(74,222,128,0.2)'
                    : '0 0 60px rgba(248,113,113,0.2)',
                }}
              >
                {passed ? (
                  <Sparkles className="w-10 h-10 text-emerald-300" style={{ filter: 'drop-shadow(0 0 12px rgba(74,222,128,0.4))' }} />
                ) : (
                  <AlertTriangle className="w-10 h-10 text-red-300" style={{ filter: 'drop-shadow(0 0 12px rgba(248,113,113,0.4))' }} />
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className={`text-[10px] tracking-[0.5em] uppercase font-display mb-2 ${
                passed ? 'text-emerald-400/50' : 'text-red-400/50'
              }`}>
                {passed ? "You Passed" : "You Failed"}
              </p>
              <h2 className="text-3xl md:text-4xl font-display text-white/95 mb-2 tracking-tight">
                {passed ? "Freedom Earned" : "Trapped Forever"}
              </h2>
              <p className={`font-body text-sm mb-6 max-w-sm mx-auto ${
                passed ? 'text-emerald-300/60' : 'text-red-300/60'
              }`}>
                {passed
                  ? "Malakar's form shattered into light. You proved your devotion to Earth\u2014not just with strength, but with knowledge. The portal opens. Welcome home, Keeper."
                  : "Malakar's laughter echoes through the void. \"You fought for a world you barely understand.\" The dimension closes around you. Earth fades from memory..."
                }
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-3 mb-6 px-4 py-2 bg-white/[0.03] rounded-lg border border-white/[0.06]"
            >
              <span className="text-emerald-400 font-display text-lg">{correctCount}</span>
              <span className="text-white/20 text-xs font-display">correct</span>
              <span className="text-white/10">|</span>
              <span className="text-red-400 font-display text-lg">{wrongCount}</span>
              <span className="text-white/20 text-xs font-display">wrong</span>
              <span className="text-white/10">|</span>
              <span className="text-white/30 text-xs font-display">out of 5</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-2"
            >
              {passed ? (
                <Button onClick={onPass} className="px-5 rounded-lg bg-emerald-600/80 text-white font-display text-xs tracking-widest border border-emerald-500/30" data-testid="button-return-earth">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  RETURN TO EARTH
                </Button>
              ) : (
                <Button onClick={onPlayAgain} className="px-5 rounded-lg bg-purple-600/70 text-white font-display text-xs tracking-widest border border-purple-500/30" data-testid="button-try-again-quiz">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  TRY AGAIN
                </Button>
              )}
              <Button variant="ghost" onClick={onExit} className="px-5 rounded-lg text-white/50 font-display text-xs tracking-widest border border-white/[0.06]" data-testid="button-quiz-exit">
                <Home className="w-3.5 h-3.5 mr-1.5" />
                EXIT
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`malakar-particle-${i}`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              y: [Math.random() * 500, -(Math.random() * 300)],
              x: [(Math.random() - 0.5) * 150, (Math.random() - 0.5) * 250],
            }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeOut",
            }}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${50 + Math.random() * 50}%`,
              width: `${2 + Math.random() * 2}px`,
              height: `${2 + Math.random() * 2}px`,
              backgroundColor: i % 2 === 0 ? 'rgba(139,92,246,0.4)' : 'rgba(192,132,252,0.3)',
              boxShadow: `0 0 6px rgba(139,92,246,0.2)`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
