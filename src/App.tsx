/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RefreshCcw, Users, Swords } from 'lucide-react';

interface Problem {
  id: number;
  question: string;
  answer: number;
  options: number[];
}

// Helper component for the characters
function Character({ side, pulling, isGirl }: { side: 'blue' | 'red', pulling: boolean, isGirl?: boolean }) {
  return (
    <motion.div
      animate={{ 
        rotate: pulling ? (side === 'blue' ? -12 : 12) : 0,
        x: pulling ? (side === 'blue' ? -10 : 10) : 0,
        scale: pulling ? 1.05 : 1
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="relative flex flex-col items-center"
    >
      {/* Hair / Head Accessories */}
      <div className="absolute -top-4 w-full flex justify-center z-20">
        {isGirl ? (
          /* Modern Girl Hair (Pony tails) */
          <div className="relative w-12 flex justify-between h-4">
            <div className="w-5 h-5 bg-amber-800 rounded-full shadow-sm" />
            <div className="w-5 h-5 bg-amber-800 rounded-full shadow-sm" />
            <div className="absolute -top-1 left-0 w-2.5 h-2.5 bg-pink-400 rounded-full border border-pink-600" />
            <div className="absolute -top-1 right-0 w-2.5 h-2.5 bg-pink-400 rounded-full border border-pink-600" />
          </div>
        ) : (
          /* Modern Boy Hair */
          <div className="w-11 h-6 bg-slate-800 rounded-t-[20px] rounded-br-[10px] -mb-1 shadow-sm" />
        )}
      </div>

      {/* Head with facial features */}
      <div className={`w-12 h-12 rounded-[18px] border-2 ${side === 'blue' ? 'border-slate-800' : 'border-pink-600'} bg-[#FFDBAC] shadow-lg mb-1 z-10 flex flex-col items-center justify-center gap-1`}>
        <div className="flex gap-2.5">
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
        </div>
        <div className="w-3.5 h-1.5 border-b-2 border-slate-900/40 rounded-full" />
      </div>
      
      {/* Body / Detailed Clothes */}
      {isGirl ? (
        /* Modern Dress (Kóylak) */
        <div className="relative flex flex-col items-center">
          <div className="w-12 h-16 bg-pink-500 rounded-t-2xl rounded-b-[40px] shadow-md border-b-4 border-pink-700 relative overflow-hidden">
             {/* Small pattern */}
             <div className="absolute top-4 left-2 w-2 h-2 bg-white/20 rounded-full" />
             <div className="absolute top-10 left-8 w-2 h-2 bg-white/20 rounded-full" />
             <div className="absolute top-7 left-4 w-1.5 h-1.5 bg-white/10 rounded-full" />
          </div>
        </div>
      ) : (
        /* Modern Suit (Kastyum-shim) */
        <div className="w-11 h-16 bg-slate-900 rounded-xl relative overflow-hidden flex flex-col items-center shadow-md border-b-4 border-slate-950">
          {/* Shirt and Tie */}
          <div className="w-6 h-7 bg-white relative mt-[-2px] flex flex-col items-center">
            <div className="w-full h-full bg-white absolute inset-0" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            <div className="w-1.5 h-5 bg-blue-600 rounded-sm mt-1 z-10" />
          </div>
          {/* Jacket buttons */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
            <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
          </div>
        </div>
      )}

      {/* Dynamic Arms */}
      <div className={`absolute top-14 w-18 h-4 ${side === 'blue' ? 'bg-slate-800 -left-12 rotate-[15deg]' : 'bg-pink-400 -right-12 -rotate-[15deg]'} rounded-full border-b-2 border-black/20 z-0`} />
      
      {/* Legs & Shoes */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className={`w-3.5 h-14 ${side === 'blue' ? 'bg-slate-950' : 'bg-pink-900'} rounded-full rotate-[8deg] origin-top shadow-sm`} />
          <div className="w-6 h-3 bg-slate-900 rounded-full mt-[-6px] shadow-md" />
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-3.5 h-14 ${side === 'blue' ? 'bg-slate-950' : 'bg-pink-900'} rounded-full -rotate-[8deg] origin-top shadow-sm`} />
          <div className="w-6 h-3 bg-slate-900 rounded-full mt-[-6px] shadow-md" />
        </div>
      </div>
    </motion.div>
  );
}

export default function App() {
  const [ropePosition, setRopePosition] = useState(0); // -100 (Blue Wins) to 100 (Red Wins)
  const [leftProblem, setLeftProblem] = useState<Problem | null>(null);
  const [rightProblem, setRightProblem] = useState<Problem | null>(null);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'won-blue' | 'won-red'>('lobby');
  const [scores, setScores] = useState({ blue: 0, red: 0 });
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [pullSide, setPullSide] = useState<'blue' | 'red' | null>(null);

  const createSingleProblem = () => {
    const type = Math.random();
    let num1, num2, answer, question;

    if (type < 0.4) { // Addition
      num1 = Math.floor(Math.random() * 50) + 10;
      num2 = Math.floor(Math.random() * 50) + 10;
      answer = num1 + num2;
      question = `${num1} + ${num2}`;
    } else if (type < 0.7) { // Subtraction
      num1 = Math.floor(Math.random() * 80) + 20;
      num2 = Math.floor(Math.random() * (num1 - 5)) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2}`;
    } else { // Multiplication
      num1 = Math.floor(Math.random() * 8) + 2;
      num2 = Math.floor(Math.random() * 8) + 2;
      answer = num1 * num2;
      question = `${num1} × ${num2}`;
    }

    const options = new Set<number>();
    options.add(answer);
    while (options.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const fake = Math.abs(answer + offset);
      if (offset !== 0 && !options.has(fake)) options.add(fake);
    }

    return {
      id: Math.random(),
      question,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  };

  const refreshProblems = useCallback(() => {
    setLeftProblem(createSingleProblem());
    setRightProblem(createSingleProblem());
  }, []);

  useEffect(() => {
    refreshProblems();
  }, [refreshProblems]);

  const handleAnswer = (side: 'blue' | 'red', selected: number) => {
    if (gameState !== 'playing') return;

    const currentProblem = side === 'blue' ? leftProblem : rightProblem;
    if (!currentProblem) return;

    if (selected === currentProblem.answer) {
      setPullSide(side);
      const pullForce = side === 'blue' ? -20 : 20;
      const newPos = Math.min(Math.max(ropePosition + pullForce, -100), 100);
      
      setRopePosition(newPos);
      setScores(prev => ({ ...prev, [side]: prev[side as 'blue' | 'red'] + 1 }));
      setTotalCorrect(prev => prev + 1);

      if (newPos <= -100) setGameState('won-blue');
      if (newPos >= 100) setGameState('won-red');

      if (side === 'blue') setLeftProblem(createSingleProblem());
      else setRightProblem(createSingleProblem());

      setTimeout(() => setPullSide(null), 400);
    } else {
      const penaltyForce = side === 'blue' ? 15 : -15;
      const newPos = Math.min(Math.max(ropePosition + penaltyForce, -100), 100);
      setRopePosition(newPos);
      
      if (side === 'blue') setLeftProblem(createSingleProblem());
      else setRightProblem(createSingleProblem());
    }
  };

  const resetGame = () => {
    setRopePosition(0);
    setGameState('lobby');
    setScores({ blue: 0, red: 0 });
    setTotalCorrect(0);
    refreshProblems();
  };

  return (
    <div className="min-h-screen bg-sky-100 text-slate-800 font-sans flex flex-col items-center justify-center p-4">
      {/* Background Decor */}
      <div className="fixed bottom-0 inset-x-0 h-1/4 bg-green-500 z-0 border-t-8 border-green-600" />
      <div className="fixed top-20 right-20 w-32 h-32 bg-yellow-300 rounded-full blur-xl opacity-40 animate-pulse" />
      
      <div className="max-w-6xl w-full flex flex-col gap-6 relative z-10">
        <header className="text-center flex flex-col items-center gap-1">
          <div className="bg-white/80 px-6 py-1.5 rounded-full text-sm font-black tracking-widest uppercase text-blue-600 border-2 border-blue-200 flex items-center gap-2 shadow-sm">
            <Swords size={18} /> MATEMATIKA BELLASHUVI
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-slate-900 drop-shadow-sm">
            O'g'il Bolalar <span className="text-blue-600">vs</span> Qizlar
          </h1>
        </header>

        {/* Tug of War Stage */}
        <div className="w-full relative h-56 flex items-end justify-center bg-white/40 rounded-[3rem] border-4 border-white/60 overflow-hidden backdrop-blur-sm pb-6 shadow-xl">
          {/* Win Markers */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-30">
            <Trophy size={48} className="text-blue-600" />
            <span className="font-black text-blue-600">MARRA</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-30">
            <Trophy size={48} className="text-pink-600" />
            <span className="font-black text-pink-600">MARRA</span>
          </div>
          
          {/* Central Line */}
          <div className="absolute left-1/2 h-full w-1 bg-white/60 -translate-x-1/2 dashed" />

          {/* Rope & Teams */}
          <motion.div 
            className="absolute bottom-16 w-full h-20 flex items-center justify-center"
            animate={{ x: (ropePosition / 100) * 250 }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          >
            {/* O'g'il bolalar (Chapda) */}
            <div className="flex gap-2 mr-1 items-end">
              <Character side="blue" pulling={pullSide === 'blue'} />
              <Character side="blue" pulling={pullSide === 'blue'} />
            </div>

            {/* Arqon */}
            <div className="w-[180px] h-4 bg-orange-800 rounded-full shadow-lg relative flex items-center justify-center border-2 border-orange-950">
               <div className="absolute w-6 h-14 bg-red-600 border-2 border-red-800 rounded-sm shadow-md" />
            </div>

            {/* Qiz bolalar (O'ngda) */}
            <div className="flex gap-2 ml-1 items-end">
              <Character side="red" isGirl pulling={pullSide === 'red'} />
              <Character side="red" isGirl pulling={pullSide === 'red'} />
            </div>
          </motion.div>
        </div>

        {/* Battle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TeamCard 
            side="blue" 
            label="O'g'il Bolalar"
            problem={leftProblem} 
            score={scores.blue}
            onAnswer={(ans) => handleAnswer('blue', ans)}
            isWinner={gameState === 'won-blue'}
            isPlaying={gameState === 'playing'}
          />

          <TeamCard 
            side="red" 
            label="Qiz Bolalar"
            problem={rightProblem} 
            score={scores.red}
            onAnswer={(ans) => handleAnswer('red', ans)}
            isWinner={gameState === 'won-red'}
            isPlaying={gameState === 'playing'}
          />
        </div>

        {/* Victory Screen / Start Screen */}
        <AnimatePresence>
          {gameState === 'lobby' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-6"
            >
              <motion.div 
                initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                className="bg-white p-12 rounded-[4rem] border-8 border-blue-400 flex flex-col items-center gap-8 shadow-2xl max-w-lg w-full text-center"
              >
                <div className="flex gap-4 items-end">
                   <Character side="blue" pulling={false} />
                   <div className="text-4xl font-black text-slate-800 self-center">VS</div>
                   <Character side="red" isGirl pulling={false} />
                </div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
                  MATEMATIKA JANGI!
                </h2>
                <button
                  onClick={() => setGameState('playing')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[2rem] font-black uppercase text-3xl shadow-[0_8px_0_rgb(29,78,216)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
                >
                  <RefreshCcw size={40} /> BOSHLASH!
                </button>
              </motion.div>
            </motion.div>
          )}

          {(gameState === 'won-blue' || gameState === 'won-red') && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-blue-900/60 backdrop-blur-xl p-6"
            >
              <motion.div 
                initial={{ scale: 0.5, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                className="bg-white p-12 rounded-[4rem] border-8 border-yellow-400 flex flex-col items-center gap-6 shadow-2xl max-w-lg w-full text-center"
              >
                <div className={`p-8 rounded-full ${gameState === 'won-blue' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                  <Trophy size={100} />
                </div>
                <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-900">
                  {gameState === 'won-blue' ? 'O\'G\'ILLAR G\'ALABASI!' : 'QIZLAR G\'ALABASI!'}
                </h2>
                <div className="text-2xl font-black text-slate-600">
                  Jami to'g'ri javoblar: <span className="text-slate-900">{totalCorrect}</span>
                </div>
                <button
                  onClick={resetGame}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-6 rounded-[2rem] font-black uppercase text-2xl shadow-[0_8px_0_rgb(202,138,4)] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
                >
                  <RefreshCcw size={32} /> QAYTA O'YNAYMIZ!
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center py-4 text-slate-600 font-bold tracking-tight">
          O'yin muallifi: <span className="text-slate-900">O'rolova Muxlisa</span>
        </footer>
      </div>
    </div>
  );
}

function TeamCard({ side, label, problem, score, onAnswer, isWinner, isPlaying }: {
  side: 'blue' | 'red',
  label: string,
  problem: Problem | null,
  score: number,
  onAnswer: (ans: number) => void,
  isWinner: boolean,
  isPlaying: boolean
}) {
  return (
    <div className={`
      relative bg-white border-4 rounded-[3rem] p-8 flex flex-col gap-6 shadow-xl transition-all
      ${side === 'blue' ? 'border-blue-500' : 'border-pink-500'}
      ${isWinner ? 'scale-105' : ''}
    `}>
      <header className="flex justify-between items-center bg-slate-50 p-4 rounded-3xl border-2 border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg
            ${side === 'blue' ? 'bg-blue-500' : 'bg-pink-500'}`}>
            {side === 'blue' ? 'O' : 'Q'}
          </div>
          <span className="font-black uppercase tracking-tight text-xl text-slate-800">{label}</span>
        </div>
        <div className="bg-slate-800 text-white px-5 py-2 rounded-2xl font-black text-2xl italic">
          {score}
        </div>
      </header>

      {isPlaying && (
        <div className="flex flex-col items-center gap-8 py-4">
          <div className="text-7xl font-black tracking-tight text-slate-900 tabular-nums">
            {problem?.question}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {problem?.options.map((opt, i) => (
              <button
                key={`${problem.id}-${i}`}
                onClick={() => onAnswer(opt)}
                className={`
                  py-8 rounded-[2rem] text-4xl font-black transition-all border-b-8 active:border-b-0 active:translate-y-2
                  ${side === 'blue' 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-700' 
                    : 'bg-pink-500 hover:bg-pink-600 text-white border-pink-700'
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

