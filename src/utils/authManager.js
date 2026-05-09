/**
 * Auth Manager — LocalStorage-based Custom Authentication System
 */

const USERS_KEY = 'goviral_users';
const SESSION_KEY = 'goviral_session';

/**
 * Get all registered users from local storage
 * @returns {Array} Array of user objects { username, password }
 */
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save users array to local storage
 * @param {Array} users 
 */
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Sign up a new user
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} { success, message, user }
 */
export function signup(username, password) {
  if (!username || !username.trim()) return { success: false, message: 'Username cannot be empty.' };
  if (!password || !password.trim()) return { success: false, message: 'Password cannot be empty.' };
  
  const formattedUsername = username.trim();
  const users = getUsers();
  
  // Check for duplicates
  const exists = users.find(u => u.username.toLowerCase() === formattedUsername.toLowerCase());
  if (exists) return { success: false, message: 'Username already exists. Please choose another.' };

  const newUser = { username: formattedUsername, password: password.trim() };
  users.push(newUser);
  saveUsers(users);

  // Auto-login after signup
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: newUser.username }));
  return { success: true, user: { uid: newUser.username, displayName: newUser.username } };
}

/**
 * Log in an existing user
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} { success, message, user }
 */
export function login(username, password) {
  if (!username || !password) return { success: false, message: 'Please enter both username and password.' };

  const formattedUsername = username.trim();
  const users = getUsers();
  
  const user = users.find(u => 
    u.username.toLowerCase() === formattedUsername.toLowerCase() && 
    u.password === password.trim()
  );

  if (!user) return { success: false, message: 'Invalid username or password.' };

  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username }));
  return { success: true, user: { uid: user.username, displayName: user.username } };
}

/**
 * Get the currently logged-in user session
 * @returns {Object|null} The user object { uid, displayName } or null
 */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return { uid: session.username, displayName: session.username };
  } catch {
    return null;
  }
}

/**
 * Log out the current user
 */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
