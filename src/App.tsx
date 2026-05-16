/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import DraftGenerator from './components/DraftGenerator';
import Editor from './components/Editor';
import { motion, AnimatePresence } from 'motion/react';
import { Wand2, Type } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'generator' | 'editor'>('generator');
  const [content, setContent] = useState('');

  const handleDraftGenerated = (newContent: string) => {
    setContent(newContent);
    setScreen('editor');
  };

  return (
    <div className="flex h-screen w-full bg-[#0A0A0B] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {screen === 'generator' ? (
          <motion.div
            key="generator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <DraftGenerator onDraftGenerated={handleDraftGenerated} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 overflow-hidden"
          >
            {/* Left Sidebar: Context & Files */}
            <div className="w-64 border-r border-slate-800/50 bg-[#0F0F11] flex flex-col shrink-0">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                  <h1 className="font-medium tracking-tight text-white">Lumina Write</h1>
                </div>
                
                <div className="space-y-6 text-slate-400">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Writing Workflow</label>
                    <div className="space-y-1 text-xs">
                      <div className="p-2 text-indigo-400 border-l-2 border-indigo-500 bg-indigo-500/5 cursor-pointer">Live Draft</div>
                      <div className="p-2 hover:text-slate-300 cursor-pointer transition-colors" onClick={() => setScreen('generator')}>Start Over</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 block">Document Context</label>
                    <div className="p-2 bg-slate-800/40 rounded border border-slate-700/50 text-xs flex items-center gap-2">
                       <span className="truncate">Initial AI Scaffold</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto p-6 border-t border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">Me</div>
                  <div className="text-[11px]">
                    <div className="text-white font-medium">Collaborative Draft</div>
                    <div className="text-slate-500">Thought Partner Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Writing Workspace */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
              <header className="h-14 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#0A0A0B]/80 backdrop-blur-md shrink-0">
                <div className="text-xs text-slate-500 italic">Semantic Partnership Experience</div>
                <div className="flex items-center gap-4">
                  <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md shadow-lg shadow-indigo-500/20 transition-all">Export</button>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto relative p-12 scroll-smooth">
                <div className="max-w-2xl mx-auto w-full">
                  <Editor initialContent={content} />
                </div>
              </main>

              {/* Bottom Command Bar Alternative */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 pointer-events-none">
                <div className="bg-[#1A1A1E]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 shadow-2xl flex items-center gap-2 pointer-events-auto">
                  <div className="w-8 h-8 flex items-center justify-center text-indigo-400 animate-pulse">✦</div>
                  <input 
                    type="text" 
                    placeholder="Ask Lumina to write more or change something..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm py-2 text-slate-200 placeholder-slate-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        // For global commands if needed
                      }
                    }}
                  />
                  <div className="flex items-center gap-1 pr-2">
                    <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] rounded uppercase font-bold tracking-tighter">Cmd</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-500 text-[10px] rounded uppercase font-bold tracking-tighter">K</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
