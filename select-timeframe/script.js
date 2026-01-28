document.addEventListener("DOMContentLoaded", () => {
    const calendar = document.querySelector(".calendar-component");
    initializeCalendar(calendar, new Date()); // Initialize with current date
    setUpDateSelection(calendar);
    document
        .getElementById("reset-selection")
        .addEventListener("click", resetSelection);
    updateDisplayDates(); // Set initial state of the reset button
});

let selectedStartDate = null;
let selectedEndDate = null;

function initializeCalendar(calendarElement, startDate) {
    const header = calendarElement.querySelector(".month-display");
    const grid = calendarElement.querySelector(".calendar-grid");
    const prevMonthButton = calendarElement.querySelector(".month-move.left");
    const nextMonthButton = calendarElement.querySelector(".month-move.right");

    // function renderCalendar(date) {
    //     header.innerText = `${date.toLocaleString("default", {
    //         month: "long",
    //     })} ${date.getFullYear()}`;
    //     grid.innerHTML = ""; // Clear existing grid cells

    //     const daysInMonth = new Date(
    //         date.getFullYear(),
    //         date.getMonth() + 1,
    //         0
    //     ).getDate();
    //     for (let i = 1; i <= daysInMonth; i++) {
    //         const dayElement = document.createElement("div");
    //         dayElement.innerText = i;
    //         dayElement.classList.add("calendar-day");
    //         dayElement.dataset.date = new Date(
    //             date.getFullYear(),
    //             date.getMonth(),
    //             i
    //         ).toISOString();
    //         grid.appendChild(dayElement);
    //     }
    // }

    function renderCalendar(date) {
        header.innerText = `${date.toLocaleString("default", {
            month: "long",
        })} ${date.getFullYear()}`;
        grid.innerHTML = ""; // Clear existing grid cells

        // Insert days of the week
        const daysOfWeek = ["M", "T", "W", "T", "F", "S", "S"]; // Start with Monday if your week starts on Monday

        daysOfWeek.forEach((day) => {
            const dayElement = document.createElement("div");
            dayElement.innerText = day;
            dayElement.classList.add("day-of-week");
            grid.appendChild(dayElement);
        });

        // Calculate the day of the week the first day of the month falls on
        const firstDayOfMonth = new Date(
            date.getFullYear(),
            date.getMonth(),
            1
        ).getDay();
        const startingDayIndex = (firstDayOfMonth + 6) % 7; // Adjusted for a Monday start (0 is now Monday, 6 is Sunday)

        // Add blank days to start the first week on the correct day of the week
        for (let i = 0; i < startingDayIndex; i++) {
            const emptyCell = document.createElement("div");
            grid.appendChild(emptyCell);
        }

        const daysInMonth = new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0
        ).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement("div");
            dayElement.innerText = i;
            dayElement.classList.add("calendar-day");
            dayElement.dataset.date = new Date(
                date.getFullYear(),
                date.getMonth(),
                i
            ).toISOString();
            grid.appendChild(dayElement);
        }

        updateCalendarDisplay(calendarElement); // Ensure the selected range is updated when rendering a new month
    }

    renderCalendar(startDate);

    prevMonthButton.addEventListener("click", () => {
        startDate.setMonth(startDate.getMonth() - 1);
        renderCalendar(startDate);
    });

    nextMonthButton.addEventListener("click", () => {
        startDate.setMonth(startDate.getMonth() + 1);
        renderCalendar(startDate);
    });
}

function setUpDateSelection(calendar) {
    calendar.addEventListener("click", (event) => {
        if (event.target.classList.contains("calendar-day")) {
            const clickedDate = new Date(event.target.dataset.date);

            // Check if we should reset the selection or set an end date
            if (
                !selectedStartDate ||
                clickedDate < selectedStartDate ||
                selectedEndDate
            ) {
                // If no start date is selected, or the clicked date is before the start date,
                // or there is already an end date, reset/start the selection
                selectedStartDate = clickedDate;
                selectedEndDate = null; // Reset the end date since we're starting a new selection
            } else if (clickedDate > selectedStartDate) {
                // If the clicked date is after the start date, set it as the end date
                selectedEndDate = clickedDate;
            }

            updateCalendarDisplay(calendar);
            updateDisplayDates();
        }
    });
}

function updateCalendarDisplay(calendar) {
    const days = calendar.querySelectorAll(".calendar-day");
    days.forEach((dayElement) => {
        const dayDate = new Date(dayElement.dataset.date);
        dayElement.classList.remove("selected", "start", "end", "in-range"); // Add 'in-range' to the list of removed classes
        if (
            selectedStartDate &&
            dayDate.getTime() === selectedStartDate.getTime()
        ) {
            dayElement.classList.add("selected", "start");
        }
        if (
            selectedEndDate &&
            dayDate.getTime() === selectedEndDate.getTime()
        ) {
            dayElement.classList.add("selected", "end");
        }
        if (
            selectedStartDate &&
            selectedEndDate &&
            dayDate > selectedStartDate &&
            dayDate < selectedEndDate
        ) {
            dayElement.classList.add("in-range"); // Add 'in-range' class if the day is between the start and end dates
        }
    });
}

function updateDisplayDates() {
    const displayStartDate = document.getElementById("display-start-date");
    const displayEndDate = document.getElementById("display-end-date");
    const resetButton = document.getElementById("reset-selection");

    displayStartDate.textContent = selectedStartDate
        ? selectedStartDate.toLocaleDateString()
        : "";
    displayEndDate.textContent = selectedEndDate
        ? selectedEndDate.toLocaleDateString()
        : "";

    // Disable the reset button if no dates are selected
    if (!selectedStartDate && !selectedEndDate) {
        resetButton.disabled = true;
    } else {
        resetButton.disabled = false;
    }
}

function resetSelection() {
    selectedStartDate = null;
    selectedEndDate = null;
    updateCalendarDisplay(document.querySelector(".calendar-component"));
    updateDisplayDates();
}
