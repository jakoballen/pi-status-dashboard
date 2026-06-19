const QB_URL = process.env.QB_URL || "http://localhost:8080";

function formatSpeed(bytesPerSec) {
    if (!bytesPerSec && bytesPerSec !== 0) return null;

    const mb = bytesPerSec / 1024 / 1024;
    if (mb >= 1) return `⬇ ${mb.toFixed(2)} MB/s`;
    
    const kb = bytesPerSec / 1024;
    return `⬇ ${kb.toFixed(0)} KB/s`;
}

async function getQbittorrentStatus() {
    try {
        let transfer = null;

        try {
            const tRes = await fetch(`${QB_URL}/api/v2/transfer/info`);
            if (tRes.ok) {
                transfer = await tRes.json();
            }
        } catch (e) {
            transfer = null;
        }

        const downloadSpeed = transfer?.dl_info_speed ?? 0;
        const uploadSpeed = transfer?.up_info_speed ?? 0;

        return {
            title: "qBittorrent",
            value: `${downloadSpeed === 0 ? "Idle" : downloadSpeed}`,
            detail: `⬇ ${formatSpeed(downloadSpeed)} • ⬆ ${uploadSpeed ? (uploadSpeed / 1024 / 1024).toFixed(2) : 0} MB/s`,
            status: "good"
        };

    } catch (err) {
        return {
            name: "qBittorrent",
            status: "offline"
        };
    }
}

module.exports = { getQbittorrentStatus };