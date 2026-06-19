const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

async function getWireguardStatus() {
    try {
        const { stdout } = await execPromise("systemctl is-active wg-quick@wg0");
        const isActive = stdout.trim() === "active";

        return {
            title: "WireGuard",
            value: isActive ? "Active" : "Inactive",
            detail: isActive
                ? "VPN interface wg0 is running"
                : "VPN interface wg0 is stopped",
            status: isActive ? "good" : "bad"
        };
    } catch (error) {
        return {
            title: "WireGuard",
            value: "Unknown",
            detail: "Unable to determine WireGuard status",
            status: "warning"
        };
    }
}

module.exports = {
    getWireguardStatus
};