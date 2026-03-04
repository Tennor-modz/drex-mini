/**
 * cases.js - Command handlers for the bot
 * Import this in your main router file and call handleCommand(command, args, msg, socket, sender, number, config, socketCreationTime)
 */

const yts = require("yt-search");
const fetch = require("node-fetch");
const axios = require("axios");

const api = `https://api-dark-shan-yt.koyeb.app`;
const apikey = `edbcfabbca5a9750`;

function formatMessage(title, content, footer) {
    return `${title}\n\n${content}\n\n${footer}`;
}

// Fetch news from API
async function fetchNews(NEWS_JSON_URL) {
    try {
        const response = await axios.get(NEWS_JSON_URL);
        return response.data || [];
    } catch (error) {
        console.error('Failed to fetch news from raw JSON URL:', error.message);
        return [];
    }
}

/**
 * Main command dispatcher
 * @param {string} command - The command name (without prefix)
 * @param {string[]} args - Command arguments
 * @param {object} msg - The raw WhatsApp message object
 * @param {object} socket - The Baileys socket instance
 * @param {string} sender - The sender JID
 * @param {string} number - The bot's sanitized number
 * @param {object} config - The bot config object
 * @param {Map} socketCreationTime - Map of socket creation times
 * @param {Function} SendSlide - The SendSlide function from main file
 */
async function handleCommand(command, args, msg, socket, sender, number, config, socketCreationTime, SendSlide) {
    switch (command) {

        // ── ALIVE ────────────────────────────────────────────────────────────
        case 'alive': {
            const startTime = socketCreationTime.get(number) || Date.now();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const title = '🪨 Hellow, *"Itz: ZEUS-MINI"*';
            const content =
                `*© bY|* kelumXz & Danuz\n` +
                `*◯ A B O U T*\n` +
                `> This is a lightweight, stable WhatsApp bot designed to run 24/7. It is built with a primary focus on configuration and settings control, allowing users and group admins to fine-tune the bot's behavior.\n` +
                `*◯ D E P L O Y*\n` +
                `> *Webiste* https://kelumxz-md.vercel.app`;
            const footer = config.BOT_FOOTER;

            await socket.sendMessage(sender, {
                image: { url: config.BUTTON_IMAGES.ALIVE },
                caption: formatMessage(title, content, footer),
                buttons: [
                    { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: 'MENU' }, type: 1 },
                    { buttonId: `${config.PREFIX}ping`, buttonText: { displayText: 'PING' }, type: 1 }
                ],
                quoted: msg
            });
            break;
        }

        // ── OWNER ────────────────────────────────────────────────────────────
        case 'owner': {
            const vcard =
                'BEGIN:VCARD\n' +
                'VERSION:3.0\n' +
                'FN:NOVA DEVS\n' +
                'ORG:NOVA DEVS\n' +
                'TEL;type=CELL;type=VOICE;waid=2348157763037:+234 815 776 3037\n' +
                'EMAIL:novadevsss@gmail.com\n' +
                'END:VCARD';

            await socket.sendMessage(sender, {
                contacts: {
                    displayName: "𝙉𝙊𝙑𝘼 𝘿𝙀𝙑𝙎",
                    contacts: [{ vcard }]
                }
            });

            await socket.sendMessage(sender, {
                image: { url: config.BUTTON_IMAGES.OWNER },
                caption: '*💗 𝙉𝙤𝙫𝙖 𝙈𝘿 OWNER DETAILS*',
                buttons: [
                    { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 },
                    { buttonId: `${config.PREFIX}alive`, buttonText: { displayText: '🤖 BOT INFO' }, type: 1 }
                ]
            });
            break;
        }

        // ── SYSTEM ───────────────────────────────────────────────────────────
        case 'system': {
            const startTime = socketCreationTime.get(number) || Date.now();
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);

            const title = '*💀 𝙉𝙤𝙫𝙖 𝙈𝘿 System 💥*';
            const content =
                `┏━━━━━━━━━━━━━━━━\n` +
                `┃🤖 \`ʙᴏᴛ ɴᴀᴍᴇ\` : ${config.BOT_NAME}\n` +
                `┃🔖 \`ᴠᴇʀsɪᴏɴ\` : ${config.BOT_VERSION}\n` +
                `┃📡 \`ᴘʟᴀᴛꜰᴏʀᴍ\` : Heroku\n` +
                `┃🪢 \`ʀᴜɴᴛɪᴍᴇ\` : ${hours}h ${minutes}m ${seconds}s\n` +
                `┃👨‍💻 \`ᴏᴡɴᴇʀ\` : ${config.OWNER_NAME}\n` +
                `┗━━━━━━━━━━━━━━━━`;
            const footer = config.BOT_FOOTER;

            await socket.sendMessage(sender, {
                image: { url: config.IMAGE_PATH },
                caption: formatMessage(title, content, footer)
            });
            break;
        }

        // ── JID ──────────────────────────────────────────────────────────────
        case 'jid': {
            await socket.sendMessage(sender, {
                text: `*🆔 Chat JID:* ${sender}`
            });
            break;
        }

        // ── BOOM ─────────────────────────────────────────────────────────────
        case 'boom': {
            if (args.length < 2) {
                return await socket.sendMessage(sender, {
                    text: "📛 *Usage:* `.boom <count> <message>`\n📌 *Example:* `.boom 100 Hello*`"
                });
            }

            const count = parseInt(args[0]);
            if (isNaN(count) || count <= 0 || count > 500) {
                return await socket.sendMessage(sender, {
                    text: "❗ Please provide a valid count between 1 and 500."
                });
            }

            const boomMessage = args.slice(1).join(" ");
            for (let i = 0; i < count; i++) {
                await socket.sendMessage(sender, { text: boomMessage });
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            break;
        }

        // ── SONG ─────────────────────────────────────────────────────────────
        case 'song': {
            try {
                const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();
                const q = text.split(" ").slice(1).join(" ").trim();

                if (!q) {
                    await socket.sendMessage(sender, {
                        text: '*🚫 Please enter a song name to search.*',
                        buttons: [
                            { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                    return;
                }

                const searchResults = await yts(q);
                if (!searchResults.videos.length) {
                    await socket.sendMessage(sender, {
                        text: '*🚩 Result Not Found*',
                        buttons: [
                            { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                    return;
                }

                const video = searchResults.videos[0];
                const apiUrl = `${api}/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=${apikey}`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (!data.status || !data.data?.result) {
                    await socket.sendMessage(sender, {
                        text: '*🚩 Download Error. Please try again later.*',
                        buttons: [
                            { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
                        ]
                    });
                    return;
                }

                const { download } = data.data.result;

                const titleText = '*༊ NOVA MD SONG DOWNLOAD*';
                const content =
                    `┏━━━━━━━━━━━━━━━━\n` +
                    `┃📝 \`Title\` : ${video.title}\n` +
                    `┃📈 \`Views\` : ${video.views}\n` +
                    `┃🕛 \`Duration\` : ${video.timestamp}\n` +
                    `┃🔗 \`URL\` : ${video.url}\n` +
                    `┗━━━━━━━━━━━━━━━━`;
                const footer = config.BOT_FOOTER || '';
                const captionMessage = formatMessage(titleText, content, footer);

                await socket.sendMessage(sender, {
                    image: { url: config.BUTTON_IMAGES.SONG },
                    caption: captionMessage,
                    buttons: [
                        { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 },
                        { buttonId: `${config.PREFIX}alive`, buttonText: { displayText: '🤖 BOT INFO' }, type: 1 }
                    ]
                });

                await socket.sendMessage(sender, {
                    audio: { url: download },
                    mimetype: 'audio/mpeg'
                });

                await socket.sendMessage(sender, {
                    document: { url: download },
                    mimetype: "audio/mpeg",
                    fileName: `${video.title}.mp3`,
                    caption: captionMessage
                });

            } catch (err) {
                console.error(err);
                await socket.sendMessage(sender, {
                    text: '*❌ Internal Error. Please try again later.*',
                    buttons: [
                        { buttonId: `${config.PREFIX}menu`, buttonText: { displayText: '📋 MENU' }, type: 1 }
                    ]
                });
            }
            break;
        }

        // ── NEWS ─────────────────────────────────────────────────────────────
        case 'news': {
            await socket.sendMessage(sender, { text: '📰 Fetching latest news...' });
            const newsItems = await fetchNews(config.NEWS_JSON_URL);
            if (newsItems.length === 0) {
                await socket.sendMessage(sender, {
                    image: { url: config.IMAGE_PATH },
                    caption: formatMessage(
                        '🗂️ NO NEWS AVAILABLE',
                        '❌ No news updates found at the moment. Please try again later.',
                        `${config.BOT_FOOTER}`
                    )
                });
            } else {
                await SendSlide(socket, sender, newsItems.slice(0, 5));
            }
            break;
        }

    } // end switch
}

module.exports = { handleCommand };
