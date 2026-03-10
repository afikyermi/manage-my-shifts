
(() => {
    "use strict";

    const currentUserObj = initPageHeader();
    if (!currentUserObj) return;

    const tableBody = document.querySelector("#shiftsTable tbody");
    const totalSalarySpan = $("totalSalary");
    const filterForm = $("filterForm");

    renderTable();

    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            renderTable();
        });
    }

    function renderTable() {
        if (!tableBody) return;

        let allShifts = loadShifts();
        let userShifts = allShifts.filter(s => s.username === currentUserObj.username);

        const branchVal = $("filterBranch") ? $("filterBranch").value : "";
        const roleVal = $("filterRole") ? $("filterRole").value.trim().toLowerCase() : "";

        if (branchVal) {
            userShifts = userShifts.filter(s => s.branch === branchVal);
        }
        if (roleVal) {
            userShifts = userShifts.filter(s => s.role.toLowerCase().includes(roleVal));
        }

        tableBody.innerHTML = "";
        let grandTotal = 0;

        userShifts.forEach(shift => {
            const tr = document.createElement("tr");

            const salary = calculateSalary(shift.startTime, shift.endTime, shift.hourlyWage);
            grandTotal += salary;

            const dateDisplay = shift.date.split("-").reverse().join("/");

tr.innerHTML = `
                <td>${dateDisplay}</td>
                <td>${shift.startTime}</td>
                <td>${shift.endTime}</td>
                <td>${parseFloat(shift.hourlyWage).toFixed(2)}</td>
                <td>${shift.role}</td>
                <td>${translateBranch(shift.branch)}</td>
                
                <td style="font-weight:bold;">${salary.toFixed(2)} ₪</td>
                
                <td title="${shift.comments || ''}" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: help;">
                    ${shift.comments || "-"}
                </td>

                <td><button class="delete-btn" data-id="${shift.id}">מחק</button></td>
                <td><button class="edit-btn" data-id="${shift.id}">עדכן</button></td>
            `;

            tableBody.appendChild(tr);
        });

        if (totalSalarySpan) {
            totalSalarySpan.textContent = grandTotal.toFixed(2) + " ₪";
        }

        attachButtonEvents();
    }

    function calculateSalary(start, end, wage) {
        const [h1, m1] = start.split(":").map(Number);
        const [h2, m2] = end.split(":").map(Number);
        
        let startDec = h1 + m1 / 60;
        let endDec = h2 + m2 / 60;
        
        let hours = endDec - startDec;
        if (hours < 0) hours += 24; 
        
        return hours * parseFloat(wage);
    }

    function attachButtonEvents() {
        document.querySelectorAll(".delete-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                deleteShift(id);
            });
        });

        document.querySelectorAll(".edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = e.target.getAttribute("data-id");
                window.location.href = `add-update-shift.html?id=${id}`;
            });
        });
    }

    function deleteShift(id) {
        if (!confirm("האם למחוק משמרת זו?")) return;
        let all = loadShifts();
        all = all.filter(s => s.id !== id);
        saveShifts(all);
        renderTable();
    }

    function translateBranch(branch) {
        const dict = { 
            "tel-aviv": 'ת"א', 
            "haifa": "חיפה", 
            "jerusalem": "ירושלים", 
            "beer-sheva": 'ב"ש',
            "eilat": "אילת",
            "raanana": "רעננה",
            "kiryat-gat": "קרית גת"
        };
        return dict[branch] || branch;
    }

})();