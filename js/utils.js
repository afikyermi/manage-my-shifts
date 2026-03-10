
"use strict";

const STORAGE_KEYS = {
  USERS: "users",
  CURRENT_USER: "currentUser",
  SHIFTS: "shifts",
  RESUME_EDU: "resume_education",
  RESUME_JOB: "resume_employment"
};

// --- ניהול משתמשים (LocalStorage) ---

function loadUsers() {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  return raw ? JSON.parse(raw) : [];
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getCurrentUser() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

function setCurrentUser(username) {
  if (!username) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, username);
  }
}

function getUserByUsername(username) {
  const users = loadUsers();
  return users.find(u => u.username === username) || null;
}

function updateUserProfile(updatedUser) {
    const users = loadUsers();
    const index = users.findIndex(u => u.username === updatedUser.username);
    if (index !== -1) {
        users[index] = updatedUser;
        saveUsers(users);
        return true;
    }
    return false;
}

function logout() {
  if (confirm("האם אתה בטוח שברצונך להתנתק?")) {
    setCurrentUser(null);
    window.location.href = "index.html";
  }
}

// --- ניהול משמרות (Shifts) ---

function loadShifts() {
    const raw = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    return raw ? JSON.parse(raw) : [];
}

function saveShifts(shifts) {
    localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
}

// --- ולידציות (בדיקות תקינות) ---

function validateEmail(email) {
  if (!email || !email.includes("@")) return "כתובת מייל לא תקינה";
  const parts = email.split("@");
  if (parts.length !== 2) return "כתובת מייל לא תקינה";
  const [local, domain] = parts;
  if (!local || !domain) return "כתובת מייל לא תקינה";
  if (domain.startsWith(".") || domain.endsWith(".")) return "כתובת מייל לא תקינה";
  if (!domain.includes(".")) return "כתובת מייל חייבת להכיל נקודה";
  return null;
}

function validatePassword(password) {
  if (!password || password.length < 8) return "סיסמה חייבת להכיל לפחות 8 תווים";
  const hasLetter = /[a-zA-Zא-ת]/.test(password);
  const hasDigit = /\d/.test(password);
  if (!hasLetter || !hasDigit) return "סיסמה חייבת להכיל לפחות אות אחת ומספר אחד";
  return null;
}

// --- עזרים ל-DOM ---

function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text || "";
}

function setMessage(id, text, type = "error") {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  
  el.classList.remove("error", "success");
  if (text) {
    el.classList.add(type);
    el.style.color = type === "error" ? "#e74c3c" : "#27ae60"; 
  }
}

// --- פונקציה ראשית לאתחול (Header) ---
function initPageHeader() {
    const currentUser = getCurrentUser();
    
    // הגנה על עמודים פנימיים
    const pageName = window.location.pathname.split("/").pop();
    const isPublicPage = pageName === "index.html" || pageName === "signup.html" || pageName === "forgot-password.html";
    
    if (!currentUser && !isPublicPage) {
        window.location.href = "index.html";
        return null;
    }

    if (currentUser) {
        const userObj = getUserByUsername(currentUser);
        // הצגת שם המשתמש
        const nameSpan = $("currentUserName");
        if (nameSpan) {
            nameSpan.textContent = userObj ? userObj.firstName : currentUser;
        }

        // חיבור כפתור התנתקות
        const logoutBtn = $("logoutButton");
        if (logoutBtn) {
            // מסירים מאזינים קודמים ומוסיפים חדש
            const newBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
            newBtn.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        }
        return userObj;
    }
    return null;
}