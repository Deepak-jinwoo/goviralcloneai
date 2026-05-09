import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const I = ({n,c='',s}) => <span className={`material-symbols-outlined ${c}`} style={s}>{n}</span>;

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center glass rounded-3xl mt-12 border border-red-500/20">
          <I n="warning" c="text-red-400 text-5xl mb-4" />
          <h2 className="text-xl font-bold text-white mb-2 font-jakarta">Something went wrong.</h2>
          <p className="text-sm text-slate-400 mb-6 max-w-md">We encountered an unexpected error while rendering this component. Our team has been notified.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition">Refresh Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── NAV ────────────────────────────────────────────────────────────
export const Nav = ({onNavigate, currentView, user, onLogout}) => (
  <nav className="fixed top-0 z-[60] w-full px-5 md:px-10 py-4 bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center">
    <div className="flex items-center gap-8">
      <span onClick={()=>onNavigate('dashboard')} className="text-xl font-bold tracking-tight text-white font-inter cursor-pointer flex items-center gap-2">
        <span className="w-7 h-7 bg-white rounded flex items-center justify-center"><I n="rocket_launch" c="text-black" s={{fontSize:16}}/></span>
        Go Viral<span className="text-zinc-500 font-medium ml-1">AI</span>
      </span>
      <div className="hidden md:flex items-center gap-8">
        {[['dashboard','Dashboard'],['history','History'],['chat','AI Chat'],['trends','Trends']].map(([v,l])=>(
          <a key={v} href="#" onClick={e=>{e.preventDefault();onNavigate(v)}} className={`text-sm font-semibold font-inter transition-all ${currentView===v?'text-white':'text-zinc-500 hover:text-zinc-300'}`}>{l}</a>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {user && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
          <div className="w-5 h-5 rounded-full premium-gradient flex items-center justify-center text-[10px] font-bold text-white uppercase">{user.displayName.charAt(0)}</div>
          <span className="text-xs font-medium text-zinc-300">{user.displayName}</span>
          <button onClick={onLogout} className="ml-2 text-zinc-500 hover:text-red-400 transition-colors" title="Log out"><I n="logout" s={{fontSize:14}}/></button>
        </div>
      )}
      <button onClick={()=>onNavigate('dashboard')} className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-xs font-bold hover:scale-105 active:scale-95 transition-all">
        <I n="auto_awesome" s={{fontSize:14}}/> Analyze
      </button>
    </div>
  </nav>
);

// ─── SIDEBAR ─────────────────────────────────────────────────────────
export const Side = ({onNavigate, currentView}) => (
  <aside className="fixed left-0 top-0 h-full w-60 bg-[#09090b]/80 backdrop-blur-2xl border-r border-white/5 pt-24 px-5 hidden lg:flex flex-col z-50">
    <div className="mb-6 px-2">
      <p className="label-caps text-purple-400 mb-1">Navigation</p>
      <p className="text-xl font-bold text-white font-jakarta">Virality Pro</p>
    </div>
    <nav className="flex flex-col gap-1 flex-grow">
      {[['dashboard','Dashboard','home'],['history','History','history'],['chat','AI Chat','smart_toy'],['trends','Trends','trending_up']].map(([view,label,icon])=>(
        <a key={label} href="#" onClick={e=>{e.preventDefault();onNavigate(view)}} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-inter transition-all ${currentView===view?'bg-white/5 text-white border border-white/5':'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'}`}>
          <I n={icon} s={{fontSize:18}}/>{label}
        </a>
      ))}
    </nav>
    <div className="pb-8">
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
        <p className="text-sm font-bold text-white mb-1">Go Pro 🚀</p>
        <p className="text-xs text-zinc-500 mb-3">Unlock real-time trends, unlimited analysis & API access.</p>
        <button className="w-full py-2 premium-gradient rounded-xl text-xs font-bold text-white shadow-md shadow-purple-500/20">Upgrade Now</button>
      </div>
    </div>
  </aside>
);

// ─── SKELETON ─────────────────────────────────────────────────────────
const Sk = ({h='h-4',w='w-full'}) => <div className={`skeleton ${h} ${w} rounded-lg`}/>;
export const SkeletonDash = () => (
  <div className="space-y-6 animate-in">
    <div className="glass rounded-3xl p-8 space-y-4"><Sk h="h-5" w="w-40"/><Sk h="h-36"/><Sk h="h-4" w="w-56"/></div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="glass rounded-2xl p-5 space-y-3"><Sk h="h-3" w="w-16"/><Sk h="h-7" w="w-12"/></div>)}</div>
  </div>
);

// ─── UPLOAD ───────────────────────────────────────────────────────────
export const Upload = ({onAnalyze}) => {
  const [drag,setDrag]=useState(false);
  const [caption,setCaption]=useState('');
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState('');

  const disabled = !file && !caption.trim();
  const charColor = caption.length>200?'text-red-400':caption.length>=80?'text-green-400':'text-zinc-500';

  const pickFile = () => {
    const inp=document.createElement('input');
    inp.type='file';inp.accept='video/*,image/*';
    inp.onchange=e=>{
      const f=e.target.files[0];
      if(f){setFile(f);setError('');setPreview(URL.createObjectURL(f));}
    };inp.click();
  };

  const handleDrop = e => {
    e.preventDefault();setDrag(false);
    const f=e.dataTransfer.files[0];
    if(f){setFile(f);setError('');setPreview(URL.createObjectURL(f));}
  };

  const handleAnalyze = () => {
    if(!file && caption.trim().length < 5) {
      setError('Please upload a file or enter at least 5 characters of text to analyze.');
      return;
    }
    setError('');
    // Auto-detect is handled in scoringEngine. We pass platform 'tiktok' as default baseline.
    onAnalyze({file,caption,platform:'tiktok'});
  };

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-4 max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        onClick={pickFile}
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={handleDrop}
        className={`glass rounded-2xl p-10 text-center cursor-pointer transition-all border-dashed ${drag?'drag-active':'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}`}
      >
        {preview && file ? (
          <div className="space-y-4">
            {file.type?.startsWith('video/')?
              <video src={preview} className="w-full max-h-48 rounded-lg object-cover mx-auto" muted/>:
              <img src={preview} alt="" className="w-full max-h-48 rounded-lg object-cover mx-auto"/>
            }
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-zinc-300 font-medium truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-zinc-500">{(file.size/1024/1024).toFixed(1)} MB</span>
            </div>
            <p className="text-xs text-zinc-500">Click or drag to change file</p>
          </div>
        ):(
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/[0.03] border border-white/5 mx-auto flex items-center justify-center">
              <I n="cloud_upload" c="text-zinc-400 text-2xl"/>
            </div>
            <div>
              <h3 className="font-inter text-lg font-semibold text-white mb-1">Drop your content here</h3>
              <p className="text-sm text-zinc-500">Upload video, image, or post to analyze viral potential</p>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="glass rounded-xl p-1 flex items-center focus-within:border-white/20 transition-colors">
        <textarea
          value={caption}
          onChange={e=>{setCaption(e.target.value);setError('');}}
          placeholder="Paste your caption, script, or text post..."
          rows={2}
          className="flex-1 bg-transparent border-0 outline-none px-4 py-3 text-sm text-white placeholder:text-zinc-600 resize-none"
        />
        <div className={`px-4 text-xs font-semibold tabular-nums ${charColor}`}>{caption.length}<span className="text-zinc-600">/300</span></div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={disabled}
        className={`w-full py-3.5 rounded-xl font-inter font-semibold text-sm transition-all flex items-center justify-center gap-2 ${disabled?'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-white/5':'bg-white text-black hover:bg-zinc-200 active:scale-[0.98]'}`}
      >
        <I n="analytics" s={{fontSize:18}}/> Predict Audience Reach
      </button>

      <AnimatePresence>
        {error && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <I n="error_outline" s={{fontSize:16}}/>{error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── SCORE CIRCLE ─────────────────────────────────────────────────────
export const ScoreCircle = ({score=0}) => {
  const [count,setCount]=useState(0);
  useEffect(()=>{
    let s=0;const step=Math.ceil(score/40);
    const t=setInterval(()=>{s=Math.min(s+step,score);setCount(s);if(s>=score)clearInterval(t);},40);
    return()=>clearInterval(t);
  },[score]);

  const tier = score>=80?{l:'🔥 Viral',c:'text-green-400',b:'badge-green'}:score>=60?{l:'💪 Strong',c:'text-blue-400',b:'badge-blue'}:score>=40?{l:'⚡ Average',c:'text-amber-400',b:'badge-amber'}:{l:'💡 Needs Work',c:'text-red-400',b:'badge-red'};
  const reach = score>=80?'500k–2M':score>=60?'80k–500k':score>=40?'10k–80k':'<10k';
  const off = 590-(590*score/100);

  return (
    <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="glass card-3d p-8 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-4 right-4"><div className="w-2.5 h-2.5 bg-green-500 rounded-full pulse-dot"/></div>
      <div className="relative w-48 h-48 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 208 208">
          <circle cx="104" cy="104" r="94" fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth="8"/>
          <circle cx="104" cy="104" r="94" fill="transparent" stroke="url(#sg)" strokeWidth="12" strokeLinecap="round" strokeDasharray="590" strokeDashoffset={off} className="score-animate"/>
          <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#a855f7"/><stop offset="100%" stopColor="#4cd7f6"/></linearGradient></defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-extrabold text-white font-jakarta tracking-tighter">{count}</span>
          <span className="label-caps text-zinc-500 mt-1">Viral Potential</span>
        </div>
      </div>
      <span className={`badge ${tier.b} mb-2`}>{tier.l}</span>
      <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
        <I n="visibility" s={{fontSize:14}} c="text-slate-500"/>
        Estimated reach: <span className="font-bold text-white">{reach} views</span>
      </div>
    </motion.div>
  );
};

// ─── METRICS ──────────────────────────────────────────────────────────
export const Metrics = ({metrics, platform}) => {
  const m=metrics||{};
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),200);return()=>clearTimeout(t);},[]);

  const color = v => v>=70?'#4ade80':v>=40?'#fbbf24':'#f87171';
  const textColor = v => v>=70?'text-green-400':v>=40?'text-amber-400':'text-red-400';

  const bars = [
    {icon:'anchor',label:'Hook Effectiveness',val:m.hookPercent||0},
    {icon:'forum',label:'Engagement Prediction',val:m.engagementPercent||0},
    {icon:'timer',label:'Retention Prediction',val:m.retentionPrediction||0},
    {icon:'edit_note',label:'Caption Quality',val:m.captionPercent||0},
  ];

  const platLabel = platform ? platform.charAt(0).toUpperCase()+platform.slice(1) : 'Auto';
  const tags = [
    {icon:'public',label:'Platform',val:platLabel},
    {icon:'trending_up',label:'Trend',val:m.trendStatus||'N/A'},
  ];

  return (
    <div className="glass card-3d rounded-3xl p-6 space-y-5">
      <h3 className="font-bold text-white font-jakarta text-lg">Metric Breakdown</h3>
      <div className="space-y-4">
        {bars.map(({icon,label,val,tip})=>(
          <div key={label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2"><I n={icon} c="text-slate-500" s={{fontSize:15}}/><span className="text-xs text-slate-400 font-semibold">{label}</span></div>
              <span className={`text-sm font-bold tabular-nums ${textColor(val)}`}>{val}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width:mounted?`${val}%`:'0%',background:`linear-gradient(90deg, ${color(val)}88, ${color(val)})`}}/>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 pt-2">
        {tags.map(({icon,label,val})=>{
          const good = val==='High'||val==='Hot';
          const bad = val==='Low'||val==='Cold';
          return (
            <div key={label} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
              <I n={icon} c={good?'text-green-400':bad?'text-red-400':'text-amber-400'} s={{fontSize:18}}/>
              <div><p className="text-xs text-slate-500">{label}</p><p className={`text-sm font-bold ${good?'text-green-400':bad?'text-red-400':'text-amber-400'}`}>{val}</p></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── INSIGHTS ──────────────────────────────────────────────────────────
export const Insights = ({result}) => {
  if (!result) return null;
  const m=result?.metrics||{};
  const strengths=[];const issues=[];

  if(m.hookPercent>=65)strengths.push({title:'Strong Hook',body:`Your opening grabs attention immediately (${m.hookPercent}% strength). The algorithm rewards high completion rate.`});
  else issues.push({title:'Weak Hook',body:`Your hook scores only ${m.hookPercent}%. Start with a question, shock stat, or bold statement in the first 1-2 seconds.`});

  if(m.engagementPercent>=65)strengths.push({title:'High Engagement Triggers',body:`Engagement signals detected at ${m.engagementPercent}%. Viewers are likely to comment and share.`});
  else issues.push({title:'Low Engagement Density',body:`Engagement at ${m.engagementPercent}%. Add power words like "wait", "secret", or ask a question to drive comments.`});

  if(m.captionPercent>=65)strengths.push({title:'Effective Caption',body:`Caption quality at ${m.captionPercent}%. Good length and structure with clear call-to-action.`});
  else issues.push({title:'Caption Needs Work',body:`Caption scores ${m.captionPercent}%. Aim for 80-200 characters with a CTA like "Save this" or "Tag someone who needs this".`});

  if(m.thumbnailPercent>=65)strengths.push({title:'Eye-Catching Thumbnail',body:`Thumbnail appeal at ${m.thumbnailPercent}%. Strong visual contrast will reduce scroll-past rate.`});
  else issues.push({title:'Thumbnail Weak',body:`Thumbnail at ${m.thumbnailPercent}%. Use a close-up face, bold 3-4 word text, and bright colors.`});

  if(m.trendStatus==='Hot')strengths.push({title:'Trending Content',body:'Your content aligns with current platform trends. Trend-aligned posts get 3-5× more reach. 🔥'});
  else if(m.trendStatus==='Cold')issues.push({title:'No Trend Alignment',body:'Missing trending hashtags. Add #fyp #viral #trending and 2-3 niche-specific tags to boost discoverability.'});

  if(m.pacingLevel==='High')strengths.push({title:'Fast Pacing',body:'Quick cuts keep retention high and tell the algorithm this content is engaging.'});
  else if(m.pacingLevel==='Low')issues.push({title:'Slow Pacing',body:'Slow pacing hurts completion rate. Cut every 2-3 seconds and trim to under 30s for best retention.'});

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[{title:'Strengths',color:'green',icon:'thumb_up',items:strengths},{title:'Action Items',color:'amber',icon:'construction',items:issues}].map(s=>(
        <motion.div key={s.title} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className={`glass card-3d p-6 rounded-3xl border-t-2 border-${s.color}-500/30`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-full bg-${s.color}-500/10 flex items-center justify-center`}><I n={s.icon} c={`text-${s.color}-400 text-base`}/></div>
            <h4 className="font-bold text-white font-jakarta">{s.title}</h4>
            <span className={`ml-auto badge badge-${s.color==='green'?'green':'amber'}`}>{s.items.length}</span>
          </div>
          {s.items.length===0?(
            <p className="text-sm text-slate-500 italic">{s.color==='green'?'Upload content to see strengths.':'Great work — nothing critical!'}</p>
          ):(
            <ul className="space-y-3">{s.items.map((item,i)=>(
              <li key={i} className="flex gap-3">
                <span className={`w-1.5 h-1.5 rounded-full bg-${s.color}-400 mt-2 shrink-0`}/>
                <div><p className={`text-sm font-semibold text-${s.color}-400 mb-0.5`}>{item.title}</p><p className="text-xs text-slate-400 leading-relaxed">{item.body}</p></div>
              </li>
            ))}</ul>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ─── SUGGESTIONS ───────────────────────────────────────────────────────
export const Suggestions = ({suggestions,onRegen,onAction}) => (
  <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="glass card-3d p-6 rounded-3xl">
    <div className="flex items-center justify-between mb-5">
      <h3 className="font-bold text-white font-jakarta">AI Enhancements</h3>
      <span className="badge badge-purple">AI Powered</span>
    </div>
    <div className="space-y-2.5">
      {(suggestions||[]).map((s,i)=>(
        <motion.div
          key={i}
          initial={{opacity:0,x:10}}
          animate={{opacity:1,x:0}}
          transition={{delay:i*0.06}}
          onClick={()=>onAction&&onAction(s.actionCommand||s.label)}
          className="p-3.5 bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-purple-500/30 hover:bg-white/[0.06] transition-all cursor-pointer group flex items-center gap-3"
        >
          <div className={`w-9 h-9 rounded-xl bg-${s.color||'purple-400'}/10 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
            <I n={s.icon||'auto_awesome'} c={`text-${s.color||'purple-400'} text-lg`}/>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{s.label}</p>
            <p className="text-xs text-slate-500 truncate">{s.desc}</p>
          </div>
          <I n="chevron_right" c="text-slate-600 group-hover:text-purple-400 transition text-lg shrink-0"/>
        </motion.div>
      ))}
    </div>
    <div className="mt-4 flex gap-2">
      <button onClick={onRegen} className="flex-1 py-2.5 rounded-xl bg-white/[0.04] text-xs font-bold text-slate-300 hover:bg-white/[0.08] transition border border-white/5 flex items-center justify-center gap-1.5"><I n="refresh" s={{fontSize:14}}/>Regenerate</button>
      <button className="flex-1 py-2.5 rounded-xl premium-gradient text-xs font-bold text-white shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5"><I n="picture_as_pdf" s={{fontSize:14}}/>Export PDF</button>
    </div>
  </motion.div>
);

// ─── BEFORE / AFTER ───────────────────────────────────────────────────
export const BeforeAfter = ({result}) => {
  if (!result) return null;
  const score=result?.totalScore||0;
  const opt=Math.min(score+Math.round((100-score)*0.65),97);
  const m=result?.metrics||{};

  const changes=[
    m.hookPercent<70?['Weak generic opening','Power hook: "Stop scrolling…"']:['Decent hook present','Refined with urgency trigger'],
    m.captionPercent<70?['Caption missing CTA','Rewritten: CTA + emojis + keywords']:['Good caption structure','Optimized with trending words'],
    m.trendStatus==='Cold'?['No hashtags detected','Added #fyp #viral + niche tags']:['Some hashtags present','Full 8-hashtag viral strategy'],
    m.pacingLevel==='Low'?['Slow pacing / long video','Fast-cut edit — trimmed to 20s']:['Moderate pacing','Tightened transitions every 2s'],
  ];

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass card-3d rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <I n="compare_arrows" c="text-purple-400"/>
        <h3 className="font-bold text-white font-jakarta">Before vs After Optimization</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[{label:'Original',color:'red',s:score,items:changes.map(c=>c[0])},{label:'Optimized',color:'green',s:opt,items:changes.map(c=>c[1])}].map(({label,color,s,items})=>(
          <div key={label} className={`p-4 rounded-2xl bg-${color}-500/[0.04] border border-${color}-500/20`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`label-caps text-${color}-400`}>{label}</span>
              <span className={`badge badge-${color==='red'?'red':'green'}`}>{s}/100</span>
            </div>
            <ul className="space-y-2">
              {items.map((t,i)=>(
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <I n={color==='green'?'check_circle':'cancel'} c={`text-${color}-400 shrink-0`} s={{fontSize:13}}/>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-xl bg-green-500/5 border border-green-500/20 flex items-center gap-3">
        <I n="trending_up" c="text-green-400"/>
        <p className="text-xs text-slate-300">Applying these changes could boost your score by <span className="text-green-400 font-bold">+{opt-score} points</span> and reach <span className="text-green-400 font-bold">3-8× more viewers</span>.</p>
      </div>
    </motion.div>
  );
};

// ─── CREATOR INSIGHTS ─────────────────────────────────────────────────
export const CreatorInsights = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);

  const hour = new Date().getHours();
  const peakTime = hour < 12 ? '7:30 PM' : hour < 17 ? '8:45 PM' : '9:15 PM';
  const activity = hour >= 9 && hour <= 11 ? 72 : hour >= 18 && hour <= 22 ? 94 : hour >= 13 && hour <= 16 ? 58 : 41;

  const cards = [
    { icon: 'schedule', label: 'Best Posting Time', value: peakTime, sub: 'Based on audience behavior', accent: 'purple' },
    { icon: 'group', label: 'Audience Activity', value: `${activity}%`, sub: activity >= 70 ? 'Peak — post now!' : 'Building — wait for peak', accent: activity >= 70 ? 'green' : 'amber' },
    { icon: 'movie_filter', label: 'Recommended Style', value: 'Short Storytelling', sub: 'Hooks + fast cuts + CTA', accent: 'cyan' },
    { icon: 'local_fire_department', label: 'Niche Trend', value: 'AI + Productivity', sub: 'Rising +34% this week', accent: 'pink' },
    { icon: 'trending_up', label: 'Engagement Boost', value: '+38%', sub: 'If you apply AI suggestions', accent: 'green' },
  ];

  const accentMap = { purple: '#a855f7', green: '#4ade80', amber: '#fbbf24', cyan: '#22d3ee', pink: '#f472b6' };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-3xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl premium-gradient flex items-center justify-center shadow-md shadow-purple-500/20">
            <I n="insights" c="text-white" s={{ fontSize: 16 }} />
          </div>
          <div>
            <h3 className="font-bold text-white font-jakarta text-base">Creator Insights</h3>
            <p className="text-[10px] text-slate-500 font-medium">AI-powered intelligence for your content</p>
          </div>
        </div>
        <span className="badge badge-purple text-[9px]">Live</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 12 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-purple-500/25 hover:bg-white/[0.04] transition-all cursor-default relative overflow-hidden"
          >
            {/* subtle glow */}
            <div className="absolute -top-8 -right-8 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" style={{ background: accentMap[c.accent] + '15' }} />

            <div className="flex items-center gap-2 mb-3 relative">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: accentMap[c.accent] + '15' }}>
                <I n={c.icon} s={{ fontSize: 15, color: accentMap[c.accent] }} />
              </div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider leading-tight">{c.label}</span>
            </div>

            <p className="text-lg font-extrabold text-white font-jakarta mb-0.5 relative" style={{ color: accentMap[c.accent] }}>{c.value}</p>
            <p className="text-[10px] text-slate-500 leading-snug relative">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* mini live bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-500 rounded-full pulse-dot" />
          <span className="text-[10px] text-green-400 font-bold">LIVE</span>
        </div>
        <p className="text-[11px] text-slate-400 flex-1">Your audience is most active right now — this is the best window to post content for maximum reach.</p>
        <I n="arrow_forward" c="text-slate-600" s={{ fontSize: 14 }} />
      </div>
    </motion.div>
  );
};

// ─── TRENDS DASHBOARD ────────────────────────────────────────────────
export const TrendsDashboard = () => {
  const [trends, setTrends] = useState(null);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    import('./utils/trendsEngine.js').then(({ analyzeTrends }) => {
      setTrends(analyzeTrends());
    });
  }, []);

  if (!trends) return <SkeletonDash />;

  const copy = (txt, id) => { navigator.clipboard?.writeText(txt); setCopied(id); setTimeout(() => setCopied(null), 1500); };

  const categories = [
    { name:'AI Storytelling Shorts', icon:'auto_awesome', status:'Exploding 🚀', potential:92, reach:'1M–5M', growth:'+240%', competition:'Low' },
    { name:'Productivity Hacks',     icon:'bolt',         status:'Exploding 🚀', potential:88, reach:'500k–2M',growth:'+180%', competition:'Medium' },
    { name:'Finance & Side Hustles', icon:'payments',     status:'Hot',           potential:82, reach:'200k–1M',growth:'+120%', competition:'Medium' },
    { name:'Gaming Edits',           icon:'sports_esports',status:'Hot',          potential:78, reach:'300k–1.5M',growth:'+95%',competition:'High' },
    { name:'Educational Shorts',     icon:'school',       status:'Growing',       potential:75, reach:'100k–500k',growth:'+85%',competition:'Low' },
    { name:'Mini Vlogs',             icon:'videocam',     status:'Growing',       potential:72, reach:'80k–400k', growth:'+70%',competition:'Low' },
    { name:'Tech Facts & Reviews',   icon:'memory',       status:'Hot',           potential:80, reach:'150k–800k',growth:'+110%',competition:'Medium' },
    { name:'Motivation & Mindset',   icon:'psychology',   status:'Growing',       potential:68, reach:'100k–300k',growth:'+55%',competition:'High' },
    { name:'Relatable POV Content',  icon:'person',       status:'Exploding 🚀', potential:90, reach:'800k–3M', growth:'+200%',competition:'Low' },
  ];

  const hooks = [
    'Stop scrolling — this will change how you think about [topic].',
    "I tested this for 30 days. Here's what nobody tells you…",
    "The reason you're not going viral is this ONE thing.",
    "POV: You just discovered the secret everyone's been hiding.",
    'Wait until the end — this gets insane.',
    "Nobody is talking about this hack and it's worth millions.",
  ];

  const hashtags = [
    ...(trends.trendingHashtags?.tiktok || []),
    ...(trends.trendingHashtags?.instagram || []),
    ...(trends.trendingHashtags?.youtube || []),
  ].filter((v,i,a) => a.indexOf(v) === i).slice(0, 18);

  const tips = [
    'Post consistently — at least 4× per week for algorithm favor.',
    'Reply to every comment in the first 60 minutes after posting.',
    'Use trending audio released within the last 48 hours.',
    'Start with a question or bold stat in the first 2 seconds.',
    'Mix 2-3 broad hashtags with 3-4 niche-specific tags.',
    'Repurpose top-performing content across TikTok, Reels, and Shorts.',
  ];

  const formats = [
    { name:'Fast-Paced Storytelling', why:'Holds attention with rapid cuts and emotional hooks. Completion rate is 2× higher.', icon:'movie_filter', color:'#a855f7' },
    { name:'Relatable POV Content',   why:'Viewers see themselves in the content — instant connection and shares.', icon:'person', color:'#22d3ee' },
    { name:'Hyper-Short Educational',  why:'15-second knowledge bombs feel valuable. Algorithm pushes save-worthy content.', icon:'school', color:'#fbbf24' },
    { name:'AI-Generated Cinematic',   why:'Novel visuals stop the scroll. AI aesthetics are the #1 curiosity trigger in 2026.', icon:'auto_awesome', color:'#f472b6' },
  ];

  const postStyles = [
    { time:'7 – 9 AM', platform:'TikTok', type:'Educational / Motivational', boost:'+35%' },
    { time:'11 AM – 1 PM', platform:'Instagram', type:'Carousel / Before-After', boost:'+42%' },
    { time:'5 – 7 PM', platform:'YouTube', type:'Shorts / Tutorials', boost:'+28%' },
    { time:'8 – 10 PM', platform:'All', type:'Storytelling / Entertainment', boost:'+55%' },
  ];

  const scl = s => s.includes('Exploding') ? 'green' : s === 'Hot' ? 'amber' : 'blue';

  return (
    <motion.div key="trends-page" initial={{opacity:0}} animate={{opacity:1}} className="space-y-8">
      <section className="mb-2">
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="font-jakarta text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight">
          Creator <span className="text-gradient">Intelligence</span> 🚀
        </motion.h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-lg text-slate-400 max-w-2xl">
          Discover what goes viral in 2026. Leverage AI-predicted trends to maximize your reach.
        </motion.p>
      </section>

      {/* TRENDING NICHES */}
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.15}} className="glass rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white text-xl font-jakarta flex items-center gap-2"><I n="travel_explore" c="text-purple-400"/> What Will Go Viral in 2026</h3>
          <span className="badge badge-green text-[9px]">Live Data</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c, i) => {
            const sc = scl(c.status);
            return (
              <motion.div key={c.name} initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} transition={{delay:i*0.06}} className="p-5 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-purple-500/30 rounded-2xl transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform"><I n={c.icon} c="text-purple-400 text-xl"/></div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${sc}-500/10 text-${sc}-400 border border-${sc}-500/20`}>{c.status}</span>
                </div>
                <h4 className="font-bold text-white mb-2 text-sm">{c.name}</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Potential</p><p className="text-sm font-bold text-green-400">{c.potential}%</p></div>
                  <div><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Reach</p><p className="text-sm font-bold text-white">{c.reach}</p></div>
                  <div><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Growth</p><p className="text-sm font-bold text-blue-400">{c.growth}</p></div>
                  <div><p className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold">Competition</p><p className={`text-sm font-bold ${c.competition==='Low'?'text-green-400':c.competition==='High'?'text-red-400':'text-amber-400'}`}>{c.competition}</p></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">

          {/* Viral Formats */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white text-lg font-jakarta mb-5 flex items-center gap-2"><I n="movie_filter" c="text-pink-400"/> Fastest-Growing Viral Formats</h3>
            <div className="space-y-3">
              {formats.map((f, i) => (
                <motion.div key={f.name} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.3+i*0.08}} className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:f.color+'18'}}><I n={f.icon} s={{fontSize:18,color:f.color}}/></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-1">{f.name}</p>
                    <p className="text-xs text-slate-400 leading-relaxed">{f.why}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Posting Windows */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.35}} className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white text-lg font-jakarta mb-5 flex items-center gap-2"><I n="schedule" c="text-cyan-400"/> Best Posting Windows</h3>
            <div className="space-y-2">
              {postStyles.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <span className="text-xs font-bold text-purple-400 w-24 shrink-0 tabular-nums">{p.time}</span>
                  <span className="badge badge-blue text-[9px] shrink-0">{p.platform}</span>
                  <span className="text-xs text-slate-300 flex-1">{p.type}</span>
                  <span className="text-xs font-bold text-green-400">{p.boost}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Creator Tips */}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white text-lg font-jakarta mb-4 flex items-center gap-2"><I n="lightbulb" c="text-amber-400"/> AI Creator Tips</h3>
            <ul className="space-y-3">
              {tips.map((t, i) => (
                <li key={i} className="flex gap-3 items-start"><I n="check_circle" c="text-green-400 shrink-0" s={{fontSize:18}}/><p className="text-sm text-slate-300 leading-relaxed">{t}</p></li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-5 space-y-8">

          {/* Viral Hooks */}
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.25}} className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white text-lg font-jakarta mb-5 flex items-center gap-2"><I n="moving" c="text-green-400"/> Viral Hooks</h3>
            <div className="space-y-3">
              {hooks.map((h, i) => (
                <div key={i} onClick={() => copy(h, 'hook-'+i)} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-green-500/20 hover:bg-white/[0.04] transition-all group cursor-pointer">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm text-white font-medium italic leading-relaxed flex-1">&ldquo;{h}&rdquo;</p>
                    <I n={copied==='hook-'+i?'check':'content_copy'} c={copied==='hook-'+i?'text-green-400':'text-slate-600 group-hover:text-slate-300'} s={{fontSize:14}} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Trending Hashtags */}
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.35}} className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white text-lg font-jakarta mb-4 flex items-center gap-2"><I n="tag" c="text-blue-400"/> Trending Hashtags</h3>
            <div className="flex flex-wrap gap-2">
              {hashtags.map((h, i) => (
                <span key={i} onClick={() => copy(h, 'tag-'+i)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${copied==='tag-'+i?'bg-green-500/20 border border-green-500/30 text-green-400':'bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20'}`}>
                  {copied==='tag-'+i ? '✓ Copied' : h}
                </span>
              ))}
            </div>
            <button onClick={() => copy(hashtags.join(' '), 'all-tags')} className="mt-4 w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-xs font-bold text-slate-300 hover:bg-white/[0.08] transition flex items-center justify-center gap-1.5">
              <I n={copied==='all-tags'?'check':'content_copy'} s={{fontSize:14}}/> {copied==='all-tags'?'Copied!':'Copy All Hashtags'}
            </button>
          </motion.div>

          {/* Fastest Growing Niches */}
          <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} transition={{delay:0.45}} className="glass rounded-3xl p-6">
            <h3 className="font-bold text-white text-lg font-jakarta mb-4 flex items-center gap-2"><I n="local_fire_department" c="text-orange-400"/> Fastest Growing Niches</h3>
            <div className="space-y-2">
              {(trends.trendingNiches || ['fitness','finance','tech','education','comedy']).map((n, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full premium-gradient flex items-center justify-center text-[10px] font-bold text-white">{i+1}</span>
                    <span className="text-sm font-semibold text-white capitalize">{n}</span>
                  </div>
                  <span className="text-xs font-bold text-green-400">+{90-i*12}%</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};


