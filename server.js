const express = require("express");
const path = require("path");

const { getSystemStatus } = require("./services/system");
const { getPiholeStatus } = require("./services/pihole");
const { getMinioStatus } = require("./services/minio");
const { getWireguardStatus } = require("./services/wireguard");
const { getTerminalConfig } = require("./services/terminal");
const { getQbittorrentStatus } = require("./services/qbittorrent");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", async (req, res) => {
    try {
        const systemStatus = await getSystemStatus();

        const statuses = [
            ...systemStatus,
            await getPiholeStatus(),
            await getMinioStatus(),
            await getWireguardStatus(),
            await getQbittorrentStatus()
        ];

        res.json(statuses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get status" });
    }
});

app.get("/api/terminal", (req, res) => {
    res.json(getTerminalConfig());
});

app.listen(PORT, () => {
    console.log(`Pi Status Dashboard running at http://localhost:${PORT}`);
});