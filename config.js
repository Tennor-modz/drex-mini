require('dotenv').config();

module.exports = {
    // Bot Config
    BOT_NAME: process.env.BOT_NAME || "Hunter Bot",
    PREFIX: process.env.PREFIX || ".",
    
    // Panel Config
    PANEL_DOMAIN: process.env.PANEL_DOMAIN,
    PANEL_API_KEY: process.env.PANEL_API_KEY,
    GLOBAL_EGG: process.env.GLOBAL_EGG || "15",
    GLOBAL_LOCATION: process.env.GLOBAL_LOCATION || "1",
    BOT_SERVER_ID: process.env.BOT_SERVER_ID,
    
    // Bot Owner
    BOT_OWNER: process.env.BOT_OWNER
};
