import React,{useState,useEffect,useRef} from 'react';
import {motion,AnimatePresence} from 'framer-motion';
import {Nav,Side,SkeletonDash,Upload,ScoreCircle,Metrics,Insights,Suggestions,BeforeAfter,CreatorInsights,TrendsDashboard,I} from './Components.jsx';
import {analyzeContent,getVideoDuration} from './utils/scoringEngine.js';
import {getHistory,saveAnalysis,clearHistory,deleteAnalysis,formatDate,getUserHistoryStats} from './utils/historyManager.js';
import {generateAnalysisResponse,generateChatResponse} from './utils/aiAssistant.js';
import {analyzeTrends} from './utils/trendsEngine.js';
import {generateSuggestions} from './utils/suggestionsEngine.js';
import {getSession,login,signUp,logout} from './utils/authManager.js';
import './index.css';

/** Safely normalize an analysis result — guarantees all fields exist */
function normalizeResult(r) {
  if (!r || typeof r !== 'object') return null;
  return {
    totalScore: Math.max(0,Math.min(100,Number(r.totalScore)||0)),
    contentType: r.contentType||'text',
    platform: r.platform||'tiktok',
    duration: r.duration||0,
    fileSize: r.fileSize||0,
    fileName: r.fileName||'Unknown',
    caption: r.caption||'',
    metrics: {
      hookPercent: Number(r.metrics?.hookPercent)||0,
      engagementPercent: Number(r.metrics?.engagementPercent)||0,
      retentionPrediction: Number(r.metrics?.retentionPrediction)||0,
      captionPercent: Number(r.metrics?.captionPercent)||0,
      thumbnailPercent: Number(r.metrics?.thumbnailPercent)||50,
      pacingLevel: r.metrics?.pacingLevel||'Medium',
      trendStatus: r.metrics?.trendStatus||'Warm',
    },
    rawScores: r.rawScores||{},
  };
}

const STEPS=['Detecting content type','Analyzing hook strength','Checking trend alignment','Calculating virality score','Generating AI insights'];

const Loader=()=>{
  const [s,setS]=useState(0);const [p,setP]=useState(0);
  useEffect(()=>{const t=setInterval(()=>{setS(x=>Math.min(x+1,STEPS.length-1));setP(x=>Math.min(x+20,100));},500);return()=>clearInterval(t);},[]);
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="glass rounded-3xl p-10 flex flex-col items-center text-center max-w-lg mx-auto">
      <div className="relative w-16 h-16 mb-6"><div className="w-16 h-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"/><div className="absolute inset-0 flex items-center justify-center"><I n="auto_awesome" c="text-purple-400" s={{fontSize:20}}/></div></div>
      <h3 className="font-jakarta text-xl font-bold text-white mb-2">Analyzing Your Content</h3>
      <p className="text-sm text-purple-300 mb-5">{STEPS[s]}…</p>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3"><motion.div className="h-full rounded-full premium-gradient" animate={{width:`${p}%`}} transition={{duration:0.4}}/></div>
      <div className="flex flex-wrap justify-center gap-2">{STEPS.map((l,i)=><div key={i} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${i<=s?'text-purple-300 bg-purple-500/10':'text-slate-600'}`}><I n={i<s?'check_circle':i===s?'radio_button_checked':'radio_button_unchecked'} s={{fontSize:11}}/>{l}</div>)}</div>
    </motion.div>
  );
};

const Chat=({result,historyStats,trends,externalPrompt,onExternalPromptHandled,fullHeight=false})=>{
  const [msg,setMsg]=useState('');const [msgs,setMsgs]=useState([]);const [typing,setTyping]=useState(false);const ref=useRef(null);
  const now=()=>new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  useEffect(()=>{if(result){setMsgs([{role:'ai',text:generateAnalysisResponse(result,historyStats),time:now()}]);}},[result]);
  useEffect(()=>{if(externalPrompt){send(externalPrompt);onExternalPromptHandled();}},[externalPrompt]);
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs,typing]);
  const send=(ov)=>{
    const t=typeof ov==='string'?ov:msg;if(!t.trim())return;
    setMsgs(p=>[...p,{role:'user',text:t,time:now()}]);setMsg('');setTyping(true);
    setTimeout(()=>{setMsgs(p=>[...p,{role:'ai',text:generateChatResponse(t,result,historyStats,trends),time:now()}]);setTyping(false);},800+Math.random()*400);
  };
  const qs=result?['Rewrite my caption','Give me 5 hooks','Best hashtags','Improve my score']:['What makes content viral?','Best posting times','TikTok vs Instagram','Hook writing tips'];
  return(
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className={`glass rounded-3xl flex flex-col overflow-hidden ${fullHeight?'h-[calc(100vh-220px)] min-h-[500px]':'h-[580px]'}`}>
      <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="relative"><div className="w-9 h-9 premium-gradient rounded-xl flex items-center justify-center"><I n="smart_toy" c="text-white" s={{fontSize:18}}/></div><div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#07101f]"/></div>
        <div><p className="text-sm font-bold text-white font-jakarta">Viral AI Coach</p><p className="text-[10px] text-green-400">● Online</p></div>
        {result&&<span className="ml-auto badge badge-purple text-[9px]">{result.totalScore}/100</span>}
      </div>
      <div ref={ref} className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {msgs.length===0&&<div className="flex flex-col items-start"><div className="bg-white/[0.04] border border-white/5 rounded-2xl rounded-tl-sm p-3.5 max-w-[88%]"><p className="text-xs text-slate-300 leading-relaxed">{result?`I've analyzed your content (score: ${result.totalScore}/100)! Ask me anything 🚀`:"Hey! Upload content and I'll give you personalized viral tips 💡"}</p></div></div>}
        {msgs.map((m,i)=><div key={i} className={`flex flex-col ${m.role==='user'?'items-end':'items-start'}`}><div className={`rounded-2xl p-3 max-w-[88%] ${m.role==='user'?'premium-gradient rounded-tr-sm':'bg-white/[0.04] border border-white/5 rounded-tl-sm'}`}><p className={`text-xs leading-relaxed whitespace-pre-wrap ${m.role==='user'?'text-white':'text-slate-300'}`}>{m.text}</p></div><span className="text-[9px] text-slate-600 px-1 mt-1">{m.time}</span></div>)}
        {typing&&<div className="flex items-start"><div className="bg-white/[0.04] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-1"/><span className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-2"/><span className="w-1.5 h-1.5 bg-slate-400 rounded-full dot-3"/></div></div>}
      </div>
      <div className="p-4 border-t border-white/5 shrink-0 space-y-3">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">{qs.map((q,i)=><button key={i} onClick={()=>send(q)} className="whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-purple-500/15 hover:border-purple-500/30 transition-all">{q}</button>)}</div>
        <div className="relative"><input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask anything about going viral…" className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white placeholder:text-slate-600 outline-none transition focus:border-purple-500/40"/><button onClick={()=>send()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 premium-gradient rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"><I n="send" c="text-white" s={{fontSize:14}}/></button></div>
      </div>
    </motion.div>
  );
};

const History=({history,onClear,onDelete})=>{
  const items=history||[];
  return(
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass rounded-3xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center">
        <div><h3 className="font-bold text-white font-jakarta">Analysis History</h3><p className="text-xs text-slate-500">{items.length} past {items.length===1?'analysis':'analyses'}</p></div>
        {items.length>0&&<button onClick={()=>window.confirm('Clear all history?')&&onClear()} className="text-xs text-slate-500 hover:text-red-400 transition font-semibold">Clear All</button>}
      </div>
      {items.length===0?<div className="p-12 text-center"><I n="history" c="text-slate-700 text-4xl"/><p className="text-slate-500 text-sm mt-3">No analysis history yet</p></div>:(
        <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-white/[0.02]">{['Content','Platform','Score','Date',''].map(h=><th key={h} className="px-6 py-3.5 label-caps text-slate-500 text-[9px]">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-white/[0.04]">{items.slice(0,12).map((r,i)=>{const sc=r.totalScore>=70?'green':r.totalScore>=40?'amber':'red';return(
            <motion.tr layout key={r.id||i} className="hover:bg-white/[0.03] transition group">
              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-12 rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center shrink-0"><I n={r.contentType==='video'?'smart_display':r.contentType==='image'?'image':'article'} c="text-slate-500" s={{fontSize:16}}/></div><div className="min-w-0"><span className="text-sm font-semibold text-white block truncate max-w-[160px]">{r.fileName||'Unknown'}</span><span className="text-[10px] text-slate-600 block truncate max-w-[160px]">{(r.caption||'').substring(0,40)||'—'}</span></div></div></td>
              <td className="px-6 py-4 text-xs text-slate-400 capitalize">{r.platform||'—'}</td>
              <td className="px-6 py-4"><span className={`badge badge-${sc}`}>{r.totalScore}/100</span></td>
              <td className="px-6 py-4 text-xs text-slate-500">{formatDate(r.timestamp)}</td>
              <td className="px-6 py-4 text-right"><button onClick={()=>onDelete(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/10 rounded-lg"><I n="delete_outline" c="text-slate-500 hover:text-red-400 transition" s={{fontSize:16}}/></button></td>
            </motion.tr>
          );})}</tbody>
        </table></div>
      )}
    </motion.div>
  );
};

const AuthPage=({onAuth})=>{
  const [mode,setMode]=useState('login');
  const [username,setUsername]=useState('');const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');
  const [error,setError]=useState('');const [loading,setLoading]=useState(false);const [showPw,setShowPw]=useState(false);

  const submit=async(e)=>{
    e.preventDefault();setError('');setLoading(true);
    await new Promise(r=>setTimeout(r,400));
    const res=mode==='login'?login(username,password):signUp(username,password,confirm);
    setLoading(false);
    if(res.error){setError(res.error);}else{onAuth(res.user);}
  };

  return(
    <div className="fixed inset-0 bg-[#07101f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-purple-600/8 blur-[140px] rounded-full"/>
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full"/>
      </div>
      <motion.div initial={{opacity:0,scale:0.94,y:20}} animate={{opacity:1,scale:1,y:0}} transition={{type:'spring',duration:0.6}} className="glass border border-white/8 rounded-[28px] p-8 max-w-md w-full relative z-10 shadow-2xl">
        <div className="text-center mb-7">
          <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-purple-500/30 float-anim"><I n="rocket_launch" c="text-white" s={{fontSize:24}}/></div>
          <h1 className="text-2xl font-extrabold text-white font-jakarta tracking-tight mb-1">
            {mode==='login'?<>Welcome back to <span className="text-gradient">Go Viral</span></>:<>Join <span className="text-gradient">Go Viral</span></>}
          </h1>
          <p className="text-slate-400 text-sm">{mode==='login'?'Sign in to your creator account':'Create your free creator account'}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="relative">
            <I n="person" c="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" s={{fontSize:18}}/>
            <input value={username} onChange={e=>{setUsername(e.target.value);setError('');}} placeholder="Username" autoComplete="username" className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition"/>
          </div>
          <div className="relative">
            <I n="lock" c="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" s={{fontSize:18}}/>
            <input value={password} onChange={e=>{setPassword(e.target.value);setError('');}} type={showPw?'text':'password'} placeholder="Password" autoComplete={mode==='login'?'current-password':'new-password'} className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition"/>
            <button type="button" onClick={()=>setShowPw(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"><I n={showPw?'visibility_off':'visibility'} s={{fontSize:16}}/></button>
          </div>
          {mode==='signup'&&(
            <div className="relative">
              <I n="lock_clock" c="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" s={{fontSize:18}}/>
              <input value={confirm} onChange={e=>{setConfirm(e.target.value);setError('');}} type={showPw?'text':'password'} placeholder="Confirm Password" autoComplete="new-password" className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-purple-500/50 transition"/>
            </div>
          )}
          <AnimatePresence>
            {error&&<motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium"><I n="error_outline" s={{fontSize:14}}/>{error}</motion.div>}
          </AnimatePresence>
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl premium-gradient text-white font-jakarta font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 disabled:opacity-60 mt-1">
            {loading?<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<I n={mode==='login'?'login':'person_add'} s={{fontSize:16}}/>}
            {loading?'Please wait…':mode==='login'?'Sign In':'Create Account'}
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500">
            {mode==='login'?<>New creator? <button onClick={()=>{setMode('signup');setError('');}} className="text-purple-400 font-semibold hover:text-purple-300 transition">Create account →</button></>:<>Already have an account? <button onClick={()=>{setMode('login');setError('');}} className="text-purple-400 font-semibold hover:text-purple-300 transition">Sign in →</button></>}
          </p>
        </div>


      </motion.div>
    </div>
  );
};

export default function App(){
  const [user,setUser]=useState(null);const [ready,setReady]=useState(false);
  const [phase,setPhase]=useState('upload');const [view,setView]=useState('dashboard');
  const [result,setResult]=useState(null);const [resultsError,setResultsError]=useState(null);
  const [history,setHistory]=useState([]);
  const [histStats,setHistStats]=useState(null);const [trends,setTrends]=useState(null);
  const [suggestions,setSuggestions]=useState([]);const [suggV,setSuggV]=useState(0);const [chatPrompt,setChatPrompt]=useState(null);

  useEffect(()=>{const s=getSession();setUser(s);setReady(true);},[]);
  useEffect(()=>{if(user){setHistory(getHistory(user.uid));setHistStats(getUserHistoryStats(user.uid));setTrends(analyzeTrends());}else{setHistory([]);setHistStats(null);};},[user]);
  useEffect(()=>{if(result)setSuggestions(generateSuggestions(result,suggV));},[result,suggV]);

  const handleAnalyze=async({file,caption,platform})=>{
    setPhase('loading');setResultsError(null);
    try{
      const duration=file?await getVideoDuration(file):0;
      await new Promise(r=>setTimeout(r,2800));
      const raw=analyzeContent({file,caption,platform,duration});
      const r=normalizeResult(raw);
      if(!r) throw new Error('Analysis returned empty result');
      setResult(r);
      const saved=saveAnalysis(r,user.uid);
      if(saved){setHistory(getHistory(user.uid));setHistStats(getUserHistoryStats(user.uid));}
      setPhase('results');
    }catch(e){
      console.error('Analysis error:',e);
      try{
        const fallback=normalizeResult(analyzeContent({file:null,caption:caption||'sample content',platform,duration:0}));
        setResult(fallback);
        setPhase('results');
      }catch(e2){
        console.error('Fallback also failed:',e2);
        setResultsError('Analysis failed. Please try again.');
        setPhase('upload');
      }
    }
  };

  const handleDelete=id=>{deleteAnalysis(id,user.uid);setHistory(getHistory(user.uid));setHistStats(getUserHistoryStats(user.uid));};
  const handleClear=()=>{clearHistory(user.uid);setHistory([]);setHistStats(null);};
  const handleLogout=()=>{logout();setUser(null);setPhase('upload');setResult(null);setView('dashboard');};

  if(!ready)return<div className="fixed inset-0 bg-[#07101f] flex items-center justify-center"><div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"/></div>;
  if(!user)return<AuthPage onAuth={setUser}/>;

  return(
    <>
      <Nav onNavigate={setView} currentView={view} user={user} onLogout={handleLogout}/>
      <Side onNavigate={setView} currentView={view}/>
      <main className="lg:ml-60 pt-24 px-4 md:px-8 pb-20 min-h-screen">
        <AnimatePresence mode="wait">
          {view==='history'&&(
            <motion.div key="hist" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="space-y-6 max-w-5xl">
              <div><h1 className="font-jakarta text-4xl font-extrabold text-white tracking-tight">Analysis <span className="text-gradient">History</span></h1><p className="text-slate-400 mt-2">All of {user.displayName}'s past analyses — private to your account.</p></div>
              <History history={history} onClear={handleClear} onDelete={handleDelete}/>
            </motion.div>
          )}
          {view==='chat'&&(
            <motion.div key="chat" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="space-y-6 max-w-3xl mx-auto">
              <div><h1 className="font-jakarta text-4xl font-extrabold text-white tracking-tight">AI <span className="text-gradient">Coach</span></h1><p className="text-slate-400 mt-2">Your private AI content strategist.</p></div>
              <Chat result={result} historyStats={histStats} trends={trends} externalPrompt={chatPrompt} onExternalPromptHandled={()=>setChatPrompt(null)} fullHeight/>
            </motion.div>
          )}
          {view==='trends'&&(
            <motion.div key="trends" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="max-w-7xl">
              <TrendsDashboard/>
            </motion.div>
          )}
          {view==='dashboard'&&(
            <motion.div key="dash" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="max-w-7xl">
              <AnimatePresence mode="wait">
                {phase==='upload'&&(
                  <motion.div key="up" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}} className="space-y-8">
                    <div className="text-center max-w-2xl mx-auto pt-6">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-5"><I n="auto_awesome" s={{fontSize:14}}/> AI-Powered Virality Engine</div>
                      <h1 className="font-jakarta text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight mb-4">Predict Your <span className="text-gradient">Viral Potential</span></h1>
                      <p className="text-slate-400 text-lg">Upload your content and get an instant AI virality score, detailed insights, and step-by-step optimization tips.</p>
                    </div>
                    <Upload onAnalyze={handleAnalyze}/>
                    <CreatorInsights/>
                  </motion.div>
                )}
                {phase==='loading'&&<motion.div key="load" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="pt-12 space-y-8"><Loader/><SkeletonDash/></motion.div>}
                {phase==='results'&&result&&(
                  <motion.div key="res" initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
                    <div className="flex items-center justify-between">
                      <button onClick={()=>{setPhase('upload');setResult(null);setResultsError(null);}} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-semibold"><I n="arrow_back" s={{fontSize:18}}/> Analyze Another</button>
                      <span className="badge badge-purple">{user.displayName}'s Analysis</span>
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                      <div className="xl:col-span-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5"><ScoreCircle score={result.totalScore}/><Metrics metrics={result.metrics} platform={result.platform}/></div>
                        <Insights result={result}/>
                        <BeforeAfter result={result}/>
                        <History history={history} onClear={handleClear} onDelete={handleDelete}/>
                      </div>
                      <div className="xl:col-span-4 space-y-5">
                        <Suggestions suggestions={suggestions} onRegen={()=>setSuggV(v=>v+1)} onAction={cmd=>setChatPrompt(cmd)}/>
                        <Chat result={result} historyStats={histStats} trends={trends} externalPrompt={chatPrompt} onExternalPromptHandled={()=>setChatPrompt(null)}/>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
