
(() => {
    "use strict";

    const currentUserObj = initPageHeader();
    if (!currentUserObj) return;

    const form = $("profileForm");
    
    // מילוי הנתונים בטעינה
    if (form) {
        $("profileEmail").value = currentUserObj.email;
        $("profileFirstName").value = currentUserObj.firstName;
        $("profileLastName").value = currentUserObj.lastName;
        $("profileAge").value = currentUserObj.age;
    }

    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const email = $("profileEmail").value.trim();
            const password = $("profilePassword").value;
            const confirmPassword = $("profileConfirmPassword").value;
            const firstName = $("profileFirstName").value.trim();
            const lastName = $("profileLastName").value.trim();
            const age = $("profileAge").value;

            // ולידציות
            const emailErr = validateEmail(email);
            if(emailErr) { alert(emailErr); return; }
            
            if(firstName.length < 2 || lastName.length < 2) { alert("שמות מינימום 2 תווים"); return; }
            if(age < 18 || age > 65) { alert("גיל בין 18 ל-65"); return; }
            
            // עדכון האובייקט
            const updatedUser = { ...currentUserObj };
            updatedUser.email = email;
            updatedUser.firstName = firstName;
            updatedUser.lastName = lastName;
            updatedUser.age = age;

            // עדכון סיסמה רק אם המשתמש הזין משהו
            if (password) {
                const passMsg = validatePassword(password);
                if (passMsg) { alert(passMsg); return; }
                if (password !== confirmPassword) { alert("סיסמאות לא תואמות"); return; }
                updatedUser.password = password;
            }

            if (updateUserProfile(updatedUser)) {
                alert("הפרופיל עודכן בהצלחה!");
                location.reload(); 
            } else {
                alert("שגיאה בשמירה");
            }
        });
    }
})();