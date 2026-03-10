
(() => {
    "use strict";

    const currentUserObj = initPageHeader();
    if (!currentUserObj) return;

    const form = $("shiftForm");
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("id");

    if (editId) {
        loadShiftData(editId);
    }

    if (form) {
form.addEventListener("submit", (e) => {
            e.preventDefault();

            // איסוף הנתונים
            const date = $("shiftDate").value;
            const start = $("startTime").value;
            const end = $("endTime").value;
            const wage = $("hourlyWage").value;
            const role = $("shiftRole").value;
            const branch = $("shiftBranch").value;

            // בדיקת שדות ריקים
            if (!date || !start || !end || !wage || !role || !branch) {
                alert("נא למלא את כל השדות");
                return;
            }

            // בדיקת שכר חיובי
            if (parseFloat(wage) <= 0) {
                alert("שכר חייב להיות חיובי");
                return;
            }

            // --- חדש: בדיקה שמונעת דיווח על משמרות עתידיות ---
            const now = new Date(); // הזמן עכשיו
            let shiftEndDateTime = new Date(`${date}T${end}`); // מתי המשמרת נגמרת

            // אם שעת הסיום קטנה משעת ההתחלה (משמרת לילה), מוסיפים יום לתאריך הסיום
            if (end < start) {
                shiftEndDateTime.setDate(shiftEndDateTime.getDate() + 1);
            }

            // אם זמן סיום המשמרת הוא בעתיד -> שגיאה
            if (shiftEndDateTime > now) {
                alert("שגיאה: לא ניתן לדווח על משמרת שטרם הסתיימה (תאריך או שעה עתידיים).");
                return; 
            }
            // -------------------------------------------------------

            // בדיקת חפיפה (עכשיו בודקת גם תאריך וגם שעות מדויקות)
            if (checkOverlap(date, start, end, editId)) {
                alert("שגיאה: קיימת כבר משמרת חופפת בשעות אלו.");
                return;
            }

            // יצירת אובייקט המשמרת לשמירה
            const shift = {
                id: editId || Date.now().toString(),
                username: currentUserObj.username,
                date,
                startTime: start,
                endTime: end,
                hourlyWage: wage,
                role,
                branch,
                // מוודאים שהערות נשמרות (עם הגנה משגיאות)
                comments: document.getElementById('comments') ? document.getElementById('comments').value : ""
            };

            // שמירה ומעבר עמוד
            saveShift(shift, editId);
            alert("המשמרת נשמרה בהצלחה!");
            window.location.href = "shifts.html";
        });
    }

    function loadShiftData(id) {
        const shifts = loadShifts();
        const shift = shifts.find(s => s.id === id);
        if (!shift || shift.username !== currentUserObj.username) {
            alert("משמרת לא נמצאה");
            window.location.href = "shifts.html";
            return;
        }

        $("shiftDate").value = shift.date;
        $("startTime").value = shift.startTime;
        $("endTime").value = shift.endTime;
        $("hourlyWage").value = shift.hourlyWage;
        $("shiftRole").value = shift.role;
        $("shiftBranch").value = shift.branch;
        $("comments").value = shift.comments || "";
        
        const h2 = document.querySelector("h2");
        if(h2) h2.textContent = "עדכון משמרת";
    }

    function saveShift(newShift, isUpdate) {
        let shifts = loadShifts();
        if (isUpdate) {
            const index = shifts.findIndex(s => s.id === isUpdate);
            if (index !== -1) shifts[index] = newShift;
        } else {
            shifts.push(newShift);
        }
        saveShifts(shifts);
    }

function checkOverlap(newDate, newStart, newEnd, currentId) {
    // 1. טוענים את כל המשמרות של המשתמש
    const shifts = loadShifts().filter(s => s.username === currentUserObj.username);
    
    // 2. פונקציית עזר לחישוב זמנים
    const getShiftAbsoluteTimes = (dateStr, startStr, endStr) => {
        const start = new Date(`${dateStr}T${startStr}`);
        let end = new Date(`${dateStr}T${endStr}`);
        
        if (end < start) {
            end.setDate(end.getDate() + 1);
        }
        return { start, end };
    };

    // 3. מחשבים את הזמנים של המשמרת החדשה
    const newShiftTimes = getShiftAbsoluteTimes(newDate, newStart, newEnd);

    // 4. בודקים מול כל המשמרות האחרות
    return shifts.some(existingShift => {
        if (currentId && existingShift.id === currentId) return false; 
        
        const existingShiftTimes = getShiftAbsoluteTimes(existingShift.date, existingShift.startTime, existingShift.endTime);

        return (newShiftTimes.start < existingShiftTimes.end) && 
               (newShiftTimes.end > existingShiftTimes.start);
    });
    }
})();