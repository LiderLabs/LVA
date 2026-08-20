const USERS_KEY = "lva_registered_users";
const SESSION_KEY = "lva_active_session";

function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}
export function registerUser(name, email, password) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }
  const newUser = { id: "user_" + Date.now(), name: name.trim(), email: normalizedEmail, password: btoa(password) };
  users.push(newUser);
  saveUsers(users);
  const session = { id: newUser.id, name: newUser.name, email: newUser.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
export function loginUser(email, password) {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalizedEmail);
  if (!user || user.password !== btoa(password)) {
    throw new Error("Invalid email or password.");
  }
  const session = { id: user.id, name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}
