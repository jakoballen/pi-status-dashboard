// UI layer: responsible only for rendering

const statusGrid = document.getElementById("statusGrid");
const lastUpdated = document.getElementById("lastUpdated");

const SERVICE_LINKS = {
    "Pi-hole": `${window.location.protocol}//${window.location.hostname}/admin`,
    "MinIO": `${window.location.protocol}//${window.location.hostname}:9001`,
    "qBittorrent": `${window.location.protocol}//${window.location.hostname}:8080`
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

export function updateLastCheckedTime() {
    if (!lastUpdated) return;

    const now = new Date();
    lastUpdated.textContent = `Last updated: ${now.toLocaleString()} (auto-refresh every 30s)`;
}

// -------------------- UI Components --------------------

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

    // clickable services
    const link = SERVICE_LINKS[item.title];
    if (link) {
        card.classList.add("clickable");

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
    wrapper.className = "statusSection";

    const heading = document.createElement("h2");
    heading.className = "sectionTitle";
    heading.textContent = title;

    const grid = document.createElement("div");
    grid.className = "statusGrid";

    items.forEach(item => {
        grid.appendChild(createStatusCard(item));
    });

    wrapper.appendChild(heading);
    wrapper.appendChild(grid);

    return wrapper;
}

// -------------------- Main Render --------------------

export function renderStatusCards(statusItems) {
    if (!statusGrid) return;

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