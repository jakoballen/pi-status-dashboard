const statusGrid = document.getElementById("statusGrid");
const lastUpdated = document.getElementById("lastUpdated");
const terminalBtn = document.getElementById("terminalBtn");

let TERMINAL_URL = null;

// -------------------- Config --------------------

const SERVICE_LINKS = {
    "Pi-hole": `${window.location.protocol}//${window.location.hostname}/admin`,
    "MinIO": `${window.location.protocol}//${window.location.hostname}:9001`
};

const SYSTEM_TITLES = new Set([
    "Pi Status",
    "CPU Temperature",
    "RAM Usage",
    "Disk Usage",
    "External Storage"
]);

const SYSTEM_ORDER = [
    "Pi Status",
    "CPU Temperature",
    "RAM Usage",
    "Disk Usage",
    "External Storage"
];

// -------------------- Helpers --------------------

function getIcon(title) {
    const icons = {
        "Pi Status": "🖥️",
        "CPU Temperature": "🌡️",
        "RAM Usage": "🧠",
        "Disk Usage": "💾",
        "External Storage": "📦",
        "Pi-hole": "🛡️",
        "MinIO": "☁️",
        "WireGuard": "🔒"
    };

    return icons[title] || "📊";
}

function updateLastCheckedTime() {
    const now = new Date();
    lastUpdated.textContent = `Last updated: ${now.toLocaleString()} (auto-refresh every 30s)`;
}

// -------------------- UI --------------------

function createStatusCard(item) {
    const card = document.createElement("article");
    card.className = "statusCard";
    card.classList.add(item.status || "neutral");

    const heading = document.createElement("h2");
    heading.textContent = `${getIcon(item.title)} ${item.title}`;

    const value = document.createElement("p");
    value.className = `statusValue ${item.status || "neutral"}`;
    value.textContent = item.value;

    const detail = document.createElement("p");
    detail.className = "statusDetail";
    detail.textContent = item.detail;

    card.appendChild(heading);
    card.appendChild(value);
    card.appendChild(detail);

    // Clickable service cards
    const link = SERVICE_LINKS[item.title];
    if (link) {
        card.style.cursor = "pointer";

        const indicator = document.createElement("span");
        indicator.textContent = " ↗";
        indicator.style.opacity = "0.6";
        heading.appendChild(indicator);

        card.addEventListener("click", () => {
            window.open(link, "_blank");
        });
    }

    return card;
}

function createSection(title, items) {
    const wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.marginBottom = "1.5rem";

    const heading = document.createElement("h2");
    heading.textContent = title;
    heading.style.margin = "1rem 0 0.5rem";
    heading.style.fontSize = "1.25rem";
    heading.style.borderBottom = "1px solid #ccc";
    heading.style.paddingBottom = "0.25rem";

    const grid = document.createElement("div");
    grid.className = "statusGrid";

    items.forEach(item => {
        grid.appendChild(createStatusCard(item));
    });

    wrapper.appendChild(heading);
    wrapper.appendChild(grid);

    return wrapper;
}

function renderStatusCards(statusItems) {
    statusGrid.innerHTML = "";

    if (!statusItems || statusItems.length === 0) {
        statusGrid.appendChild(createStatusCard({
            title: "No Status Data",
            value: "Unavailable",
            detail: "No dashboard services were found.",
            status: "warning"
        }));
        return;
    }

    const systemItems = [];
    const serviceItems = [];

    statusItems.forEach(item => {
        if (SYSTEM_TITLES.has(item.title)) {
            systemItems.push(item);
        } else {
            serviceItems.push(item);
        }
    });

    systemItems.sort((a, b) => SYSTEM_ORDER.indexOf(a.title) - SYSTEM_ORDER.indexOf(b.title));

    if (systemItems.length > 0) {
        statusGrid.appendChild(createSection("System", systemItems));
    }

    if (serviceItems.length > 0) {
        statusGrid.appendChild(createSection("Services", serviceItems));
    }
}

// -------------------- Data --------------------

async function loadTerminalConfig() {
    try {
        const res = await fetch("/api/terminal");
        const data = await res.json();
        TERMINAL_URL = data.terminalUrl;
    } catch (err) {
        console.error("Failed to load terminal config", err);
    }
}

async function loadStatusData() {
    try {
        const response = await fetch("/api/status");

        if (!response.ok) {
            throw new Error("Failed to load status data");
        }

        const statusData = await response.json();

        renderStatusCards(statusData);
        updateLastCheckedTime();
    } catch (error) {
        console.error(error);

        renderStatusCards([
            {
                title: "Dashboard Error",
                value: "Unavailable",
                detail: "Unable to retrieve status information.",
                status: "bad"
            }
        ]);
    }
}

// -------------------- Init --------------------

function setupTerminalButton() {
    if (!terminalBtn) return;

    terminalBtn.addEventListener("click", () => {
        if (!TERMINAL_URL) {
            console.error("TERMINAL_URL not loaded yet");
            return;
        }

        window.open(TERMINAL_URL, "_blank");
    });
}

async function init() {
    await loadTerminalConfig();
    setupTerminalButton();
    loadStatusData();
    setInterval(loadStatusData, 30000);
}

init();