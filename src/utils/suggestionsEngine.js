/**
 * Suggestions Engine — Generates dynamic improvement suggestions
 * based on analysis results and scores.
 */

/**
 * Suggestions Engine — Generates dynamic actionable improvement suggestions
 * based on analysis results and scores.
 */

const CATEGORY_COLORS = {
  hook: 'primary',
  caption: 'green-400',
  engagement: 'blue-400',
  pacing: 'tertiary',
  thumbnail: 'amber-400',
  hashtags: 'pink-400',
};

/**
 * Generate suggestions based on analysis result
 * @param {Object} result - Analysis result from scoringEngine
 * @param {number} variation - Variation index for regeneration
 * @returns {Array} Array of suggestion objects {icon, label, desc, color, actionCommand}
 */
export function generateSuggestions(result, variation = 0) {
  if (!result || !result.metrics) return [];

  const { metrics, totalScore } = result;
  const suggestions = [];

  const addSuggestion = (cat, icon, label, desc, actionCommand) => {
    suggestions.push({ icon, label, desc, color: CATEGORY_COLORS[cat] || 'primary', actionCommand });
  };

  // Score < 40: Strong corrections
  if (totalScore < 40) {
    if (metrics.hookPercent < 50) {
      addSuggestion('hook', 'bolt', 'Complete Hook Overhaul', 'Your hook is weak. Let me generate 3 high-converting hook ideas.', 'Give me 3 power hooks');
    }
    if (metrics.captionPercent < 50) {
      addSuggestion('caption', 'edit_note', 'Rewrite Entire Caption', 'Your caption is not engaging enough. I can rewrite it completely.', 'Rewrite my caption completely');
    }
    if (metrics.trendStatus === 'Cold') {
      addSuggestion('hashtags', 'tag', 'Trending Keywords Needed', 'You are missing trends. Let me find the top hashtags for your niche.', 'Give me trending hashtags');
    }
    if (metrics.engagementPercent < 40) {
      addSuggestion('engagement', 'forum', 'Major Engagement Fix', 'Add clear CTAs and power words. Ask me how.', 'How can I boost engagement?');
    }
  } 
  // Score 40-70: Optimization suggestions
  else if (totalScore >= 40 && totalScore <= 70) {
    if (metrics.hookPercent < 70) {
      addSuggestion('hook', 'bolt', 'Power Hook', 'Strengthen your hook with urgency or curiosity.', 'Give me 3 power hooks');
    }
    if (metrics.captionPercent < 70) {
      addSuggestion('caption', 'edit_note', 'Caption Optimization', 'Add more CTA elements and emojis to your caption.', 'Rewrite my caption');
    }
    if (metrics.engagementPercent < 70) {
      addSuggestion('engagement', 'forum', 'Boost Engagement', 'Include "wait for it" or questions to drive comments.', 'How can I boost engagement?');
    }
    if (metrics.pacingLevel === 'Low') {
      addSuggestion('pacing', 'timer', 'Fix Pacing', 'Your video is too slow. Trim dead air and cut faster.', 'How should I pace this video?');
    }
    if (metrics.trendStatus !== 'Hot') {
      addSuggestion('hashtags', 'tag', 'Optimize Hashtags', 'Add 2-3 trending hashtags to improve discoverability.', 'Give me trending hashtags');
    }
  } 
  // Score > 70: Fine-tuning suggestions
  else {
    if (metrics.hookPercent < 90) {
      addSuggestion('hook', 'bolt', 'Hook Polish', 'Try an alternative bold hook for A/B testing.', 'Give me 3 power hooks');
    }
    if (metrics.captionPercent < 90) {
      addSuggestion('caption', 'edit_note', 'Caption Polish', 'Fine-tune your text layout and spacing.', 'Rewrite my caption');
    }
    if (metrics.thumbnailPercent < 90) {
      addSuggestion('thumbnail', 'image', 'Thumbnail Polish', 'Increase contrast and text size on your cover image.', 'How can I improve my thumbnail?');
    }
    addSuggestion('engagement', 'forum', 'Pro Engagement Tip', 'Try replying to comments with a video to maximize reach.', 'Give me pro engagement tips');
  }

  // Fallbacks if we don't have enough suggestions (ensure 3-5 suggestions)
  if (suggestions.length < 3) {
    addSuggestion('hashtags', 'tag', 'Hashtag Strategy', 'Refresh your hashtag mix.', 'Give me trending hashtags');
    addSuggestion('thumbnail', 'image', 'Thumbnail Audit', 'Ensure your cover is scroll-stopping.', 'How can I improve my thumbnail?');
  }

  // Use variation to rotate if we have too many
  const startIndex = variation % Math.max(1, suggestions.length - 3);
  return suggestions.slice(startIndex, startIndex + 5);
}
