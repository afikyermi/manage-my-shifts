
(() => {
    "use strict";
    
    const form = $("forgotPasswordForm");
    if(!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
        setMessage("fpGeneralMessage", "");

        const username = $("fpUsername").value.trim();
        const email = $("fpEmail").value.trim();
        const idLast4 = $("fpIdLast4").value.trim();
        const newPass = $("fpNewPassword").value;
        const confirmPass = $("fpConfirmNewPassword").value;

        let hasError = false;
        
        const passMsg = validatePassword(newPass);
        if(passMsg) { setText("fpNewPasswordError", passMsg); hasError = true; }

        if(newPass !== confirmPass) { 
            setText("fpConfirmNewPasswordError", "סיסמאות לא תואמות"); 
            hasError = true; 
        }

        if(hasError) return;

        const users = loadUsers();
        const user = users.find(u => u.username === username);

        if(!user || user.email !== email || user.idLast4 !== idLast4) {
            setMessage("fpGeneralMessage", "פרטים מזהים שגויים");
            return;
        }

        user.password = newPass;
        saveUsers(users);
        
        setMessage("fpGeneralMessage", "הסיסמה שוחזרה בהצלחה! עובר לכניסה...", "success");
        setTimeout(() => window.location.href = "index.html", 2000);
    });
})();