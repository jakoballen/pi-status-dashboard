const { exec } = require("child_process");
const util = require("util");

const execPromise = util.promisify(exec);

const MINIO_HEALTH_URL = "http://localhost:9000/minio/health/live";

async function getMinioStatus() {
    try {
        // Check systemd service
        const { stdout: serviceOut } = await execPromise("systemctl is-active minio");
        const isActive = serviceOut.trim() === "active";

        // Check MinIO health endpoint
        let isHealthy = false;
        try {
            const { stdout: healthOut } = await execPromise(`curl -s -o /dev/null -w "%{http_code}" ${MINIO_HEALTH_URL}`);
            isHealthy = healthOut.trim() === "200";
        } catch {
            isHealthy = false;
        }

        let value = "Inactive";
        let detail = "Object storage service is stopped";
        let status = "bad";

        if (isActive && isHealthy) {
            value = "Healthy";
            detail = "Service running and responding";
            status = "good";
        } else if (isActive && !isHealthy) {
            value = "Degraded";
            detail = "Service running but not responding";
            status = "warning";
        }

        return {
            title: "MinIO",
            value,
            detail: `${detail}`,
            status
        };
    } catch (error) {
        return {
            title: "MinIO",
            value: "Unknown",
            detail: "Unable to determine MinIO status",
            status: "warning"
        };
    }
}

module.exports = {
    getMinioStatus
};