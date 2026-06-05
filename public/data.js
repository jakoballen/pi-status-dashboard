

// Data layer: responsible only for fetching data from the API

export async function loadTerminalConfig() {
    try {
        const res = await fetch("/api/terminal");

        if (!res.ok) {
            throw new Error("Failed to load terminal config");
        }

        const data = await res.json();

        // Expecting { terminalUrl: "..." }
        return data.terminalUrl || null;
    } catch (err) {
        console.error("loadTerminalConfig error:", err);
        return null;
    }
}

export async function loadStatusData() {
    try {
        const res = await fetch("/api/status");

        if (!res.ok) {
            throw new Error("Failed to load status data");
        }

        return await res.json();
    } catch (err) {
        console.error("loadStatusData error:", err);
        return [];
    }
}