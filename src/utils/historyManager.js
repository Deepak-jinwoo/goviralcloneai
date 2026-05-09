/**
 * History Manager — localStorage CRUD for analysis history, scoped by User ID
 */

const BASE_STORAGE_KEY = 'goviral_history';

function getStoreKey(userId) {
  return userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;
}

/**
 * Generate a unique ID for each analysis entry
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Get all history entries, sorted by timestamp (newest first)
 * @param {string} userId - Current user ID
 * @returns {Array} Array of analysis results
 */
export function getHistory(userId) {
  try {
    const raw = localStorage.getItem(getStoreKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Save an analysis result to history
 * @param {Object} result - The analysis result from scoringEngine
 * @param {string} userId - Current user ID
 * @returns {Object} The saved entry with id and timestamp
 */
export function saveAnalysis(result, userId) {
  if (!userId) return null;
  try {
    const history = getHistory(userId);
    const entry = {
      id: generateId(),
      fileName: result.fileName || 'Unknown',
      caption: result.caption || '',
      platform: result.platform || 'tiktok',
      contentType: result.contentType || 'text',
      totalScore: result.totalScore || 0,
      metrics: result.metrics || {},
      rawScores: result.rawScores || {},
      duration: result.duration || 0,
      fileSize: result.fileSize || 0,
      timestamp: Date.now(),
    };
    history.unshift(entry);
    // Keep max 50 entries
    const trimmed = history.slice(0, 50);
    localStorage.setItem(getStoreKey(userId), JSON.stringify(trimmed));
    return entry;
  } catch (e) {
    console.error('Failed to save analysis:', e);
    return null;
  }
}

/**
 * Delete a single history entry by ID
 * @param {string} id - The entry ID to remove
 * @param {string} userId - Current user ID
 * @returns {boolean} Whether the deletion succeeded
 */
export function deleteAnalysis(id, userId) {
  try {
    const history = getHistory(userId);
    const filtered = history.filter(entry => entry.id !== id);
    localStorage.setItem(getStoreKey(userId), JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all history for a user
 * @param {string} userId - Current user ID
 */
export function clearHistory(userId) {
  try {
    localStorage.removeItem(getStoreKey(userId));
    return true;
  } catch {
    return false;
  }
}

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp in ms
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'Unknown';
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * Get summary stats of user's past uploads for the AI Assistant
 * @param {string} userId - Current user ID
 * @returns {Object|null} History stats or null if empty
 */
export function getUserHistoryStats(userId) {
  const history = getHistory(userId);
  if (!history || history.length === 0) return null;

  const lastUploads = history.slice(0, 3);
  let totalScoreSum = 0;
  let hookSum = 0;
  let engagementSum = 0;
  let captionSum = 0;
  
  history.forEach(item => {
    totalScoreSum += item.totalScore || 0;
    hookSum += item.metrics?.hookPercent || 0;
    engagementSum += item.metrics?.engagementPercent || 0;
    captionSum += item.metrics?.captionPercent || 0;
  });

  const count = history.length;
  const avgScore = Math.round(totalScoreSum / count);
  
  // Find common weakness
  const avgHook = hookSum / count;
  const avgEngage = engagementSum / count;
  const avgCaption = captionSum / count;
  
  const avgs = [
    { name: 'hook', value: avgHook },
    { name: 'engagement', value: avgEngage },
    { name: 'caption', value: avgCaption }
  ].sort((a, b) => a.value - b.value);
  
  return {
    totalUploads: count,
    averageScore: avgScore,
    commonWeakness: avgs[0].name,
    lastUploads: lastUploads.map(u => ({
      fileName: u.fileName,
      score: u.totalScore,
      platform: u.platform,
      date: formatDate(u.timestamp)
    }))
  };
}

