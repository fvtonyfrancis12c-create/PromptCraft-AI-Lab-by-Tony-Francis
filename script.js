import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  BarChart3, 
  MessageSquare, 
  Library, 
  Home, 
  ChevronRight, 
  Copy, 
  Check,
  Send,
  Trash2,
  Plus,
  Image as ImageIcon,
  Moon,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateImprovedPrompt, analyzePrompt, chatWithAI, generateImagePrompt } from './services/geminiService';
import { View, Prompt } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [typedOutput, setTypedOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analysis, setAnalysis] = useState<{ score: number; tips: string[] } | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; parts: string }[]>([]);
  const [library, setLibrary] = useState<Prompt[]>([]);
  const [isLightMode, setIsLightMode] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    setInput('');
    setOutput('');
    setTypedOutput('');
    setAnalysis(null);
  }, [currentView]);

  useEffect(() => {
    const saved = localStorage.getItem('prompt_library');
    if (saved) setLibrary(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  useEffect(() => {
    if (!output) {
      setTypedOutput('');
      return;
    }
    
    setTypedOutput('');
    let i = 0;
    const speed = 10;
    const timer = setInterval(() => {
      if (i < output.length) {
        setTypedOutput(prev => prev + output.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [output]);

  const scrollToContact = () => {
    setCurrentView('home');
    setTimeout(() => {
      const element = document.getElementById('contact');
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const saveToLibrary = (content: string, title: string = 'Untitled Prompt') => {
    const newPrompt: Prompt = {
      id: Date.now().toString(),
      title,
      content,
      category: currentView,
      createdAt: Date.now()
    };
    const updated = [newPrompt, ...library];
    setLibrary(updated);
    localStorage.setItem('prompt_library', JSON.stringify(updated));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');
    try {
      const res = await generateImprovedPrompt(input);
      setOutput(res);
      setAnalysis(analyzePrompt(res));
    } catch (error) {
      console.error(error);
      setOutput("Error generating prompt. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePromptGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput('');
    try {
      const res = await generateImagePrompt(input);
      setOutput(res);
    } catch (error) {
      console.error(error);
      setOutput("Error generating image prompt. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setChatHistory(prev => [...prev, { role: 'user', parts: userMsg }]);
    setIsLoading(true);
    try {
      const res = await chatWithAI(userMsg, chatHistory);
      setChatHistory(prev => [...prev, { role: 'model', parts: res }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <section className="hero text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">
            <Sparkles size={16} />
            <span>Next-Gen Prompt Engineering</span>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-white light-mode:text-slate-900">
              AI Prompt Engineering Lab – Generate, Improve & Analyze AI Prompts.
            </h2>
            <p className="hero-tagline">
              A platform to design, test and optimize prompts for AI applications.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <textarea 
              id="promptInput"
              className="neo-input h-32 resize-none"
              placeholder="Enter your idea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              onClick={() => {
                if (input.trim()) {
                  setCurrentView('generator');
                  handleGenerate();
                }
              }}
              className="neo-btn bg-sky-500 text-white hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20"
            >
              Generate Prompt
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {[
            { id: 'generator', icon: Sparkles, title: 'Prompt Generator', desc: 'Create powerful prompts from scratch.', color: 'bg-blue-500' },
            { id: 'improver', icon: Wand2, title: 'Prompt Improver', desc: 'Transform simple ideas into detailed prompts.', color: 'bg-emerald-500' },
            { id: 'imageprompt', icon: ImageIcon, title: 'Image Prompt Builder', desc: 'Generate detailed prompts for AI image generation.', color: 'bg-pink-500' },
            { id: 'analyzer', icon: BarChart3, title: 'Prompt Analyzer', desc: 'Get instant feedback and scoring on your prompts.', color: 'bg-amber-500' },
            { id: 'chatbot', icon: MessageSquare, title: 'AI Chatbot', desc: 'Collaborate with an AI to refine your ideas.', color: 'bg-sky-500' },
            { id: 'library', icon: Library, title: 'Prompt Library', desc: 'Save and organize your best creations.', color: 'bg-purple-500' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setCurrentView(tool.id as View)}
              className="glass p-6 rounded-2xl text-left hover:bg-white/10 transition-all group"
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white", tool.color)}>
                <tool.icon size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white light-mode:text-slate-900 group-hover:text-sky-400 transition-colors">{tool.title}</h3>
              <p className="text-slate-400 text-sm mt-2">{tool.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
      </section>
    </div>
  );

  const renderToolLayout = (title: string, icon: React.ReactNode, children: React.ReactNode) => (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView('home')}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
          >
            <Home size={20} />
          </button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2 text-white light-mode:text-slate-900 font-semibold text-xl">
            {icon}
            <span>{title}</span>
          </div>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen font-sans">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setCurrentView('home')}
        >
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-white light-mode:text-slate-900">PromptCraft</h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {[
            { id: 'home', label: 'Home' },
            { id: 'generator', label: 'Generator' },
            { id: 'improver', label: 'Improver' },
            { id: 'imageprompt', label: 'Image Builder' },
            { id: 'analyzer', label: 'Analyzer' },
            { id: 'library', label: 'Library' },
            { id: 'chatbot', label: 'Chatbot' },
          ].map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView(item.id as View);
              }}
              className={cn(
                "text-sm font-medium transition-colors relative group",
                currentView === item.id ? "text-sky-400" : "text-slate-400 hover:text-white light-mode:hover:text-slate-900"
              )}
            >
              {item.label}
              <span className={cn(
                "absolute -bottom-1 left-0 h-0.5 bg-sky-400 transition-all duration-300",
                currentView === item.id ? "w-full" : "w-0 group-hover:w-full"
              )} />
            </a>
          ))}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              scrollToContact();
            }}
            className="text-sm font-medium text-slate-400 hover:text-white light-mode:hover:text-slate-900 transition-colors"
          >
            Contact
          </a>
          <button
            id="themeToggle"
            onClick={() => setIsLightMode(!isLightMode)}
            className="p-2 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
          >
            {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </nav>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {currentView === 'home' && renderHome()}
          
          {currentView === 'generator' && renderToolLayout('Prompt Generator', <Sparkles />, (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Your Idea</label>
                  <textarea 
                    className="neo-input h-64 resize-none"
                    placeholder="e.g., A marketing email for a new eco-friendly water bottle..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className="neo-btn bg-gradient-to-r from-blue-500 to-sky-500 text-white w-full flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={18} />}
                  Generate Prompt
                </button>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Generated Output</span>
                    {output && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(output)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                        >
                          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                        <button 
                          onClick={() => saveToLibrary(output)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div id="result" className="flex-1 overflow-auto prose prose-invert light-mode:prose-slate max-w-none">
                    {typedOutput ? (
                      <Markdown>{typedOutput}</Markdown>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 italic">
                        {isLoading ? "Generating..." : "Generated prompt will appear here..."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {currentView === 'improver' && renderToolLayout('Prompt Improver', <Wand2 />, (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Your Base Prompt</label>
                  <textarea 
                    className="neo-input h-64 resize-none"
                    placeholder="e.g., Write a story about a robot who discovers feelings..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className="neo-btn bg-gradient-to-r from-emerald-500 to-sky-500 text-white w-full flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={18} />}
                  Improve Prompt
                </button>
              </div>

              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-400">Optimized Output</span>
                    {output && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleCopy(output)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                        >
                          {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        </button>
                        <button 
                          onClick={() => saveToLibrary(output)}
                          className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div id="result" className="flex-1 overflow-auto prose prose-invert light-mode:prose-slate max-w-none">
                    {typedOutput ? (
                      <Markdown>{typedOutput}</Markdown>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 italic">
                        {isLoading ? "Generating..." : "Improved prompt will appear here..."}
                      </div>
                    )}
                  </div>
                </div>
                
                {analysis && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6 border-emerald-500/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white light-mode:text-slate-900">Quality Score</h4>
                      <span className="text-2xl font-bold text-emerald-400">{analysis.score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${analysis.score}%` }}
                      />
                    </div>
                    <ul className="space-y-2">
                      {analysis.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <ChevronRight size={14} className="mt-1 text-sky-500 shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          ))}

          {currentView === 'imageprompt' && renderToolLayout('AI Image Prompt Builder', <ImageIcon />, (
            <div id="imageprompt" className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-2">
                <p className="text-slate-400">Generate detailed prompts for AI image generation.</p>
              </div>
              <div className="glass p-8 rounded-3xl space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Image Idea</label>
                  <input 
                    type="text"
                    className="neo-input"
                    placeholder="Enter image idea (example: futuristic city)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleImagePromptGenerate}
                  disabled={isLoading || !input.trim()}
                  className="neo-btn bg-gradient-to-r from-pink-500 to-purple-500 text-white w-full flex items-center justify-center gap-2 hover:scale-[1.02] shadow-lg shadow-pink-500/20"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ImageIcon size={18} />}
                  Generate Image Prompt
                </button>
              </div>

              <div className="glass rounded-3xl p-8 min-h-[200px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-slate-400">Generated Prompt</span>
                  {output && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleCopy(output)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                      >
                        {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                      </button>
                      <button 
                        onClick={() => saveToLibrary(output)}
                        className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <div id="result" className="flex-1 overflow-auto prose prose-invert light-mode:prose-slate max-w-none">
                  {typedOutput ? (
                    <Markdown>{typedOutput}</Markdown>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 italic">
                      {isLoading ? "Generating..." : "Detailed image prompt will appear here..."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {currentView === 'analyzer' && renderToolLayout('Prompt Analyzer', <BarChart3 />, (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="space-y-4">
                <textarea 
                  className="neo-input h-48"
                  placeholder="Paste a prompt here to analyze its effectiveness..."
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setAnalysis(analyzePrompt(e.target.value));
                  }}
                />
              </div>

              {analysis && input.trim() && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass p-6 rounded-2xl text-center">
                    <div className="text-4xl font-bold text-sky-400 mb-2">{analysis.score}</div>
                    <div className="text-sm text-slate-400 uppercase tracking-wider">Overall Score</div>
                  </div>
                  <div className="glass p-6 rounded-2xl md:col-span-2">
                    <h4 className="font-semibold mb-3 text-white light-mode:text-slate-900">Optimization Tips</h4>
                    <ul className="space-y-2">
                      {analysis.tips.length > 0 ? analysis.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                          <ChevronRight size={14} className="mt-1 text-sky-500 shrink-0" />
                          {tip}
                        </li>
                      )) : (
                        <li className="text-sm text-emerald-400 flex items-center gap-2">
                          <Check size={14} /> Great job! This prompt is well-structured.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ))}

          {currentView === 'chatbot' && renderToolLayout('AI Chatbot', <MessageSquare />, (
            <div className="max-w-4xl mx-auto h-[70vh] flex flex-col glass rounded-3xl overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
                    <MessageSquare size={48} className="opacity-20" />
                    <p className="max-w-xs">Ask me anything about prompt engineering or request help building a specific prompt.</p>
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl",
                      msg.role === 'user' ? "bg-sky-500 text-white" : "glass text-slate-200 light-mode:text-slate-900"
                    )}>
                      <div className="prose prose-invert prose-sm max-w-none light-mode:prose-slate">
                        <Markdown>{msg.parts}</Markdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="glass p-4 rounded-2xl flex gap-1">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-900/50 light-mode:bg-slate-100 border-t border-white/10 flex gap-2">
                <input 
                  className="flex-1 bg-transparent outline-none px-4 py-2 text-white light-mode:text-slate-900"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                />
                <button 
                  onClick={handleChat}
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-sky-500 rounded-xl text-white hover:bg-sky-600 transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          ))}

          {currentView === 'library' && renderToolLayout('Prompt Library', <Library />, (
            <div className="space-y-6">
              {library.length === 0 ? (
                <div className="text-center py-20 glass rounded-3xl">
                  <Library size={48} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-400">Your saved prompts will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {library.map((item) => (
                    <motion.div 
                      layout
                      key={item.id}
                      className="glass p-6 rounded-2xl flex flex-col group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-sky-500">{item.category}</span>
                        <button 
                          onClick={() => {
                            const updated = library.filter(p => p.id !== item.id);
                            setLibrary(updated);
                            localStorage.setItem('prompt_library', JSON.stringify(updated));
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <h4 className="font-semibold text-white light-mode:text-slate-900 mb-2 line-clamp-1">{item.title}</h4>
                      <p className="text-sm text-slate-400 line-clamp-3 flex-1 mb-4">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600">{new Date(item.createdAt).toLocaleDateString()}</span>
                        <button 
                          onClick={() => handleCopy(item.content)}
                          className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1"
                        >
                          <Copy size={12} /> Copy
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </main>

      <section id="contact" className="mt-20 py-16 px-6 bg-[#020617] light-mode:bg-white border-t border-slate-800 light-mode:border-slate-200 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-sky-400">Contact</h2>
          <div className="space-y-3 text-slate-200 light-mode:text-slate-600">
            <p className="text-lg"><strong>Name:</strong> Tony Francis</p>
            <p className="text-lg"><strong>Role:</strong> Prompt Engineer</p>
            <p className="text-lg">
              <strong>Email:</strong> <a href="mailto:tony28252@gmail.com" className="text-sky-400 hover:underline">tony28252@gmail.com</a>
            </p>
            <p className="text-lg">
              <strong>Phone:</strong> <a href="tel:9092359337" className="text-sky-400 hover:underline">+91 9092359337</a>
            </p>
            <p className="text-lg"><strong>Project:</strong> PromptCraft AI Lab</p>
          </div>
        </div>
      </section>
      
      <footer className="py-12 px-6 border-t border-white/5 light-mode:border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles size={18} />
            <span className="font-bold text-white light-mode:text-slate-900">PromptCraft AI Lab</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 PromptCraft Lab. Built with Gemini 3.</p>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-white light-mode:hover:text-slate-900 transition-colors text-sm">Privacy</button>
            <button className="text-slate-500 hover:text-white light-mode:hover:text-slate-900 transition-colors text-sm">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}