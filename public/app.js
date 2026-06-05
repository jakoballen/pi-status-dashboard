import { loadStatusData, loadTerminalConfig } from "./data.js";
import { renderStatusCards, updateLastCheckedTime } from "./ui.js";

const terminalBtn = document.getElementById("terminalBtn");

let TERMINAL_URL = null;

function setupTerminalButton() {
    if (!terminalBtn) return;

    // Hide button by default
    terminalBtn.style.display = "none";

    if (!TERMINAL_URL) {
        return;
    }

    // Show button only if URL exists
    terminalBtn.style.display = "inline-block";

    terminalBtn.addEventListener("click", () => {
        window.open(TERMINAL_URL, "_blank");
    });
}

async function refresh() {
    try {
        const data = await loadStatusData();
        renderStatusCards(data);
        updateLastCheckedTime();
    } catch (err) {
        console.error(err);
    }
}

async function init() {
    TERMINAL_URL = await loadTerminalConfig();
    setupTerminalButton();
    await refresh();
    setInterval(refresh, 30000);
}

init();