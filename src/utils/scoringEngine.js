/**
 * Deterministic Virality Scoring Engine
 * Calculates a 0–100 virality score based on content metadata and caption analysis.
 */

const ENGAGEMENT_KEYWORDS = [
  'wait', 'stop', "don't skip", 'viral', 'secret', 'hack', 'must see',
  'watch till end', 'you won\'t believe', 'shocking', 'insane', 'mind blowing',
  'game changer', 'life hack', 'nobody knows', 'finally', 'breaking',
  'exposed', 'truth', 'warning', 'urgent', 'omg', 'unbelievable',
  'controversial', 'unpopular opinion', 'hot take', 'plot twist'
];

const HOOK_PATTERNS = [
  /^(stop|wait|hold on|listen|look|watch)/i,
  /^(did you know|have you ever|what if|imagine|picture this)/i,
  /^(the secret|the truth|the reason|here's why|this is why)/i,
  /^(don't|never|avoid|stop doing)/i,
  /^(how to|how i|i found|i discovered|i tested)/i,
  /^(number \d|step \d|\d things|\d ways|\d reasons)/i,
  /^(breaking|urgent|warning|alert|attention)/i,
  /\?$/,  // ends with question
];

const TREND_KEYWORDS = [
  '#fyp', '#foryou', '#foryoupage', '#viral', '#trending', '#trend',
  '#explore', '#reels', '#shorts', '#tiktok', '#instagram', '#youtube',
  '#ai', '#chatgpt', '#tech', '#grwm', '#ootd', '#motivation',
  '#aesthetic', '#satisfying', '#storytime', '#relatable', '#comedy',
  '#fitness', '#recipe', '#diy', '#tutorial', '#challenge'
];

/**
 * Detect file type from MIME type or file extension
 */
export function detectContentType(file) {
  if (!file) return 'text';
  const mime = file.type || '';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  const ext = (file.name || '').toLowerCase();
  if (/\.(mp4|mov|avi|webm|mkv|m4v)$/.test(ext)) return 'video';
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/.test(ext)) return 'image';
  return 'text';
}

/**
 * Get video duration (returns a Promise)
 */
export function getVideoDuration(file) {
  return new Promise((resolve) => {
    if (!file || !file.type?.startsWith('video/')) {
      resolve(0);
      return;
    }
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve(video.duration || 0);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(0);
      };
      video.src = url;
    } catch {
      resolve(0);
    }
  });
}

/**
 * Score content type (0–25)
 */
function scoreContentType(contentType) {
  switch (contentType) {
    case 'video': return 25;
    case 'image': return 15;
    case 'text': return 5;
    default: return 5;
  }
}

/**
 * Score video duration (0–15)
 * Optimal: 7–30 seconds
 */
function scoreDuration(duration, contentType) {
  if (contentType !== 'video' || duration <= 0) return 8; // neutral for non-video
  if (duration >= 7 && duration <= 30) return 15;
  if (duration >= 3 && duration < 7) return 11;
  if (duration > 30 && duration <= 60) return 11;
  if (duration > 60 && duration <= 120) return 7;
  if (duration > 120) return 4;
  return 5;
}

/**
 * Score caption quality (0–20)
 */
function scoreCaptionQuality(caption) {
  if (!caption || caption.trim().length === 0) return 0;

  const len = caption.trim().length;
  let score = 0;

  // Length scoring (0–10)
  if (len >= 80 && len <= 200) score += 10;
  else if (len >= 40 && len < 80) score += 7;
  else if (len > 200 && len <= 300) score += 7;
  else if (len >= 20 && len < 40) score += 5;
  else if (len > 300) score += 3;
  else score += 2; // very short

  // Engagement keywords (0–5)
  const lowerCaption = caption.toLowerCase();
  const keywordCount = ENGAGEMENT_KEYWORDS.filter(kw => lowerCaption.includes(kw)).length;
  score += Math.min(keywordCount * 1.5, 5);

  // Has hashtags (0–2)
  const hashtagCount = (caption.match(/#\w+/g) || []).length;
  if (hashtagCount >= 3) score += 2;
  else if (hashtagCount >= 1) score += 1;

  // Has emoji (0–1)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(caption)) score += 1;

  // Has CTA (0–2)
  const ctaPatterns = /\b(follow|like|share|comment|save|tag|subscribe|link in bio|swipe|tap)\b/i;
  if (ctaPatterns.test(caption)) score += 2;

  return Math.min(Math.round(score), 20);
}

/**
 * Score hook strength (0–15)
 */
function scoreHookStrength(caption) {
  if (!caption || caption.trim().length === 0) return 0;

  const firstLine = caption.split(/[.\n!?]/)[0].trim();
  let score = 3; // base

  // Check hook patterns
  const matchCount = HOOK_PATTERNS.filter(p => p.test(firstLine)).length;
  score += Math.min(matchCount * 4, 8);

  // Short punchy hook (under 10 words)
  const wordCount = firstLine.split(/\s+/).length;
  if (wordCount <= 8 && wordCount >= 2) score += 2;

  // Urgency words
  if (/\b(now|today|immediately|asap|hurry|limited|last chance)\b/i.test(firstLine)) {
    score += 2;
  }

  return Math.min(Math.round(score), 15);
}

/**
 * Score trend alignment (0–10)
 */
function scoreTrendAlignment(caption) {
  if (!caption) return 2;
  const lower = caption.toLowerCase();
  const matchCount = TREND_KEYWORDS.filter(kw => lower.includes(kw)).length;
  if (matchCount >= 5) return 10;
  if (matchCount >= 3) return 8;
  if (matchCount >= 2) return 6;
  if (matchCount >= 1) return 4;
  return 2;
}

/**
 * Derive thumbnail score from content + hook + engagement
 */
function deriveThumbnailScore(contentType, hookScore, captionScore) {
  let base = contentType === 'video' ? 70 : contentType === 'image' ? 80 : 40;
  // Influenced by how compelling the overall content is
  base += (hookScore / 15) * 15 + (captionScore / 20) * 10;
  return Math.min(Math.round(base), 100);
}

/**
 * Derive pacing level from duration and content type
 */
function derivePacingLevel(duration, contentType) {
  if (contentType !== 'video') return 'Medium';
  if (duration > 0 && duration <= 15) return 'High';
  if (duration > 15 && duration <= 45) return 'Medium';
  return 'Low';
}

/**
 * Derive trend status from trend score
 */
function deriveTrendStatus(trendScore) {
  if (trendScore >= 8) return 'Hot';
  if (trendScore >= 5) return 'Warm';
  return 'Cold';
}

/**
 * Main scoring function — deterministic, no randomness.
 *
 * @param {Object} params
 * @param {File|null} params.file - The uploaded file
 * @param {string} params.caption - The caption text
 * @param {string} params.platform - 'tiktok' | 'instagram' | 'youtube'
 * @param {number} params.duration - Video duration in seconds (0 for non-video)
 * @returns {Object} Complete analysis result
 */
export function analyzeContent({ file, caption, platform, duration = 0 }) {
  const contentType = detectContentType(file);

  // Calculate raw sub-scores
  const contentTypeScore = scoreContentType(contentType);
  const durationScore = scoreDuration(duration, contentType);
  const captionRaw = scoreCaptionQuality(caption);
  const hookRaw = scoreHookStrength(caption);
  const trendRaw = scoreTrendAlignment(caption);

  // Platform bonus (0–5)
  let platformBonus = 0;
  if (platform === 'tiktok') platformBonus = 5;
  else if (platform === 'instagram') platformBonus = 3;
  else if (platform === 'youtube') platformBonus = 2;

  // File size bonus (0–5): larger files suggest higher production value
  let sizeBonus = 0;
  if (file) {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 10) sizeBonus = 5;
    else if (sizeMB > 5) sizeBonus = 4;
    else if (sizeMB > 1) sizeBonus = 3;
    else if (sizeMB > 0.1) sizeBonus = 2;
    else sizeBonus = 1;
  }

  // Total raw score (max possible: 25+15+20+15+10+5+5 = 95, capped at 100)
  const totalRaw = contentTypeScore + durationScore + captionRaw + hookRaw + trendRaw + platformBonus + sizeBonus;
  const totalScore = Math.min(Math.max(Math.round(totalRaw), 0), 100);

  // Convert sub-scores to percentages for display
  const hookEffectiveness = Math.min(Math.round((hookRaw / 15) * 100), 100);
  const engagementPrediction = Math.min(Math.round(((captionRaw + trendRaw) / 30) * 100), 100);
  const retentionPrediction = Math.min(Math.round(((durationScore / 15) * 50) + ((hookRaw / 15) * 50)), 100);
  const captionPercent = Math.min(Math.round((captionRaw / 20) * 100), 100);
  const pacingLevel = derivePacingLevel(duration, contentType);
  const trendStatus = deriveTrendStatus(trendRaw);

  return {
    totalScore,
    contentType,
    platform,
    duration,
    fileSize: file ? file.size : 0,
    fileName: file ? file.name : 'Text Input',
    caption: caption || '',
    metrics: {
      hookPercent: hookEffectiveness,
      engagementPercent: engagementPrediction,
      retentionPrediction,
      captionPercent,
      pacingLevel,
      trendStatus,
    },
    // Raw scores for AI assistant logic
    rawScores: {
      contentTypeScore,
      durationScore,
      captionRaw,
      hookRaw,
      trendRaw,
      platformBonus,
      sizeBonus,
    },
  };
}
