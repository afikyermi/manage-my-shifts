(() => {
    "use strict";

    const currentUserObj = initPageHeader();
    if (!currentUserObj) return;

    const KEYS = { EDU: "resume_education", JOB: "resume_employment" };
    let editingState = { key: null, id: null };

    // אלמנטים
    const eduForm = $("educationForm");
    const jobForm = $("employmentForm");
    
    // מכולות טבלה (לניהול)
    const eduTableBody = document.querySelector("#educationTable tbody");
    const jobTableBody = document.querySelector("#employmentTable tbody");

    // מכולות מסמך (לתצוגה)
    const cvEmploymentPreview = $("cvEmploymentPreview");
    const cvEducationPreview = $("cvEducationPreview");

    // ============================================================
    // טעינת כותרת המסמך
    // ============================================================
    function renderCVHeader() {
        const headerDiv = $("cvHeader");
        if (headerDiv && currentUserObj) {
            headerDiv.innerHTML = `
                <h1 class="cv-name">${currentUserObj.firstName} ${currentUserObj.lastName}</h1>
                <div class="cv-contact">
                    ${currentUserObj.email} | ${currentUserObj.age ? `גיל: ${currentUserObj.age}` : ''}
                </div>
            `;
        }
    }

    // ============================================================
    // ניהול שמירה (משותף)
    // ============================================================
    function handleSaveItem(key, newItem, formElement) {
        let list = JSON.parse(localStorage.getItem(key) || "[]");

        if (editingState.id && editingState.key === key) {
            const index = list.findIndex(i => i.id === editingState.id);
            if (index !== -1) list[index] = newItem;
            alert("הפריט עודכן בהצלחה!");
        } else {
            list.push(newItem);
            alert("הפריט נוסף בהצלחה!");
        }

        localStorage.setItem(key, JSON.stringify(list));
        formElement.reset();
        resetEditingState(formElement);
        renderAll(); 
    }

    function resetEditingState(form) {
        editingState = { key: null, id: null };
        const btn = form.querySelector('button[type="submit"]');
        btn.innerText = form.id === "educationForm" ? "שמור השכלה" : "שמור ניסיון תעסוקתי";
        btn.classList.remove("updating");
    }

    // ============================================================
    // האזנה לטפסים
    // ============================================================
    if (eduForm) {
        eduForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const item = {
                id: editingState.id || Date.now().toString(),
                username: currentUserObj.username,
                startYear: $("eduStartYear").value,
                endYear: $("eduEndYear").value,
                institution: $("eduInstitution").value,
                degree: $("eduDegree").value,
                description: $("eduDescription").value
            };
            handleSaveItem(KEYS.EDU, item, eduForm);
        });
    }

    if (jobForm) {
        jobForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const item = {
                id: editingState.id || Date.now().toString(),
                username: currentUserObj.username,
                startYear: $("jobStartYear").value,
                endYear: $("jobEndYear").value,
                employer: $("jobEmployer").value,
                role: $("jobRole").value,
                description: $("jobDescription").value
            };
            handleSaveItem(KEYS.JOB, item, jobForm);
        });
    }

    // ============================================================
    // פונקציות גלובליות
    // ============================================================
    window.deleteResumeItem = function(key, id) {
        if (!confirm("למחוק?")) return;
        let list = JSON.parse(localStorage.getItem(key) || "[]");
        list = list.filter(i => i.id !== id);
        localStorage.setItem(key, JSON.stringify(list));
        renderAll();
    };

    window.editResumeItem = function(key, id) {
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        const item = list.find(i => i.id === id);
        if (!item) return;

        editingState = { key, id };

        if (key === KEYS.EDU) {
            $("eduStartYear").value = item.startYear;
            $("eduEndYear").value = item.endYear || "";
            $("eduInstitution").value = item.institution;
            $("eduDegree").value = item.degree;
            $("eduDescription").value = item.description || "";
            toggleEditMode(eduForm, "עדכן השכלה");
        } 
        else if (key === KEYS.JOB) {
            $("jobStartYear").value = item.startYear;
            $("jobEndYear").value = item.endYear || "";
            $("jobEmployer").value = item.employer;
            $("jobRole").value = item.role;
            $("jobDescription").value = item.description || "";
            toggleEditMode(jobForm, "עדכן ניסיון תעסוקתי");
        }
    };

    function toggleEditMode(form, btnText) {
        form.scrollIntoView({ behavior: "smooth" });
        const btn = form.querySelector('button[type="submit"]');
        btn.innerText = btnText;
        btn.classList.add("updating");
    }

    // ============================================================
    // פונקציות רינדור (Render)
    // ============================================================

    function renderAll() {
        const jobs = JSON.parse(localStorage.getItem(KEYS.JOB) || "[]").filter(i => i.username === currentUserObj.username);
        const edus = JSON.parse(localStorage.getItem(KEYS.EDU) || "[]").filter(i => i.username === currentUserObj.username);

        // 1. טבלאות ניהול (עם הסדר החדש: תפקיד, חברה, תיאור)
        renderManagementTable(jobTableBody, jobs, KEYS.JOB, 'role', 'employer');
        renderManagementTable(eduTableBody, edus, KEYS.EDU, 'degree', 'institution');

        // 2. תצוגה מקדימה (משתמשת ב-Template מה-HTML)
        renderPreviewList(cvEmploymentPreview, jobs, 'role', 'employer');
        renderPreviewList(cvEducationPreview, edus, 'degree', 'institution');
    }

    function renderManagementTable(container, list, key, titleField, subField) {
        if (!container) return;
        container.innerHTML = "";
        
        if (list.length === 0) {
            container.innerHTML = "<tr><td colspan='3' style='text-align:center'>אין נתונים</td></tr>";
            return;
        }

        list.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td style="font-weight:bold; color:#3498db;">
                    ${item.startYear} - ${item.endYear || "כיום"}
                </td>
                <td>
                    <div class="table-role">${item[titleField]}</div>
                    <div class="table-place">${item[subField]}</div>
                    ${item.description ? `<div class="table-desc">${item.description}</div>` : ''}
                </td>
                <td style="text-align:center; min-width: 150px;">
                    <button class="edit-btn" onclick="editResumeItem('${key}', '${item.id}')">עדכן</button>
                    <button class="delete-btn" onclick="deleteResumeItem('${key}', '${item.id}')">מחק</button>
                </td>
            `;
            container.appendChild(tr);
        });
    }

    function renderPreviewList(container, list, titleField, subField) {
        if (!container) return;
        container.innerHTML = "";

        if (list.length === 0) {
            container.innerHTML = "<p style='color:#999; font-style:italic;'>טרם הוזן מידע.</p>";
            return;
        }

        const template = document.getElementById("cvItemTemplate");

        list.forEach(item => {
            const clone = template.content.cloneNode(true);

            clone.querySelector(".item-title-text").textContent = item[titleField];
            clone.querySelector(".item-dates").textContent = `${item.startYear} - ${item.endYear || "כיום"}`;
            clone.querySelector(".cv-item-subtitle").textContent = item[subField];
            
            const descDiv = clone.querySelector(".cv-item-desc");
            if (item.description) {
                descDiv.textContent = item.description;
            } else {
                descDiv.remove();
            }

            container.appendChild(clone);
        });
    }

    renderCVHeader();
    renderAll();
})();