require("dotenv").config();

function getTerminalConfig() {
    return {
        terminalUrl: process.env.TERMINAL_URL
    };
}

module.exports = {
    getTerminalConfig
};