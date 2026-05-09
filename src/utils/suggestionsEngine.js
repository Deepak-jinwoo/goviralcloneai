/**
 * Suggestions Engine — Platform-aware, score-adaptive AI enhancement cards
 */
const COLORS={hook:'purple-400',caption:'green-400',engagement:'blue-400',pacing:'cyan-400',thumbnail:'amber-400',hashtags:'pink-400',trend:'red-400'};

const S=(cat,icon,label,desc,cmd)=>({icon,label,desc,color:COLORS[cat]||'purple-400',actionCommand:cmd});

export function generateSuggestions(result,variation=0) {
  if(!result?.metrics) return [];
  const {metrics:m, totalScore:sc, platform='tiktok'} = result;
  const pool=[];

  // Hook suggestions
  if(m.hookPercent<50) pool.push(S('hook','bolt','Complete Hook Overhaul','First 2 seconds are failing. Get 3 proven power hooks.','Give me 5 power hooks'));
  else if(m.hookPercent<75) pool.push(S('hook','bolt','Strengthen Your Hook','Add urgency or curiosity to boost retention.','Give me 5 power hooks'));
  else pool.push(S('hook','bolt','A/B Test Your Hook','Try an alternate hook variation to maximize reach.','Give me 5 power hooks'));

  // Caption suggestions
  if(m.captionPercent<50) pool.push(S('caption','edit_note','Rewrite Entire Caption','Caption is hurting your score. Let me rebuild it.','Rewrite my caption'));
  else if(m.captionPercent<75) pool.push(S('caption','edit_note','Optimize Caption CTA','Add a compelling call-to-action to drive saves.','Rewrite my caption'));
  else pool.push(S('caption','edit_note','Polish Caption Copy','Fine-tune wording and emoji placement.','Rewrite my caption'));

  // Engagement
  if(m.engagementPercent<50) pool.push(S('engagement','forum','Boost Engagement Urgently','Missing key triggers. Add power words now.','How do I boost engagement?'));
  else if(m.engagementPercent<75) pool.push(S('engagement','forum','Add Engagement Triggers','Include "wait for it" or a question to drive comments.','How do I boost engagement?'));

  // Hashtags / Trends
  if(m.trendStatus==='Cold') pool.push(S('hashtags','tag','Add Trending Hashtags','No trend alignment. Get top hashtags for your niche.',`Best hashtags for ${platform}`));
  else if(m.trendStatus!=='Hot') pool.push(S('trend','trending_up','Optimize Hashtag Mix','Mix broad and niche tags for maximum algorithm pick-up.',`Best hashtags for ${platform}`));

  // Pacing
  if(m.pacingLevel==='Low') pool.push(S('pacing','timer','Fix Video Pacing','Slow edits kill retention. Learn fast-cut techniques.','How should I pace this video?'));

  // Thumbnail
  if(m.thumbnailPercent<60) pool.push(S('thumbnail','image','Improve Thumbnail','Thumbnail is scroll-stopping? Let me audit it.','How can I improve my thumbnail?'));
  else if(m.thumbnailPercent<80) pool.push(S('thumbnail','image','Thumbnail Refinement','Increase contrast and face prominence for more clicks.','How can I improve my thumbnail?'));

  // Platform tip
  const platTip={tiktok:'Use trending TikTok audio within 48 hours of it emerging.',instagram:'Post to Stories + Reels same day for 2x reach.',youtube:'Add chapters and timestamps to YouTube Shorts for retention.'};
  if(platTip[platform]) pool.push(S('trend','tips_and_updates',`${platform.charAt(0).toUpperCase()+platform.slice(1)} Pro Tip`,platTip[platform],'Give me platform tips'));

  // Ensure at least 4
  while(pool.length<4) pool.push(S('engagement','lightbulb','Viral Content Ideas','Get 3 trending content ideas based on your niche.','Give me viral content ideas'));

  const start=variation%Math.max(1,pool.length-3);
  return pool.slice(start,start+5);
}
