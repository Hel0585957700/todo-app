// שמירת משתמש
export function saveUserToStorage(user) {
  if (!user || !user.email) return;
  localStorage.setItem(`user_${user.email}`, JSON.stringify(user));
}

// טוען משתמש לפי אימייל מתוך localStorage
export function loadUserFromStorage(email) {
  if (!email) return null;
  const userRaw = localStorage.getItem(`user_${email}`);
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw);
  } catch (e) {
    console.error("Error parsing user data from storage:", e);
    return null;
  }
}

// מחזיר מערך של אימיילים רשומים מתוך localStorage
export function getAllUserEmails() {
  const usersIndexRaw = localStorage.getItem("usersIndex");
  if (!usersIndexRaw) return [];
  
  try {
    const usersIndex = JSON.parse(usersIndexRaw);
    if (Array.isArray(usersIndex)) return usersIndex;
    else return [];
  } catch (e) {
    console.error("Error parsing usersIndex from storage:", e);
    return [];
  }
}

// הוסף אימייל למערך המשתמשים (רשימת אימיילים)
export function addUserToIndex(email) {
  if (!email) return;
  const users = getAllUserEmails();
  if (!users.includes(email)) {
    users.push(email);
    localStorage.setItem("usersIndex", JSON.stringify(users));
  }
}

// שמירת משימות למשתמש לפי אימייל
export function saveTasksToStorage(email, tasks) {
  if (!email) return;
  localStorage.setItem(`tasks_${email}`, JSON.stringify(tasks));
}

// טעינת משימות של משתמש לפי אימייל
export function loadTasksFromStorage(email) {
  if (!email) return [];
  const data = localStorage.getItem(`tasks_${email}`);
  return data ? JSON.parse(data) : [];
}
