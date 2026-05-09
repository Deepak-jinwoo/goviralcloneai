/**
 * AI Assistant — Rich, contextual rule-based response generator
 */

export function generateAnalysisResponse(result, historyStats) {
  if (!result) return "Upload some content and I'll give you a full virality breakdown!";
  const {totalScore, metrics={}, contentType, caption, platform} = result;
  const {hookPercent=0,engagementPercent=0,captionPercent=0,pacingLevel,trendStatus} = metrics;
  let r = '';

  if(totalScore>=80) r=`🔥 Outstanding! Your content scores ${totalScore}/100 — this has serious viral potential. The algorithm will love it.`;
  else if(totalScore>=65) r=`💪 Solid score of ${totalScore}/100! A few smart tweaks and this could easily hit the Explore/FYP page.`;
  else if(totalScore>=45) r=`⚡ Your content scored ${totalScore}/100. There's good bones here — let me help you unlock its full potential.`;
  else r=`📊 Score: ${totalScore}/100. Don't worry — I've identified the exact issues holding you back. Let's fix them step by step.`;

  if(historyStats?.totalUploads>1 && historyStats.lastUploads?.length>1) {
    const prev=historyStats.lastUploads[1].score;
    if(totalScore>prev) r+=`\n\n📈 You improved ${totalScore-prev} points over your last upload! Keep this momentum going.`;
    else if(totalScore<prev) r+=`\n\n⬇️ This scored ${prev-totalScore} points lower than your previous upload. Let's identify why.`;
  }

  const scores=[{n:'hook',v:hookPercent},{n:'engagement',v:engagementPercent},{n:'caption',v:captionPercent}];
  const weakest=scores.sort((a,b)=>a.v-b.v)[0];

  if(weakest.n==='hook'&&weakest.v<70) r+=`\n\n🎣 Your hook is the weakest area (${weakest.v}%). You lose most viewers in the first 2 seconds — fix this first for maximum impact.`;
  else if(weakest.n==='engagement'&&weakest.v<70) r+=`\n\n💬 Engagement signals are low (${weakest.v}%). Try adding power words or a question to drive comments and shares.`;
  else if(weakest.n==='caption'&&weakest.v<70) r+=`\n\n✍️ Your caption needs work (${weakest.v}%). Aim for 80-200 chars with a clear CTA.`;

  if(trendStatus==='Cold') r+=`\n\n❄️ No trend alignment detected. Adding #fyp, #viral, and niche hashtags could 3x your discoverability.`;
  if(pacingLevel==='Low'&&contentType==='video') r+=`\n\n⏱️ Video pacing is slow. Consider trimming to under 30 seconds — it can double completion rate.`;

  const tips={tiktok:'Peak TikTok posting: 7-9 PM. First 3 seconds are everything.',instagram:'Instagram peak: 11 AM-1 PM. Consistent aesthetic boosts saves.',youtube:'YouTube Shorts: Educational hooks get 40% more watch time.'};
  if(platform&&tips[platform]) r+=`\n\n💡 ${tips[platform]}`;

  return r;
}

export function generateChatResponse(message, result, historyStats, trends) {
  if(!message?.trim()) return "How can I help you go viral today?";
  const l=message.toLowerCase().trim();

  // History / Past projects
  if(/previous|past|history|my project|my upload/i.test(l)) {
    if(!historyStats||historyStats.totalUploads===0) return "You haven't analyzed any content yet. Upload something to get started!";
    let r=`📁 You've analyzed ${historyStats.totalUploads} pieces of content so far.\n\nRecent uploads:\n`;
    historyStats.lastUploads.forEach((u,i)=>r+=`${i+1}. ${(u.fileName||'Unknown').substring(0,25)} — Score: ${u.score}/100 (${u.platform})\n`);
    r+=`\nYour average score: ${historyStats.averageScore}/100\nCommon weakness: ${historyStats.commonWeakness}`;
    return r;
  }

  // Progress
  if(/progress|improve based|how have i|getting better/i.test(l)) {
    if(!historyStats||historyStats.totalUploads<2) return "I need at least 2 analyses to show your progress. Keep uploading!";
    const wk=historyStats.commonWeakness;
    return `📈 Based on your ${historyStats.totalUploads} uploads:\n\nAverage score: ${historyStats.averageScore}/100\nBiggest pattern: Your **${wk}** is consistently your weakest metric.\n\n${wk==='hook'?'👉 Focus: Start your next video with a bold question or shocking stat in the first 1-2 seconds.':wk==='caption'?'👉 Focus: Use 80-200 char captions with clear CTAs like "Save this" or "Tag someone".':'👉 Focus: Add more engagement triggers — power words like "wait", "secret", or direct questions.'}`;
  }

  // Content ideas
  if(/idea|what should i post|content next|viral idea/i.test(l)) {
    const kw=trends?.trendingKeywords||['AI tools','money hacks','storytime'];
    const fmt=trends?.trendingFormats?.[0]||'fast cuts with text overlay';
    return `💡 Based on current trends, here are 3 viral content ideas:\n\n1. **"${kw[0]}" with ${fmt}**\n   Hook: "Nobody is talking about this ${kw[0]} hack…"\n\n2. **Controversial take on "${kw[1]}"**\n   Hook: "Unpopular opinion: everything you know about ${kw[1]} is wrong."\n\n3. **"Day in the life" featuring "${kw[2]}"**\n   Hook: "POV: You just discovered the real secret to ${kw[2]}…"\n\n📌 Use ${trends?.trendingHashtags?.tiktok?.[0]||'#fyp'} on all of them!`;
  }

  // Greeting
  if(/^(hi|hello|hey|sup|yo|what'?s up)/i.test(l)) {
    return result
      ? `Hey! 👋 Your content scored ${result.totalScore}/100. Want tips to push it higher? Ask me anything!`
      : "Hey! 👋 I'm your AI viral coach. Upload some content and I'll analyze it — or ask me anything about going viral!";
  }

  // Hook advice
  if(/hook|intro|opening|first (second|frame|3 sec)/i.test(l)) {
    const hooks=['\"Stop scrolling — this will change how you think about [topic].\"','\"I tested this for 30 days. Here\'s what nobody tells you…\"','\"The reason you\'re not going viral is this ONE thing.\"','\"Wait until the end — this gets insane.\"','\"POV: You just discovered the secret everyone\'s hiding.\"'];
    let r="🎣 5 high-converting hook templates:\n\n";
    hooks.forEach((h,i)=>r+=`${i+1}. ${h}\n`);
    if(result?.metrics?.hookPercent<60) r+=`\nYour hook scores ${result.metrics.hookPercent}%. Using one of these patterns could add 15-25 points to your score!`;
    return r;
  }

  // Caption rewrite
  if(/caption|rewrite|copy|description|text/i.test(l)) {
    if(result?.caption) return rewriteCaption(result.caption,result);
    return "✍️ Share your caption with me and I'll rewrite it with:\n• A compelling hook opener\n• Power words that drive engagement\n• A clear CTA (Save / Comment / Share)\n• Trending hashtags\n\nPaste your caption or upload content with a caption!";
  }

  // Hashtags
  if(/hashtag|#|tag|trending keyword/i.test(l)) {
    const p=result?.platform||'tiktok';
    const tags=trends?.trendingHashtags?.[p]||['#fyp','#viral','#trending'];
    const niche=trends?.trendingHashtags?.tiktok?.slice(5)||['#explore','#blowthisup'];
    return `#️⃣ Optimal hashtag strategy for ${p}:\n\n**Broad reach (2-3 tags):**\n${tags.slice(0,3).join('  ')}\n\n**Niche specific (3-4 tags):**\n${niche.slice(0,3).join('  ')}\n\n**Pro tip:** Mix 2-3 big hashtags (1M+ posts) with 3-4 smaller niche ones for best algorithm pickup. Total: 5-8 hashtags optimal.`;
  }

  // Engagement
  if(/engage|like|comment|share|views|reach|algorithm/i.test(l)) {
    let r="📈 Top 6 Engagement Boosters:\n\n";
    r+="1. Ask a divisive question in your caption → sparks comments\n";
    r+="2. Add \"Save this\" — saves are the #1 signal on Instagram\n";
    r+="3. Reply to every comment in the first 60 minutes\n";
    r+="4. Use 'Part 2' hooks → \"Follow to see what happened next…\"\n";
    r+="5. Post during peak hours → "+((trends?.peakPostingTimes?.tiktok||['7-10 PM']).join(', '))+"\n";
    r+="6. End with a CTA: \"Tag someone who needs this\"\n";
    if(result?.metrics?.engagementPercent<60) r+=`\nYour engagement is at ${result.metrics.engagementPercent}% — adding 2-3 of these could double it.`;
    return r;
  }

  // Pacing / video length
  if(/pac|speed|slow|fast|trim|cut|edit|duration|length/i.test(l)) {
    let r="⏱️ Video pacing formula by platform:\n\n";
    r+="• **TikTok sweet spot:** 7-15s (max completion rate)\n";
    r+="• **Instagram Reels:** 15-30s performs best\n";
    r+="• **YouTube Shorts:** 30-60s — value-packed\n";
    r+="\n**Editing rules:**\n• Cut every 2-3 seconds to maintain attention\n• Front-load your best moment in the first 3 seconds\n• Use jump cuts instead of fades";
    if(result?.duration>60) r+=`\n\n⚠️ Your video is ${Math.round(result.duration)}s — consider trimming to under 30s for +40% completion rate.`;
    return r;
  }

  // Score improvement
  if(/score|boost|improve|higher|better|optimize|fix/i.test(l)) {
    if(result) return improvementPlan(result);
    return "📊 Formula for a high virality score:\n\n1. Upload a short video (7-30s) — videos score highest\n2. Write a caption with 80-200 characters and a CTA\n3. Start with a question or bold statement hook\n4. Add 5-8 trending hashtags\n5. Post at peak hours\n\nUpload content and I'll give you a specific plan!";
  }

  // Platform tips
  if(/tiktok|instagram|reel|youtube|platform|short/i.test(l)) {
    return "📱 Platform-specific strategies:\n\n**TikTok:** Fast-paced, trending audio, 7-15s ideal. Duet and stitch to ride existing viral content.\n\n**Instagram Reels:** Polished visuals, 15-30s. Carousel posts get 3x more reach. Save = #1 signal.\n\n**YouTube Shorts:** Educational or entertaining, 30-60s. Clear thumbnail with face. Consistent niche is key.\n\nChoose the platform where YOUR content style naturally shines!";
  }

  // Thumbnail
  if(/thumbnail|thumb|cover|preview/i.test(l)) {
    return "🖼️ Thumbnail blueprint for maximum CTR:\n\n1. Close-up face with expressive emotion (surprise, shock, joy)\n2. Bold 3-4 word text with high contrast (white on dark or vice versa)\n3. Bright, saturated colors — avoid muddy/dark thumbnails\n4. Point at something or look off-screen (creates curiosity gap)\n5. Test 2-3 thumbnails (A/B test is worth it)\n\nPro tip: The thumbnail + first 3 seconds are your 2 most important conversion points.";
  }

  // ── Dynamic fallback with result context ──
  if(result) {
    const score=result.totalScore;
    const weakest=[{n:'hook',v:result.metrics?.hookPercent||0},{n:'engagement',v:result.metrics?.engagementPercent||0},{n:'caption',v:result.metrics?.captionPercent||0}].sort((a,b)=>a.v-b.v)[0];
    const dynamicTips=[
      `Your content scored **${score}/100**. The biggest opportunity is your **${weakest.n}** (${weakest.v}%) — improving this alone could add 15-25 points.\n\nTry asking me:\n• "How do I fix my ${weakest.n}?"\n• "Rewrite my caption"\n• "Give me viral hooks for ${result.platform||'TikTok'}"`,
      `I've analyzed your upload — **${score}/100**. ${score>=70?'Strong foundation!':'Room to grow.'}\n\nQuick wins I see:\n${weakest.v<60?`1. Your ${weakest.n} is at ${weakest.v}% — that's the #1 thing holding you back`:'1. Fine-tune your hook timing'}\n2. ${result.metrics?.trendStatus==='Cold'?'Add trending hashtags (#fyp #viral + niche tags)':'Keep riding the current trend wave'}\n3. ${result.contentType==='video'&&result.duration>45?'Trim the video to under 30s for better retention':'Add a stronger CTA at the end'}\n\nWhat should we tackle first?`,
      `Score: **${score}**/100 | Platform: **${(result.platform||'tiktok').charAt(0).toUpperCase()+(result.platform||'tiktok').slice(1)}** | Weakest: **${weakest.n}** (${weakest.v}%)\n\nI can help you:\n🎣 Write power hooks that stop the scroll\n✍️ Rewrite your caption with proven CTAs\n📈 Build an improvement plan for +${Math.min(30,100-score)} points\n#️⃣ Generate a hashtag strategy\n\nWhat's your biggest challenge right now?`,
    ];
    return dynamicTips[Math.floor(Date.now()/60000)%dynamicTips.length];
  }

  // ── No result — varied helpful responses ──
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':'Good evening';
  const trendKw=trends?.trendingKeywords?.[0]||'AI tools';
  const trendKw2=trends?.trendingKeywords?.[1]||'productivity hacks';
  const noResultReplies=[
    `${greeting}! 👋 Ready to create something viral?\n\nHere's what's trending right now:\n🔥 **${trendKw}** — exploding on TikTok\n📈 **${trendKw2}** — high engagement on Reels\n\nUpload your content and I'll give you a personalized score + improvement plan. Or ask me:\n• "Give me viral content ideas"\n• "What hooks are working right now?"\n• "Best hashtags for TikTok"`,
    `Hey! 👋 I'm your AI content strategist.\n\nToday's hot insight: **${trendKw}** content is seeing +240% engagement growth. Creators posting short storytelling formats are getting 3-5× more reach.\n\nWant me to:\n🎣 Generate hook ideas for your niche?\n💡 Suggest viral content formats?\n📊 Analyze your next post before publishing?\n\nUpload content or ask away!`,
    `${greeting}! Let's make your next post go viral. 🚀\n\nQuick pulse on 2026 trends:\n• Short-form storytelling → highest completion rates\n• **${trendKw}** + **${trendKw2}** → fastest growing niches\n• POV content → 200% more shares than talking heads\n\nI can analyze uploads, rewrite captions, suggest hooks, or build a full content strategy. What do you need?`,
  ];
  return noResultReplies[Math.floor(Date.now()/45000)%noResultReplies.length];
}

function rewriteCaption(caption, result) {
  const sc=result?.metrics?.captionPercent||50;
  const preview=caption.substring(0,100)+(caption.length>100?'…':'');
  let r=`\u270D\uFE0F Caption analysis (${sc}% quality score):\n"${preview}"\n\n`;
  if(caption.length<40) r+="⚠️ Too short — expand with context and a CTA.\n\n";
  else if(caption.length>300) r+="⚠️ Too long — trim to essentials.\n\n";
  const core=caption.replace(/^(the |a |so |i |and )/i,'').substring(0,70);
  const hooks=["Stop scrolling → ","You need to see this: ","Wait — ","POV: "];
  const ctas=["\n\n💾 Save this for later | Follow for more tips","\n\n👇 Drop a comment if you relate","\n\n🔗 Share with someone who needs this"];
  const h=hooks[caption.length%hooks.length];
  const c=ctas[caption.length%ctas.length];
  r+="**3 optimized rewrites:**\n\n";
  r+=`1. "${h}${core}${c}"\n\n`;
  r+=`2. "POV: ${core} \uD83D\uDC40 #fyp #viral"\n\n`;
  r+=`3. "Nobody talks about this \u2192 ${core} \uD83D\uDCA1"\n\n`;
  r+="Pick the one that fits your tone and A/B test the others!";
  return r;
}

function improvementPlan(result) {
  const {totalScore,metrics={}} = result;
  const steps=[];
  if(metrics.hookPercent<70) steps.push(`🎣 Hook (${metrics.hookPercent}%): Lead with a bold question or shocking statement. Critical — fix first.`);
  if(metrics.captionPercent<70) steps.push(`✍️ Caption (${metrics.captionPercent}%): Rewrite with 80-200 chars, power words, and a clear CTA.`);
  if(metrics.engagementPercent<70) steps.push(`💬 Engagement (${metrics.engagementPercent}%): Add "wait for it", ask a question, or use "Part 2" hooks.`);
  if(metrics.pacingLevel==='Low') steps.push(`⏱️ Pacing: Trim to under 30s and cut every 2-3 seconds.`);
  if(metrics.trendStatus==='Cold') steps.push(`🔥 Trends: Add #fyp #viral + 3-4 niche hashtags.`);
  if(metrics.thumbnailPercent<70) steps.push(`🖼️ Thumbnail (${metrics.thumbnailPercent}%): Use expressive face + bold 3-word text + bright colors.`);
  if(steps.length===0) return `🎯 Your score is ${totalScore}/100 — excellent! Fine-tune with:\n• A/B test 2 different hooks\n• Try posting at different times\n• Reply to all comments in first hour`;
  return `📋 Improvement plan for ${totalScore}/100:\n\n${steps.map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\nTackle these in order — the first one always has the biggest impact!`;
}
