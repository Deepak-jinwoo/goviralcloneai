import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const I = ({n,c='',s}) => <span className={`material-symbols-outlined ${c}`} style={s}>{n}</span>;

// ─── NAV ────────────────────────────────────────────────────────────
export const Nav = ({onNavigate, currentView, user}) => (
  <nav className="fixed top-0 z-[60] w-full px-5 md:px-10 py-4 bg-[#07101f]/70 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center">
    <div className="flex items-center gap-8">
      <span onClick={()=>onNavigate('dashboard')} className="text-xl font-extrabold tracking-tight text-white font-jakarta cursor-pointer flex items-center gap-2">
        <span className="w-7 h-7 premium-gradient rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30"><I n="rocket_launch" c="text-white" s={{fontSize:14}}/></span>
        Go Viral<span className="text-purple-400">.</span>
      </span>
      <div className="hidden md:flex items-center gap-8">
        {[['dashboard','Dashboard'],['history','History'],['chat','AI Chat']].map(([v,l])=>(
          <a key={v} href="#" onClick={e=>{e.preventDefault();onNavigate(v)}} className={`text-sm font-semibold font-jakarta transition-all ${currentView===v?'text-white':'text-slate-500 hover:text-slate-300'}`}>{l}</a>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={()=>onNavigate('dashboard')} className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full premium-gradient text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all">
        <I n="auto_awesome" s={{fontSize:14}}/> Analyze
      </button>
    </div>
  </nav>
);

// ─── SIDEBAR ─────────────────────────────────────────────────────────
export const Side = ({onNavigate, currentView}) => (
  <aside className="fixed left-0 top-0 h-full w-60 bg-[#07101f]/50 backdrop-blur-2xl border-r border-white/5 pt-24 px-5 hidden lg:flex flex-col z-50">
    <div className="mb-6 px-2">
      <p className="label-caps text-purple-400 mb-1">Navigation</p>
      <p className="text-xl font-bold text-white font-jakarta">Virality Pro</p>
    </div>
    <nav className="flex flex-col gap-1 flex-grow">
      {[['dashboard','Dashboard','home'],['history','History','history'],['chat','AI Chat','smart_toy'],['insights','Trends','trending_up']].map(([view,label,icon])=>(
        <a key={label} href="#" onClick={e=>{e.preventDefault();onNavigate(view)}} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-jakarta transition-all ${currentView===view?'bg-white/5 text-purple-300 border border-white/5':'text-slate-500 hover:text-slate-200 hover:bg-white/[0.03]'}`}>
          <I n={icon} s={{fontSize:18}}/>{label}
        </a>
      ))}
    </nav>
    <div className="pb-8">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border border-purple-500/20 relative overflow-hidden">
        <p className="text-sm font-bold text-white mb-1">Go Pro 🚀</p>
        <p className="text-xs text-slate-400 mb-3">Unlock real-time trends, unlimited analysis & API access.</p>
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
  const [platform,setPlatform]=useState('tiktok');
  const [file,setFile]=useState(null);
  const [preview,setPreview]=useState(null);
  const [error,setError]=useState('');

  const disabled = !file && !caption.trim();
  const charColor = caption.length>200?'text-red-400':caption.length>=80?'text-green-400':'text-slate-500';

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
    if(disabled){setError('Please upload a file or enter a caption to analyze.');return;}
    setError('');onAnalyze({file,caption,platform});
  };

  const platforms = [['tiktok','TikTok','#ff0050'],['instagram','Instagram','#e1306c'],['youtube','YouTube','#ff0000']];

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="space-y-5 max-w-2xl mx-auto">
      {/* Drop Zone */}
      <div
        onClick={pickFile}
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={()=>setDrag(false)}
        onDrop={handleDrop}
        className={`glass glow-hover rounded-3xl p-8 text-center cursor-pointer transition-all border-dashed ${drag?'drag-active':'border-white/10'}`}
      >
        {preview && file ? (
          <div className="space-y-3">
            {file.type?.startsWith('video/')?
              <video src={preview} className="w-full max-h-40 rounded-xl object-cover mx-auto" muted/>:
              <img src={preview} alt="" className="w-full max-h-40 rounded-xl object-cover mx-auto"/>
            }
            <div className="flex items-center justify-center gap-3">
              <span className="badge badge-purple"><I n={file.type?.startsWith('video/')?"videocam":"image"} s={{fontSize:11}}/> {file.type?.startsWith('video/')?'Video':'Image'}</span>
              <span className="text-sm text-white font-semibold truncate max-w-[200px]">{file.name}</span>
              <span className="text-xs text-slate-500">{(file.size/1024/1024).toFixed(1)} MB</span>
            </div>
            <p className="text-xs text-slate-500">Click to change file</p>
          </div>
        ):(
          <div>
            <div className="flex justify-center gap-5 mb-5">
              {[['play_circle','text-red-400'],['photo_camera','text-pink-400'],['article','text-blue-400']].map(([ic,c])=>(
                <div key={ic} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-purple-500/30 transition-all"><I n={ic} c={`${c} text-3xl`}/></div>
              ))}
            </div>
            <h3 className="font-jakarta text-xl font-bold text-white mb-1">Drop your content here</h3>
            <p className="text-sm text-slate-500">Video, image — TikTok, Instagram, YouTube Shorts</p>
            <p className="text-xs text-slate-600 mt-2">Or click to browse files</p>
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="glass rounded-2xl p-1 flex items-center">
        <textarea
          value={caption}
          onChange={e=>{setCaption(e.target.value);setError('');}}
          placeholder="Paste your caption or describe your content…"
          rows={2}
          className="flex-1 bg-transparent border-0 outline-none px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none"
        />
        <div className={`px-4 text-xs font-bold tabular-nums ${charColor}`}>{caption.length}<span className="text-slate-600">/300</span></div>
      </div>

      {/* Platform + Analyze */}
      <div className="flex gap-3">
        <div className="flex gap-2 glass rounded-2xl p-1">
          {platforms.map(([v,l])=>(
            <button key={v} onClick={()=>setPlatform(v)} className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${platform===v?'premium-gradient text-white shadow-md shadow-purple-500/20':'text-slate-400 hover:text-slate-200'}`}>{l}</button>
          ))}
        </div>
        <button
          onClick={handleAnalyze}
          disabled={disabled}
          className={`flex-1 py-3 rounded-2xl font-jakarta font-bold text-sm transition-all flex items-center justify-center gap-2 ${disabled?'bg-slate-800/50 text-slate-600 cursor-not-allowed':'premium-gradient text-white shadow-xl shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          <I n="auto_awesome" s={{fontSize:18}}/> Analyze Viral Potential
        </button>
      </div>

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
          <span className="label-caps text-slate-500 mt-1">Virality Score</span>
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
export const Metrics = ({metrics}) => {
  const m=metrics||{};
  const [mounted,setMounted]=useState(false);
  useEffect(()=>{const t=setTimeout(()=>setMounted(true),200);return()=>clearTimeout(t);},[]);

  const color = v => v>=70?'#4ade80':v>=40?'#fbbf24':'#f87171';
  const textColor = v => v>=70?'text-green-400':v>=40?'text-amber-400':'text-red-400';

  const bars = [
    {icon:'anchor',label:'Hook',val:m.hookPercent||0,tip:'Opening hook strength'},
    {icon:'forum',label:'Engagement',val:m.engagementPercent||0,tip:'Engagement trigger density'},
    {icon:'edit_note',label:'Caption',val:m.captionPercent||0,tip:'Caption quality & CTA'},
    {icon:'image',label:'Thumbnail',val:m.thumbnailPercent||0,tip:'Visual appeal score'},
  ];

  const tags = [
    {icon:'timer',label:'Pacing',val:m.pacingLevel||'N/A'},
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

