let sessionCookie = null;
let csrfToken = null;
let lastLogin = 0;
require("dotenv").config();

const numberFormat = new Intl.NumberFormat("en-US");
const PIHOLE_URL = "http://localhost";
const PASSWORD = process.env.PIHOLE_PASSWORD;

async function login() {
    const res = await fetch(`${PIHOLE_URL}/api/auth`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: PASSWORD })
    });

    const data = await res.json();

    if (!data.session?.valid) {
        throw new Error("Pi-hole login failed");
    }

    sessionCookie = res.headers.get("set-cookie")?.split(";")[0];
    csrfToken = data.session.csrf;
    lastLogin = Date.now();
}

async function fetchStats() {
    if (!sessionCookie || Date.now() - lastLogin > 25 * 60 * 1000) {
        await login();
    }

    const now = Math.floor(Date.now() / 1000);
    const from = now - 24 * 60 * 60;

    const res = await fetch(
        `${PIHOLE_URL}/api/stats/database/summary?from=${from}&until=${now}`,
        {
            headers: {
                "Cookie": sessionCookie,
                "X-CSRF-TOKEN": csrfToken
            }
        }
    );

    const data = await res.json();

    return data?.data ?? data;
}

async function getPiholeStatus() {
    try {
        const stats = await fetchStats();

        const queries = stats?.sum_queries ?? 0;
        const blocked = stats?.sum_blocked ?? 0;
        const percent = Number(stats?.percent_blocked ?? 0);

        //console.log(stats);

        return {
            title: "Pi-hole",
            value: `${numberFormat.format(blocked)} blocked`,
            detail: `${numberFormat.format(queries)} queries • ${percent.toFixed(1)}% blocked`,
            status: "good"
        };
    } catch (error) {
        return {
            title: "Pi-hole",
            value: "Error",
            detail: "Unable to fetch Pi-hole stats",
            status: "warning"
        };
    }
}

module.exports = {
    getPiholeStatus
};
