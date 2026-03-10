
(() => {
    "use strict";

    const form = $("loginForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // 1. ניקוי שגיאות קודמות (Reset)
        // לפני כל בדיקה, אנחנו מנקים את השטח כדי לא להציג שגיאות ישנות
        setText("loginUsernameError", "");
        setText("loginPasswordError", "");
        setMessage("loginGeneralError", "");

        // שליפת הערכים מהשדות
        const username = $("loginUsername").value.trim();
        const password = $("loginPassword").value;

        // ============================================================
        // מצב 1: שם המשתמש והסיסמה חסרים (או אחד מהם)
        // ============================================================
        let hasEmptyFields = false;

        if (!username) {
            setText("loginUsernameError", "שם המשתמש חסר");
            hasEmptyFields = true;
        }

        if (!password) {
            setText("loginPasswordError", "הסיסמה חסרה");
            hasEmptyFields = true;
        }

        // אם אחד השדות חסר, אנחנו עוצרים כאן ולא ממשיכים לבדיקות הבאות
        if (hasEmptyFields) return;


        // ============================================================
        // שליפת המשתמש מהזיכרון לצורך הבדיקות הבאות
        // ============================================================
        const user = getUserByUsername(username);


        // ============================================================
        // מצב 2: שם המשתמש לא קיים
        // ============================================================
        if (!user) {
            // שים לב: מציגים הודעה כללית למטה, או שאפשר ספציפית תחת שם המשתמש
            setMessage("loginGeneralError", "שם המשתמש לא קיים במערכת", "error");
            return; // עוצרים כאן
        }

        // ============================================================
        // מצב 3: הסיסמה לא תואמת לשם המשתמש
        // ============================================================
        // בשלב הזה אנחנו יודעים בוודאות ששם המשתמש קיים, אז בטוח לגשת ל-user.password
        if (user.password !== password) {
            setMessage("loginGeneralError", "הסיסמה לא תואמת לשם המשתמש", "error");
            return; // עוצרים כאן
        }

        // ============================================================
        // הצלחה: הכל תקין
        // ============================================================
        setCurrentUser(user.username);
        window.location.href = "shifts.html";
    });
})();