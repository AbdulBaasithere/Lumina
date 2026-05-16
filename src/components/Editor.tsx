import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import { Sparkles, Wand2, RefreshCw, Type, Quote, Eraser, Loader2, Check, X } from 'lucide-react';
import { iterateOnSection, getProactiveFeedback } from '../lib/gemini';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface EditorProps {
  initialContent: string;
}

export default function Editor({ initialContent }: EditorProps) {
  const [isIterating, setIsIterating] = useState(false);
  const [feedback, setFeedback] = useState<{ originalText?: string, proposedText: string, reason: string, type: 'suggestion' | 'continuation' } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your story...',
      }),
      BubbleMenuExtension,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-invert lg:prose-xl focus:outline-none max-w-none font-serif text-slate-300 leading-relaxed selection:bg-indigo-500/30',
      },
    },
  });

  // Handle proactive feedback
  useEffect(() => {
    if (!editor) return;

    let timeout: NodeJS.Timeout;

    const checkProactive = async () => {
      const content = editor.getText();
      if (content.length < 50) return; // Wait for some content

      setIsChecking(true);
      const result = await getProactiveFeedback(content);
      setIsChecking(false);

      if (result) {
        setFeedback(result);
      }
    };

    const handleUpdate = () => {
      clearTimeout(timeout);
      setFeedback(null); // Clear current feedback on type
      timeout = setTimeout(checkProactive, 5000); // Check after 5s of inactivity
    };

    editor.on('update', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(timeout);
    };
  }, [editor]);

  const handleAIAction = async (action: string) => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText) return;

    setIsIterating(true);
    try {
      const fullContent = editor.getText();
      const result = await iterateOnSection(fullContent, selectedText, action);
      if (result) {
        editor.chain().focus().insertContentAt({ from, to }, result).run();
      }
    } finally {
      setIsIterating(false);
    }
  };

  const applyFeedback = () => {
    if (!editor || !feedback) return;

    if (feedback.type === 'continuation') {
      editor.chain().focus().insertContent(feedback.proposedText).run();
    } else if (feedback.originalText) {
      // Very naive replacement for demo purposes
      const content = editor.getHTML();
      const updated = content.replace(feedback.originalText, feedback.proposedText);
      editor.commands.setContent(updated);
    }
    setFeedback(null);
  };

  if (!editor) return null;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Bubble Menu for AI Actions */}
      <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden rounded-xl bg-[#15151A] border border-indigo-500/40 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => handleAIAction('Rewrite to be more descriptive and evocative')}
          className="p-2 hover:bg-indigo-500/10 text-slate-300 transition-colors border-r border-slate-800 flex items-center gap-1.5 px-3 text-[11px] font-bold uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Polish
        </button>
        <button
          onClick={() => handleAIAction('Make this text more concise and professional')}
          className="p-2 hover:bg-indigo-500/10 text-slate-300 transition-colors border-r border-slate-800 flex items-center gap-1.5 px-3 text-[11px] font-bold uppercase tracking-wider"
        >
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          Shorten
        </button>
        <button
          onClick={() => handleAIAction('Expand on this idea with more detail and context')}
          className="p-2 hover:bg-indigo-500/10 text-slate-300 transition-colors border-r border-slate-800 flex items-center gap-1.5 px-3 text-[11px] font-bold uppercase tracking-wider"
        >
          <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
          Expand
        </button>
        <button
          onClick={() => {
            const instructions = window.prompt('How should I rewrite this?');
            if (instructions) handleAIAction(instructions);
          }}
          className="p-2 hover:bg-indigo-500/10 text-slate-300 transition-colors flex items-center gap-1.5 px-3 text-[11px] font-bold uppercase tracking-wider"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
          Custom
        </button>
      </BubbleMenu>

      {/* Main Editor */}
      <div className="relative">
        <EditorContent editor={editor} />
        
        {/* Proactive Feedback Toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="absolute -left-64 top-0 w-56 hidden lg:block"
            >
              <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-4 backdrop-blur-sm relative group overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    <Sparkles className="w-3 h-3" />
                    AI Partnership
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    {feedback.reason}
                  </p>
                  
                  <div className="flex gap-2 pt-2 border-t border-slate-800/50">
                    <button 
                      onClick={applyFeedback}
                      className="flex-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded uppercase tracking-wider transition-all"
                    >
                      Accept
                    </button>
                    <button 
                      onClick={() => setFeedback(null)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-500 rounded transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isIterating && (
          <div className="absolute top-0 -right-4 flex items-center gap-2 text-indigo-500/50 text-xs animate-pulse font-mono uppercase tracking-widest">
            <Loader2 className="w-3 h-3 animate-spin" />
            Synthesizing
          </div>
        )}
      </div>

      {/* Subtle Status */}
      <div className="fixed bottom-4 right-4 flex items-center gap-3 text-zinc-600 text-xs font-mono uppercase tracking-widest pointer-events-none">
        {isChecking && <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Analyzing</span>}
        <span>Lumina v1.0</span>
      </div>
    </div>
  );
}
