/**
 * AI Assistant — Rule-based response generator
 * Produces contextual suggestions based on analysis scores.
 */

/**
 * Generate an initial analysis response based on scores
 * @param {Object} result - Analysis result from scoringEngine
 * @param {Object} historyStats - Summary of user's past uploads
 * @returns {string} AI response text
 */
export function generateAnalysisResponse(result, historyStats) {
  if (!result) return "Upload some content and I'll analyze it for you!";

  const { totalScore, metrics, contentType, caption } = result;
  const { hookPercent, engagementPercent, captionPercent, pacingLevel, trendStatus } = metrics || {};

  let response = '';

// Overall assessment
  if (totalScore >= 80) {
    response += `Excellent work. Your content achieved an Audience Reach Score of ${totalScore}/100, indicating high viral potential. `;
  } else if (totalScore >= 60) {
    response += `Solid foundation. Your content scored ${totalScore}/100. With targeted optimizations, you can significantly increase audience reach. `;
  } else if (totalScore >= 40) {
    response += `Your content scored ${totalScore}/100. There are actionable areas for improvement to enhance viewer retention and engagement. `;
  } else {
    response += `Your content scored ${totalScore}/100. Let's analyze the metrics to identify the core areas holding back your virality. `;
  }

  // Personalization based on history
  if (historyStats && historyStats.totalUploads > 1) {
    const prevScore = historyStats.lastUploads.length > 1 ? historyStats.lastUploads[1].score : historyStats.averageScore;
    if (totalScore > prevScore) {
      response += `\n\nPerformance Trend: This is a ${totalScore - prevScore}-point improvement over your last upload. Your strategy adjustments are working.`;
    } else if (totalScore < prevScore) {
      response += `\n\nPerformance Trend: This scored ${prevScore - totalScore} points lower than your previous average. Let's look at the engagement triggers.`;
    }
  }

  // Find weakest area
  const scores = [
    { name: 'hook effectiveness', value: hookPercent || 0 },
    { name: 'engagement prediction', value: engagementPercent || 0 },
    { name: 'retention prediction', value: metrics.retentionPrediction || 0 },
    { name: 'caption quality', value: captionPercent || 0 },
  ];
  scores.sort((a, b) => a.value - b.value);
  const weakest = scores[0];

  if (weakest.name === 'hook effectiveness' && weakest.value < 70) {
    response += `\n\nInsight: Hook effectiveness is low (${weakest.value}%). Optimize the first 3 seconds with a pattern interrupt or direct question.`;
  } else if (weakest.name === 'engagement prediction' && weakest.value < 70) {
    response += `\n\nInsight: Engagement triggers are underperforming (${weakest.value}%). Incorporate conversational prompts or high-arousal keywords.`;
  } else if (weakest.name === 'retention prediction' && weakest.value < 70) {
    response += `\n\nInsight: Estimated retention is low (${weakest.value}%). Improve pacing or cut dead air to maintain viewer interest throughout.`;
  } else if (weakest.name === 'caption quality' && weakest.value < 70) {
    response += `\n\nInsight: Caption quality is sub-optimal (${weakest.value}%). Aim for concise, SEO-rich copy with a clear call-to-action.`;
  }

  if (trendStatus === 'Cold') {
    response += `\n\nNote: Trend alignment is currently low. Consider integrating trending topics or relevant hashtags to boost algorithm discovery.`;
  }

  if (pacingLevel === 'Low' && contentType === 'video') {
    response += `\n\n⏱️ Pacing is slow. Consider trimming your video to under 30 seconds for optimal engagement.`;
  }

  return response;
}

/**
 * Respond to a user chat message based on context
 * @param {string} message - User's chat message
 * @param {Object|null} result - Current analysis result (if any)
 * @param {Object} historyStats - Summary of user's past uploads
 * @param {Object} trends - Current trends from trendsEngine
 * @returns {string} AI response
 */
export function generateChatResponse(message, result, historyStats, trends) {
  if (!message || message.trim().length === 0) {
    return "How can I help you optimize your content?";
  }

  const lower = message.toLowerCase().trim();

  // Smart Query: Previous projects
  if (/previous project|past project|my history|my project|past upload/i.test(lower)) {
    if (!historyStats || historyStats.totalUploads === 0) {
      return "You haven't uploaded any projects yet. Upload some content so I can analyze it!";
    }
    let response = `📁 You've analyzed ${historyStats.totalUploads} projects so far.\n\nHere are your most recent ones:\n`;
    historyStats.lastUploads.forEach((u, i) => {
      response += `${i+1}. ${(u.fileName || 'Unknown').substring(0,20)}... (Score: ${u.score}/100, ${u.platform})\n`;
    });
    response += `\nYour average score is ${historyStats.averageScore}/100.`;
    return response;
  }

  // Smart Query: Improvement based on past
  if (/improve based on.*past|how has my content improved|improve.*past upload|my progress/i.test(lower)) {
    if (!historyStats || historyStats.totalUploads === 0) {
      return "I need more data to analyze your progress. Try analyzing a few more uploads first!";
    }
    let response = `📈 Looking at your past ${historyStats.totalUploads} uploads:\n\n`;
    response += `Your average virality score is ${historyStats.averageScore}/100.\n`;
    response += `Your most common weakness seems to be your **${historyStats.commonWeakness}**.\n\n`;
    if (historyStats.commonWeakness === 'hook') {
      response += `👉 Focus on starting your next video with a bold statement or visual within the first 3 seconds!`;
    } else if (historyStats.commonWeakness === 'caption') {
      response += `👉 Try using more engaging captions with clear calls-to-action and trending keywords.`;
    } else {
      response += `👉 Work on adding more engagement triggers like 'wait for it' or questions in your videos.`;
    }
    return response;
  }

  // Smart Query: Viral ideas / Next post ideas
  if (/viral idea|post next|content idea|idea based on trend|what should i post/i.test(lower)) {
    let response = `💡 Based on current trends${historyStats ? ' and your history' : ''}, here are 3 personalized content ideas:\n\n`;
    
    const trendingKW = trends?.trendingKeywords || ['AI hacks', 'storytime', 'money tips'];
    const format = trends?.trendingFormats?.[0] || 'fast cuts';
    
    response += `1. **Idea:** Create a short video about "${trendingKW[0]}" using ${format}.\n`;
    response += `   **Hook:** "Don't scroll if you want to master ${trendingKW[0]} in 2026..."\n\n`;
    
    response += `2. **Idea:** Share a controversial opinion or tip about "${trendingKW[1]}".\n`;
    response += `   **Hook:** "The biggest lie you've been told about ${trendingKW[1]}..."\n\n`;
    
    response += `3. **Idea:** A "Day in the life" or behind-the-scenes focusing on "${trendingKW[2]}".\n`;
    response += `   **Hook:** "POV: You just discovered the ultimate hack for ${trendingKW[2]}..."\n\n`;
    
    response += `Pro tip: Make sure to use hashtags like ${trends?.trendingHashtags?.tiktok?.[0] || '#fyp'}!`;
    return response;
  }

  // Greeting patterns
  if (/^(hi|hello|hey|sup|yo|what's up|howdy)/i.test(lower)) {
    return result
      ? `Hey! 👋 I see you've analyzed some content (score: ${result.totalScore}/100). Want me to suggest improvements?`
      : "Hey there! 👋 Upload some content and I'll help you maximize its viral potential!";
  }

  // Hook-related questions & Action commands
  if (/hook|intro|opening|start|beginning|first (second|frame|word)/i.test(lower)) {
    const hooks = [
      '"Stop scrolling — this changes everything."',
      '"I tested this for 30 days and here\'s what happened..."',
      '"The secret nobody talks about is..."',
      '"Wait — did you know this about [topic]?"',
      '"POV: You just discovered the best hack for..."',
    ];
    let response = "🎣 Here are 3 high-converting hook templates customized for you:\n\n";
    hooks.slice(0, 3).forEach((h, i) => response += `${i + 1}. ${h}\n`);
    if (result && result.metrics?.hookPercent < 60) {
      response += `\nYour current hook scores ${result.metrics.hookPercent}%. Using one of these patterns could boost it significantly!`;
    }
    return response;
  }

  // Caption-related questions & Action commands
  if (/caption|text|copy|write|rewrite|description/i.test(lower)) {
    if (result && result.caption) {
      return generateCaptionRewrite(result.caption, result);
    }
    return "✍️ I can rewrite your caption! But first, upload a video or text with an existing caption so I have something to work with.";
  }

  // Hashtag questions & Action commands
  if (/hashtag|tag|#|trending keywords/i.test(lower)) {
    const platform = result?.platform || 'tiktok';
    const hashtags = getHashtagSuggestions(platform);
    return `#️⃣ Recommended trending hashtags for ${platform}:\n\n${hashtags.join('  ')}\n\nMix 2-3 broad tags with 2-3 niche-specific ones for best reach.`;
  }

  // Engagement questions & Action commands
  if (/engage|engagement|likes|comments|shares|views|audience|reach/i.test(lower)) {
    let response = "📈 Pro Engagement Strategies:\n\n";
    response += "1. Ask a controversial or highly relatable question in your caption to drive comments.\n";
    response += "2. Use \"Save this for later\" — saves boost the algorithm ranking massively.\n";
    response += "3. Reply to comments within the first hour to show the algorithm your video is active.\n";
    response += "4. Post during peak hours (6-9 AM, 12-2 PM, 7-10 PM).\n";
    response += "5. Add a CTA: \"Tag someone who needs this\"";
    if (result && result.metrics?.engagementPercent < 60) {
      response += `\n\nYour engagement score is currently ${result.metrics.engagementPercent}%. Focus on adding more engagement triggers!`;
    }
    return response;
  }

  // Pacing / video length & Action commands
  if (/pace|pacing|speed|fast|slow|long|short|duration|length|trim|cut|edit/i.test(lower)) {
    let response = "⏱️ Optimal video pacing advice:\n\n";
    response += "• TikTok sweet spot: 7-15 seconds for max completion rate.\n";
    response += "• Instagram Reels: 15-30 seconds performs best.\n";
    response += "• YouTube Shorts: 30-60 seconds ideal.\n";
    response += "• Action: Cut every 2-3 seconds to maintain visual attention.\n";
    response += "• Action: Front-load the value — put your best content in the first 3 seconds.";
    if (result && result.duration > 60) {
      response += `\n\nYour video is ${Math.round(result.duration)}s — consider trimming to under 30s for better retention.`;
    }
    return response;
  }

  // Thumbnail questions & Action commands
  if (/thumbnail|thumb|preview|cover|image/i.test(lower)) {
    return "🖼️ Thumbnail Audit & Best Practices:\n\n1. Use a close-up face with an expressive emotion.\n2. Add bold, contrasting text (3-4 words max) that complements the hook.\n3. Use bright, saturated colors to stand out in the feed.\n4. Create visual contrast with the background.\n5. Include an element of curiosity or surprise (like pointing at something).";
  }

  // Trend questions
  if (/trend|trending|popular|viral|algorithm/i.test(lower)) {
    return "🔥 Trending content strategies:\n\n1. Use trending audio/sounds within 24-48 hours of emergence\n2. Put your unique spin on popular formats\n3. Ride news cycles — react to current events\n4. Monitor the Discover/Explore page daily\n5. Use trending hashtags but make them relevant\n\nPro tip: Early adopters of trends get 3-5x more reach!";
  }

  // Score improvement
  if (/score|improve|better|boost|increase|higher|more|optimize/i.test(lower)) {
    if (result) {
      return generateImprovementPlan(result);
    }
    return "📊 To get a high virality score:\n\n1. Upload a video (videos score highest)\n2. Keep it 7-30 seconds\n3. Write a compelling caption with engagement keywords\n4. Start with a strong hook\n5. Add trending hashtags\n\nUpload your content and I'll give you specific recommendations!";
  }

  // Platform-specific
  if (/tiktok|instagram|reels|youtube|shorts|platform/i.test(lower)) {
    return "📱 Platform optimization tips:\n\n**TikTok:** Fast pace, trending sounds, 7-15s ideal\n**Instagram Reels:** Polished visuals, 15-30s, strong aesthetic\n**YouTube Shorts:** Value-packed, 30-60s, educational or entertaining\n\nEach platform's algorithm favors different content styles. Choose the platform that matches your content's strength!";
  }

  // Fallback — general help
  if (result) {
    return `I'm here to help optimize your content (current score: ${result.totalScore}/100). You can ask me about:\n\n• Improving your hook\n• Rewriting your caption\n• Hashtag suggestions\n• Pacing and video length\n• Engagement strategies\n• Trending tips\n\nWhat would you like to focus on?`;
  }

  return "I'm your AI content optimization assistant! Here's what I can help with:\n\n• 🎣 Hook writing\n• ✍️ Caption optimization\n• #️⃣ Hashtag suggestions\n• ⏱️ Pacing advice\n• 📈 Engagement strategies\n• 🔥 Trend analysis\n\nUpload your content first, then ask me anything!";
}

/**
 * Generate a caption rewrite suggestion
 */
function generateCaptionRewrite(caption, result) {
  const score = result?.metrics?.captionPercent || 50;
  let response = `✍️ Current caption analysis (score: ${score}%):\n"${caption.substring(0, 100)}${caption.length > 100 ? '...' : ''}"\n\n`;

  if (caption.length < 40) {
    response += "⚠️ Too short! Expand with more context and a CTA.\n\n";
  } else if (caption.length > 300) {
    response += "⚠️ Too long! Trim to the essential message.\n\n";
  }

  response += "Suggested rewrites:\n\n";

  // Generate contextual rewrites
  const hooks = [
    "Stop scrolling — ",
    "You need to see this → ",
    "The truth about this is... ",
    "Wait for it 👀 ",
  ];

  const ctas = [
    "\n\n💾 Save this for later | Follow for more",
    "\n\n👇 Drop a comment if you agree",
    "\n\n🔗 Share this with someone who needs it",
  ];

  const hook = hooks[caption.length % hooks.length];
  const cta = ctas[caption.length % ctas.length];
  const core = caption.substring(0, 80).replace(/^(the |a |so |i )/i, '');

  response += `1. "${hook}${core}${cta}"\n\n`;
  response += `2. "POV: ${core} 🔥 #fyp #viral"\n\n`;
  response += `3. "Nobody talks about this → ${core} 💡"`;

  return response;
}

/**
 * Generate a specific improvement plan based on scores
 */
function generateImprovementPlan(result) {
  const { totalScore, metrics } = result;
  const improvements = [];

  if (metrics.hookPercent < 70) {
    improvements.push(`• **Hook (${metrics.hookPercent}%):** Start with a question, command, or shocking statement. First 1-2 seconds are critical.`);
  }
  if (metrics.captionPercent < 70) {
    improvements.push(`• **Caption (${metrics.captionPercent}%):** Aim for 80-200 characters. Include a CTA and engagement keywords.`);
  }
  if (metrics.engagementPercent < 70) {
    improvements.push(`• **Engagement (${metrics.engagementPercent}%):** Add words like "wait", "secret", "you won't believe" to boost curiosity.`);
  }
  if (metrics.pacingLevel === 'Low') {
    improvements.push(`• **Pacing (Low):** Trim video to under 30 seconds. Cut every 2-3 seconds.`);
  }
  if (metrics.trendStatus === 'Cold') {
    improvements.push(`• **Trends (Cold):** Add trending hashtags: #fyp #viral #trending`);
  }
  if (metrics.thumbnailPercent < 70) {
    improvements.push(`• **Thumbnail (${metrics.thumbnailPercent}%):** Use a close-up face, bold text, bright colors.`);
  }

  if (improvements.length === 0) {
    return `🎯 Your score is ${totalScore}/100 — that's great! Fine-tune by:\n\n• Experimenting with different hook styles\n• A/B testing caption variations\n• Posting at peak engagement hours\n• Engaging with comments in the first hour`;
  }

  return `📋 Improvement plan for your content (${totalScore}/100):\n\n${improvements.join('\n')}\n\nFocus on the lowest-scoring area first for the biggest impact!`;
}

/**
 * Get hashtag suggestions based on platform
 */
function getHashtagSuggestions(platform) {
  const common = ['#fyp', '#viral', '#trending', '#explore'];
  const platformTags = {
    tiktok: ['#tiktok', '#foryoupage', '#tiktokviral', '#fypage', '#blowthisup'],
    instagram: ['#reels', '#instareels', '#reelsinstagram', '#explorepage', '#instagood'],
    youtube: ['#shorts', '#youtubeshorts', '#subscribe', '#youtube', '#shortsviral'],
  };
  return [...common, ...(platformTags[platform] || platformTags.tiktok)];
}
