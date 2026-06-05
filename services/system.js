const { exec } = require("child_process");
const os = require("os");
const util = require("util");
const EXTERNAL_STORAGE_PATH = "/mnt/usb";

const execPromise = util.promisify(exec);

function getUsageStatus(percent) {
    if (percent >= 90) {
        return "bad";
    }

    if (percent >= 75) {
        return "warning";
    }

    return "good";
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
}

async function getCpuTemperature() {
    try {
        const { stdout } = await execPromise("cat /sys/class/thermal/thermal_zone0/temp");
        const tempCelsius = Number(stdout.trim()) / 1000;

        return {
            value: `${tempCelsius.toFixed(1)}°C`,
            raw: tempCelsius
        };
    } catch (error) {
        return {
            value: "Unavailable",
            raw: null
        };
    }
}

async function getDiskUsage() {
    try {
        const { stdout } = await execPromise("df -h / | awk 'NR==2 {print $3, $2, $5}'");
        const [used, total, percent] = stdout.trim().split(" ");

        return {
            value: percent,
            detail: `${used} used of ${total}`,
            status: getUsageStatus(parseInt(percent, 10))
        };
    } catch (error) {
        return {
            value: "Unavailable",
            detail: "Disk usage could not be checked"
        };
    }
}

async function getExternalStorageStatus() {
    try {
        await execPromise("mountpoint -q " + EXTERNAL_STORAGE_PATH);
        const { stdout } = await execPromise("df -h " + EXTERNAL_STORAGE_PATH + " | awk 'NR==2 {print $3, $2, $5}'");
        const [used, total, percent] = stdout.trim().split(" ");

        return {
            title: "External Storage",
            value: percent,
            detail: `${used} used of ${total}`,
            status: getUsageStatus(parseInt(percent, 10))
        };
    } catch (error) {
        return {
            title: "External Storage",
            value: "Offline",
            detail: "Drive is not mounted",
            status: "bad"
        };
    }
}

function getMemoryUsage() {
    const totalBytes = os.totalmem();
    const freeBytes = os.freemem();
    const usedBytes = totalBytes - freeBytes;
    const usedPercent = Math.round((usedBytes / totalBytes) * 100);

    const usedMb = Math.round(usedBytes / 1024 / 1024);
    const totalMb = Math.round(totalBytes / 1024 / 1024);

    return {
        value: `${usedPercent}%`,
        detail: `${usedMb} MB used of ${totalMb} MB`,
        status: getUsageStatus(usedPercent)
    };
}

async function getSystemStatus() {
    const cpuTemperature = await getCpuTemperature();
    const memoryUsage = getMemoryUsage();
    const diskUsage = await getDiskUsage();
    const externalStorage = await getExternalStorageStatus();

    return [
        {
            title: "Pi Status",
            value: "Online",
            detail: `Uptime: ${formatUptime(os.uptime())}`,
            status: "good"
        },
        {
            title: "CPU Temperature",
            value: cpuTemperature.value,
            detail: cpuTemperature.raw === null ? "Temperature sensor unavailable" : "Current CPU temperature",
            status: cpuTemperature.raw === null
                ? "warning"
                : cpuTemperature.raw >= 80
                    ? "bad"
                    : cpuTemperature.raw >= 70
                        ? "warning"
                        : "good"
        },
        {
            title: "RAM Usage",
            value: memoryUsage.value,
            detail: memoryUsage.detail,
            status: memoryUsage.status
        },
        {
            title: "Disk Usage",
            value: diskUsage.value,
            detail: diskUsage.detail,
            status: diskUsage.status
        },
        externalStorage
    ];
}

module.exports = {
    getSystemStatus
};