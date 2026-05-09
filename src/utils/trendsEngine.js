/**
 * Trends Engine — Simulates current social media trends
 */

const TRENDS_DATA = {
  keywords: ["AI tools", "motivation", "money", "storytime", "day in the life", "pov", "unpopular opinion"],
  formats: ["short videos", "fast cuts", "storytelling hooks", "looping videos", "text-to-speech"],
  hashtags: {
    tiktok: ["#tiktokviral", "#fyp", "#storytime", "#hacks"],
    instagram: ["#reels", "#explorepage", "#trendingreels", "#tips"],
    youtube: ["#shorts", "#youtubeshorts", "#viralshorts", "#tutorial"]
  }
};

/**
 * Get current simulated trends
 * @returns {Object} Object containing current trending topics, formats, and hashtags
 */
export function analyzeTrends() {
  // Simulate rotating trends by picking a random subset
  // In a real app, this would fetch from an API like TikTok/Instagram APIs
  const shuffle = (array) => {
    let newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  return {
    trendingKeywords: shuffle(TRENDS_DATA.keywords).slice(0, 3),
    trendingFormats: shuffle(TRENDS_DATA.formats).slice(0, 2),
    trendingHashtags: {
      tiktok: shuffle(TRENDS_DATA.hashtags.tiktok).slice(0, 3),
      instagram: shuffle(TRENDS_DATA.hashtags.instagram).slice(0, 3),
      youtube: shuffle(TRENDS_DATA.hashtags.youtube).slice(0, 3)
    }
  };
}
