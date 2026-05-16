import React, { useState } from 'react';
import { Upload, ArrowRight, FileText, X, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateInitialDraft } from '../lib/gemini';
import { cn } from '../lib/utils';

interface DraftGeneratorProps {
  onDraftGenerated: (content: string) => void;
}

export default function DraftGenerator({ onDraftGenerated }: DraftGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<{ name: string, data: string, type: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFiles(prev => [...prev, {
          name: file.name,
          data: ev.target?.result as string,
          type: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const result = await generateInitialDraft(prompt, files);
      if (result) {
        onDraftGenerated(result);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0A0A0B]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-[#0F0F11] border border-slate-800/50 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative"
      >
        {/* Background glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
            <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse" />
          </div>
          <h1 className="text-4xl font-normal tracking-tight text-white mb-3">
            Semantic Composition
          </h1>
          <p className="text-slate-500 max-w-md font-light leading-relaxed text-sm">
            Partner with Aether to scaffold your vision. Attach resources or describe your intent to begin.
          </p>
        </div>

        <div className="space-y-6 relative z-10">
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="The philosophy of collaborative intelligence in late-modernity..."
              className="w-full h-40 bg-[#0A0A0B] border border-slate-800 rounded-2xl p-6 text-slate-200 placeholder:text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 transition-all resize-none font-serif text-lg leading-relaxed shadow-inner"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {files.map((file, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"
                >
                  <FileText className="w-3 h-3 text-indigo-400" />
                  {file.name}
                  <button onClick={() => removeFile(i)} className="hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <label className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-slate-800 text-[10px] font-bold text-slate-500 hover:text-slate-300 hover:border-indigo-500/50 transition-all cursor-pointer uppercase tracking-widest",
              files.length >= 3 && "hidden"
            )}>
              <Upload className="w-3 h-3" />
              Reference Source
              <input type="file" multiple className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
            className={cn(
              "w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-700 text-white font-bold text-xs uppercase tracking-widest py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/10",
              isGenerating && "cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing Draft
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                Initiate Workspace
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/50 flex items-center justify-center gap-6 text-slate-500 text-[9px] uppercase tracking-[0.2em] font-black opacity-50">
          <span>AI-Semantic Partner</span>
          <span className="w-1 height-1 bg-slate-700 rounded-full" />
          <span>Real-time Stream</span>
          <span className="w-1 height-1 bg-slate-700 rounded-full" />
          <span>High Fidelity</span>
        </div>
      </motion.div>
    </div>
  );
}
