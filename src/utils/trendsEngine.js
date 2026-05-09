/**
 * Trends Engine — Rich simulated social media trend data
 */
const TRENDS = {
  keywords: ['AI tools','money hacks','storytime','day in the life','unpopular opinion','POV','glow up','grwm','manifestation','side hustle','productivity','dark truth','viral hack','silent walking','skincare routine'],
  formats: ['fast cuts with text overlay','POV storytelling','talking head with b-roll','screen recording tutorial','outfit transition','before and after','reaction video','green screen explainer'],
  sounds: ['Trending audio #1','Viral sound of the week','Lo-fi background','Trending remix'],
  niches: ['fitness','finance','fashion','food','tech','travel','beauty','education','comedy','motivation'],
  hashtags: {
    tiktok: ['#fyp','#foryoupage','#tiktokviral','#storytime','#hacks','#viral2025','#trending','#fypage','#blowthisup','#xyzbca'],
    instagram: ['#reels','#explorepage','#trendingreels','#reelsviral','#instagood','#contentcreator','#instareels','#viralreels','#explore','#reelsinstagram'],
    youtube: ['#shorts','#youtubeshorts','#viral','#trending','#viralshorts','#shortsvideo','#subscribe','#youtubeviral','#ytshorts','#newvideo']
  }
};

/**
 * Get current simulated trends
 */
export function analyzeTrends() {
  const shuffle=a=>{const n=[...a];for(let i=n.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[n[i],n[j]]=[n[j],n[i]];}return n;};
  const pick=(a,c)=>shuffle(a).slice(0,c);
  return {
    trendingKeywords: pick(TRENDS.keywords,5),
    trendingFormats: pick(TRENDS.formats,3),
    trendingHashtags: {
      tiktok: pick(TRENDS.hashtags.tiktok,5),
      instagram: pick(TRENDS.hashtags.instagram,5),
      youtube: pick(TRENDS.hashtags.youtube,5),
    },
    trendingNiches: pick(TRENDS.niches,3),
    trendingSounds: pick(TRENDS.sounds,2),
    peakPostingTimes: {
      tiktok: ['6-9 AM','7-10 PM'],
      instagram: ['11 AM–1 PM','5-7 PM'],
      youtube: ['2-4 PM','8-10 PM'],
    }
  };
}
