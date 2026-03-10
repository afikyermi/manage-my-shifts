
(() => {
    "use strict";

    const form = $("signupForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
        setMessage("signupGeneralMessage", "");

        const email = $("signupEmail").value.trim();
        const username = $("signupUsername").value.trim();
        const password = $("signupPassword").value;
        const confirmPassword = $("signupConfirmPassword").value;
        const firstName = $("signupFirstName").value.trim();
        const lastName = $("signupLastName").value.trim();
        const ageVal = $("signupAge").value;
        const idLast4 = $("signupIdLast4").value.trim();

        let hasError = false;

        const emailMsg = validateEmail(email);
        if (emailMsg) { setText("signupEmailError", emailMsg); hasError = true; }

        if (username.length < 6) {
            setText("signupUsernameError", "שם משתמש לפחות 6 תווים");
            hasError = true;
        } else if (getUserByUsername(username)) {
            setText("signupUsernameError", "שם המשתמש תפוס");
            hasError = true;
        }

        const passMsg = validatePassword(password);
        if (passMsg) { setText("signupPasswordError", passMsg); hasError = true; }

        if (password !== confirmPassword) {
            setText("signupConfirmPasswordError", "הסיסמאות אינן תואמות");
            hasError = true;
        }

        if (firstName.length < 2) { setText("signupFirstNameError", "מינימום 2 תווים"); hasError = true; }
        if (lastName.length < 2) { setText("signupLastNameError", "מינימום 2 תווים"); hasError = true; }

        const age = parseFloat(ageVal);
        if (isNaN(age) || age < 18 || age > 65) {
            setText("signupAgeError", "גיל חייב להיות בין 18 ל-65");
            hasError = true;
        }

        if (idLast4.length !== 4 || isNaN(idLast4)) {
            setText("signupIdLast4Error", "יש להזין 4 ספרות בדיוק");
            hasError = true;
        }

        if (hasError) return;

        const users = loadUsers();
        const newUser = {
            username,
            password,
            email,
            firstName,
            lastName,
            age,
            idLast4
        };
        
        users.push(newUser);
        saveUsers(users);

        alert("ההרשמה בוצעה בהצלחה!");
        window.location.href = "index.html";
    });
})();