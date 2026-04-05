/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, RotateCcw, History, Trash2, Plus, Minus } from 'lucide-react';

// Dice Face Component
const DiceFace = ({ value }: { value: number }) => {
  const dots = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  }[value as 1 | 2 | 3 | 4 | 5 | 6] || [];

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 p-2 w-full h-full bg-white rounded-xl shadow-inner border-2 border-gray-100">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {dots.includes(i) && (
            <div className="w-2.5 h-2.5 bg-gray-800 rounded-full shadow-sm" />
          )}
        </div>
      ))}
    </div>
  );
};

// Individual Dice Component with Animation
const Dice = ({ value, rolling }: { value: number; rolling: boolean }) => {
  return (
    <motion.div
      animate={
        rolling
          ? {
              rotateX: [0, 90, 180, 270, 360],
              rotateY: [0, 180, 360, 540, 720],
              scale: [1, 1.2, 1],
              y: [0, -20, 0],
            }
          : { rotateX: 0, rotateY: 0, scale: 1, y: 0 }
      }
      transition={{
        duration: 0.6,
        ease: "easeInOut",
      }}
      className="w-20 h-20 relative preserve-3d"
    >
      <DiceFace value={value} />
    </motion.div>
  );
};

export default function App() {
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [history, setHistory] = useState<{ values: number[]; total: number; timestamp: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const rollDice = useCallback(() => {
    if (isRolling || isShaking) return;

    setIsShaking(true);
    
    // Shake for 400ms to build anticipation
    setTimeout(() => {
      setIsShaking(false);
      setIsRolling(true);
      
      // Simulate rolling animation duration
      setTimeout(() => {
        const newValues = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        setDiceValues(newValues);
        setIsRolling(false);
        
        const total = newValues.reduce((a, b) => a + b, 0);
        setHistory(prev => [{ values: newValues, total, timestamp: Date.now() }, ...prev].slice(0, 50));
      }, 600);
    }, 400);
  }, [diceCount, isRolling, isShaking]);

  const reset = () => {
    setDiceValues(Array(diceCount).fill(1));
    setHistory([]);
  };

  const adjustDiceCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(6, diceCount + delta));
    setDiceCount(newCount);
    setDiceValues(Array(newCount).fill(1));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-600 text-white rounded-2xl shadow-lg mb-4"
          >
            <Dices size={32} />
          </motion.div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">骰子模擬器</h1>
          <p className="text-slate-500">點擊按鈕或按下空白鍵來投擲骰子</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Roller Area */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-12 border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
              {/* Dice Container */}
              <motion.div
                animate={isShaking ? { 
                  x: [-2, 2, -2, 2, -2, 2, 0],
                  y: [-1, 1, -1, 1, -1, 1, 0],
                  rotate: [-1, 1, -1, 1, 0]
                } : {}}
                transition={{ duration: 0.4, ease: "linear" }}
                className="flex flex-wrap justify-center gap-6 mb-12"
              >
                <AnimatePresence mode="popLayout">
                  {diceValues.map((val, idx) => (
                    <motion.div
                      key={`${idx}-${diceCount}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Dice value={val} rolling={isRolling} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <div className="flex items-center justify-between w-full bg-slate-100 p-2 rounded-2xl">
                  <button
                    onClick={() => adjustDiceCount(-1)}
                    disabled={diceCount <= 1 || isRolling}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-30"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="font-semibold text-lg">{diceCount} 顆骰子</span>
                  <button
                    onClick={() => adjustDiceCount(1)}
                    disabled={diceCount >= 6 || isRolling}
                    className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all disabled:opacity-30"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <button
                  onClick={rollDice}
                  disabled={isRolling || isShaking}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xl rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-3"
                >
                  {isRolling || isShaking ? "投擲中..." : "投擲骰子"}
                  {!(isRolling || isShaking) && <Dices size={24} />}
                </button>

                {diceCount > 1 && !isRolling && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-indigo-600"
                  >
                    總和: {diceValues.reduce((a, b) => a + b, 0)}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                <RotateCcw size={18} />
                重置
              </button>
            </div>
          </div>

          {/* History Sidebar */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <History size={20} className="text-indigo-600" />
                歷史紀錄
              </div>
              <button
                onClick={() => setHistory([])}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="清除紀錄"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm italic">
                  尚無紀錄
                </div>
              ) : (
                history.map((item) => (
                  <motion.div
                    key={item.timestamp}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                  >
                    <div className="flex gap-1.5">
                      {item.values.map((v, i) => (
                        <div key={i} className="w-6 h-6 bg-white border border-slate-200 rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm">
                          {v}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-sm">
                        {item.total}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} 骰子模擬器 - 簡單、快速、有趣
      </footer>
    </div>
  );
}
