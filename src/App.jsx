import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Nav, Side, SkeletonDash, Upload, ScoreCircle, Metrics, Insights, Suggestions, BeforeAfter, I } from './Components.jsx';
import { analyzeContent, getVideoDuration } from './utils/scoringEngine.js';
import { getHistory, saveAnalysis, clearHistory, formatDate, getUserHistoryStats } from './utils/historyManager.js';
import { generateAnalysisResponse, generateChatResponse } from './utils/aiAssistant.js';
import { analyzeTrends } from './utils/trendsEngine.js';
import { generateSuggestions } from './utils/suggestionsEngine.js';

import './index.css';

const History = ({ history, onClear, onDelete }) => {
  const items = history || [];
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass card-3d rounded-3xl overflow-hidden">
      <div className="p-7 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-bold text-white text-xl font-jakarta">Analysis History</h3>
        {items.length > 0 && (
          <button onClick={() => {
            if (window.confirm("Are you sure you want to delete all history?")) {
              onClear();
            }
          }} className="label-caps text-slate-500 hover:text-red-400 transition">Clear All</button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="p-12 text-center">
          <I n="history" c="text-slate-600 text-4xl mb-3" />
          <p className="text-slate-500 text-sm">No analysis history yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="bg-white/[0.02]">
              {['Content','Platform','Score','Date',''].map(h=><th key={h} className="px-7 py-4 label-caps text-slate-500">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {items.slice(0,10).map((r,i)=>{
                const c = r.totalScore >= 70 ? 'green' : r.totalScore >= 40 ? 'amber' : 'red';
                return (
                  <motion.tr layout key={r.id||i} className="hover:bg-white/[0.04] transition group">
                    <td className="px-7 py-4"><div className="flex items-center gap-3"><div className="w-10 h-14 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center"><I n={r.contentType==='video'?'smart_display':r.contentType==='image'?'image':'article'} c="text-slate-500 text-lg"/></div><div><span className="text-sm font-semibold text-white block">{(r.fileName||'Unknown').substring(0,30)}</span><span className="text-[10px] text-slate-600">{(r.caption||'').substring(0,40)}{(r.caption||'').length>40?'...':''}</span></div></div></td>
                    <td className="px-7 py-4 text-xs text-slate-400 capitalize">{r.platform||'—'}</td>
                    <td className="px-7 py-4"><span className={`px-3 py-1 rounded-full bg-${c}-500/10 text-${c}-400 text-xs font-bold border border-${c}-500/20`}>{r.totalScore}/100</span></td>
                    <td className="px-7 py-4 text-xs text-slate-500">{formatDate(r.timestamp)}</td>
                    <td className="px-7 py-4 text-right">
                      <button onClick={() => onDelete(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full">
                        <I n="delete" c="text-slate-500 hover:text-red-400 transition text-sm"/>
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

const Chat = ({ result, historyStats, trends, externalPrompt, onExternalPromptHandled }) => {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (result) {
      const aiMsg = generateAnalysisResponse(result, historyStats);
      setMessages([{ role: 'ai', text: aiMsg, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) }]);
    }
  }, [result]);

  useEffect(() => {
    if (externalPrompt) {
      send(externalPrompt);
      onExternalPromptHandled();
    }
  }, [externalPrompt]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const send = (overrideMsg) => {
    const textToSend = typeof overrideMsg === 'string' ? overrideMsg : msg;
    if (!textToSend.trim()) return;
    
    const userMsg = { role: 'user', text: textToSend, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const aiText = generateChatResponse(textToSend, result, historyStats, trends);
      const aiMsg = { role: 'ai', text: aiText, time: new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleKey = (e) => { if (e.key === 'Enter') send(); };
  
  const smartQueries = ["Viral ideas", "Previous projects", "Improve based on my past", "What should I post next?"];

  return (
    <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="glass rounded-3xl flex flex-col h-full min-h-[600px] overflow-hidden">
      <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
        <div className="relative"><div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div><I n="smart_toy" c="text-primary text-3xl relative z-10"/><div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-bg z-20"></div></div>
        <div><h4 className="font-bold text-white text-sm font-jakarta">AI Assistant</h4><p className="label-caps text-green-400" style={{fontSize:9}}>Online</p></div>
      </div>
      <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-start gap-1">
            <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none max-w-[90%] border border-white/5"><p className="text-xs text-slate-300 leading-relaxed">{result ? "I've analyzed your content! Ask me anything about it. 🚀" : "No active analysis found. You can still ask me general virality tips! 💡"}</p></div>
            <span className="label-caps text-slate-600 px-1" style={{fontSize:9}}>Now</span>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role==='user'?'items-end':'items-start'} gap-1`}>
            <div className={`${m.role==='user'?'premium-gradient shadow-lg shadow-purple-500/10 rounded-tr-none':'bg-white/5 border border-white/5 rounded-tl-none'} p-4 rounded-2xl max-w-[90%]`}>
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${m.role==='user'?'text-white font-medium':'text-slate-300'}`}>{m.text}</p>
            </div>
            <span className="label-caps text-slate-600 px-1" style={{fontSize:9}}>{m.time}</span>
          </div>
        ))}
        {isTyping && (
          <div className="flex flex-col items-start gap-1">
            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 max-w-[90%] flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
            </div>
            <span className="label-caps text-slate-600 px-1" style={{fontSize:9}}>Typing...</span>
          </div>
        )}
      </div>
      <div className="p-5 bg-white/[0.02] border-t border-white/5">
        <div className="flex gap-2 overflow-x-auto mb-3 pb-1 hide-scrollbar">
          {smartQueries.map((q, i) => (
            <button key={i} onClick={() => send(q)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition">{q}</button>
          ))}
        </div>
        <div className="relative">
          <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={handleKey} placeholder="Ask for content tips..." className="w-full bg-[#060e20]/50 border border-white/10 rounded-2xl py-3 pl-5 pr-14 text-xs text-white focus:ring-1 focus:ring-primary/50 outline-none transition placeholder:text-slate-600"/>
          <button onClick={() => send()} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 premium-gradient rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"><I n="send" c="text-white text-base"/></button>
        </div>
      </div>
    </motion.div>
  );
};



export default function App() {
  const [user] = useState({ uid: 'guest' });
  const [phase, setPhase] = useState('upload');
  const [currentView, setCurrentView] = useState('dashboard');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyStats, setHistoryStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [suggVariation, setSuggVariation] = useState(0);
  const [chatPrompt, setChatPrompt] = useState(null);



  useEffect(() => { 
    if (user) {
      setHistory(getHistory(user.uid)); 
      setHistoryStats(getUserHistoryStats(user.uid));
      setTrends(analyzeTrends());
    }
  }, [user]);

  useEffect(() => {
    if (analysisResult) setSuggestions(generateSuggestions(analysisResult, suggVariation));
  }, [analysisResult, suggVariation]);

  const handleAnalyze = async ({ file, caption, platform }) => {
    setPhase('loading');
    try {
      const duration = file ? await getVideoDuration(file) : 0;
      await new Promise(r => setTimeout(r, 2000));
      const result = analyzeContent({ file, caption, platform, duration });
      setAnalysisResult(result);
      const saved = saveAnalysis(result, user.uid);
      if (saved) {
        setHistory(getHistory(user.uid));
        setHistoryStats(getUserHistoryStats(user.uid));
      }
      setPhase('results');
    } catch (err) {
      console.error('Analysis failed:', err);
      const fallback = analyzeContent({ file: null, caption: caption || '', platform, duration: 0 });
      setAnalysisResult(fallback);
      setPhase('results');
    }
  };

  const handleRegen = () => setSuggVariation(v => v + 1);

  const handleClearHistory = () => {
    clearHistory(user.uid);
    setHistory([]);
    setHistoryStats(null);
  };

  const handleDeleteHistory = (id) => {
    import('./utils/historyManager.js').then(({ deleteAnalysis }) => {
      deleteAnalysis(id, user.uid);
      setHistory(getHistory(user.uid));
      setHistoryStats(getUserHistoryStats(user.uid));
    });
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  return (
    <>
      <Nav onNavigate={handleNavigate} currentView={currentView} user={user} />
      <Side onNavigate={handleNavigate} currentView={currentView}/>
      <main className="lg:ml-64 pt-28 px-4 md:px-10 pb-20 max-w-[1400px]">

        {currentView === 'history' && (
          <motion.div key="history-page" initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
            <section className="mb-6">
              <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="font-jakarta text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                Analysis <span className="text-gradient">History</span> 📋
              </motion.h1>
              <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-lg text-slate-400 max-w-2xl">Review all your past content analyses and track improvements.</motion.p>
            </section>
            <History history={history} onClear={handleClearHistory} onDelete={handleDeleteHistory}/>
            <button onClick={()=>setCurrentView('dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-jakarta font-semibold"><I n="arrow_back" c="text-lg"/>Back to Dashboard</button>
          </motion.div>
        )}

        {currentView === 'chat' && (
          <motion.div key="chat-page" initial={{opacity:0}} animate={{opacity:1}} className="space-y-8 h-[calc(100vh-200px)]">
             <section className="mb-6">
                <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="font-jakarta text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
                  AI <span className="text-gradient">Assistant</span> 🤖
                </motion.h1>
                <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-lg text-slate-400 max-w-2xl">Chat with our viral experts to refine your content strategy.</motion.p>
              </section>
              <Chat result={analysisResult} historyStats={historyStats} trends={trends} externalPrompt={chatPrompt} onExternalPromptHandled={()=>setChatPrompt(null)}/>
          </motion.div>
        )}

        {currentView === 'dashboard' && (
          <>
            <section className="mb-12">
              <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="font-jakarta text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                {phase==='upload'?<>Turn Your Content <span className="text-gradient">Viral with AI</span> 🚀</>:<>Predict Your <span className="text-gradient">Viral Potential</span> ✨</>}
              </motion.h1>
              <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-lg text-slate-400 max-w-2xl">
                {phase==='upload'?'Upload your content and get instant virality insights powered by neural networks.':'Precision analysis for the creator economy. Leverage AI to maximize reach.'}
              </motion.p>
            </section>

            <AnimatePresence mode="wait">
              {phase==='upload' && <motion.div key="upload" exit={{opacity:0,y:-20}}><Upload onAnalyze={handleAnalyze}/></motion.div>}

              {phase==='loading' && (
                <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-8">
                  <div className="glass rounded-3xl p-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full premium-gradient flex items-center justify-center mb-6 animate-pulse"><I n="auto_awesome" c="text-white text-3xl"/></div>
                    <h3 className="font-jakarta text-xl font-bold text-white mb-2">Analyzing Your Content...</h3>
                    <p className="text-sm text-slate-400 mb-6">Our AI is scanning visual hooks, pacing, and engagement triggers.</p>
                    <div className="w-full max-w-md h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full premium-gradient rounded-full animate-pulse" style={{width:'65%'}}></div></div>
                  </div>
                  <SkeletonDash/>
                </motion.div>
              )}

              {phase==='results' && analysisResult && (
                <motion.div key="results" initial={{opacity:0}} animate={{opacity:1}} className="space-y-10">
                  <button onClick={()=>{setPhase('upload');setAnalysisResult(null);}} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-jakarta font-semibold"><I n="arrow_back" c="text-lg"/>Analyze Another</button>
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8 space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ScoreCircle score={analysisResult.totalScore}/><Metrics metrics={analysisResult.metrics}/></div>
                      <Insights result={analysisResult}/>
                      <BeforeAfter result={analysisResult}/>
                      <History history={history} onClear={handleClearHistory} onDelete={handleDeleteHistory}/>
                    </div>
                    <div className="xl:col-span-4 space-y-6">
                      <Suggestions suggestions={suggestions} onRegen={handleRegen} onAction={(cmd)=>setChatPrompt(cmd)}/>
                      <Chat result={analysisResult} historyStats={historyStats} trends={trends} externalPrompt={chatPrompt} onExternalPromptHandled={()=>setChatPrompt(null)}/>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>
      <button onClick={()=>setPhase('upload')} className="md:hidden fixed bottom-8 right-8 w-14 h-14 premium-gradient rounded-full flex items-center justify-center shadow-2xl shadow-purple-500/40 z-50 hover:scale-110 active:scale-95 transition-all"><I n="add" c="text-white text-2xl"/></button>
    </>
  );
}

