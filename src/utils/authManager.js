/**
 * Custom Auth Manager — Username/Password auth stored in localStorage
 * User-scoped data isolation via unique uid per user
 */

const USERS_KEY = 'goviral_users_v2';
const SESSION_KEY = 'goviral_session_v2';

/** djb2 hash — lightweight, deterministic */
function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
    hash = hash & hash;
  }
  return `$gv${Math.abs(hash).toString(16)}x${password.length}`;
}

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); }
  catch { return {}; }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function buildSession(user) {
  return {
    uid: user.uid,
    username: user.username,
    displayName: user.displayName,
    createdAt: user.createdAt,
    loginAt: Date.now(),
  };
}

/** Sign up a new user */
export function signUp(username, password, confirmPassword) {
  const u = username.trim();
  const key = u.toLowerCase();

  if (!u) return { error: 'Username is required.' };
  if (u.length < 3) return { error: 'Username must be at least 3 characters.' };
  if (/[^a-zA-Z0-9_]/.test(u)) return { error: 'Username can only contain letters, numbers, and underscores.' };
  if (!password) return { error: 'Password is required.' };
  if (password.length < 4) return { error: 'Password must be at least 4 characters.' };
  if (password !== confirmPassword) return { error: 'Passwords do not match.' };

  const users = getUsers();
  if (users[key]) return { error: 'Username already taken. Choose another.' };

  const user = {
    uid: `${key}_${Date.now().toString(36)}`,
    username: u,
    displayName: u,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };

  users[key] = user;
  saveUsers(users);

  const session = buildSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

/** Login an existing user */
export function login(username, password) {
  const key = username.trim().toLowerCase();
  if (!key || !password) return { error: 'Please enter username and password.' };

  const users = getUsers();
  const user = users[key];
  if (!user) return { error: 'Invalid username or password.' };
  if (user.passwordHash !== hashPassword(password)) return { error: 'Invalid username or password.' };

  const session = buildSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

/** Get current session (returns null if not logged in) */
export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}

/** Logout — clear session only (keep user account + history) */
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
