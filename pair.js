const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
const path = require('path');
let router = express.Router();
const pino = require('pino');
const chalk = require('chalk');
const {
    default: Mbuvi_Tech,
    useMultiFileAuthState,
    delay,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require('@trashcore/baileys');

// Store active bot instances
const activeBots = new Map();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Function to extract message text (from your code)
function extractText(m) {
    if (!m || !m.message) return null;

    let msg = m.message;
    if (msg.ephemeralMessage?.message)
        msg = msg.ephemeralMessage.message;

    if (msg.viewOnceMessage?.message)
        msg = msg.viewOnceMessage.message;
        
    if (msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const parsed = JSON.parse(
                msg.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
            );
            if (parsed?.id) return parsed.id;
        } catch (e) {
            return null;
        }
    }
    
    if (msg.buttonsResponseMessage?.selectedButtonId)
        return msg.buttonsResponseMessage.selectedButtonId;
    if (msg.listResponseMessage?.singleSelectReply?.selectedRowId)
        return msg.listResponseMessage.singleSelectReply.selectedRowId;
    if (msg.templateButtonReplyMessage?.selectedId)
        return msg.templateButtonReplyMessage.selectedId;
    if (msg.imageMessage?.caption)
        return msg.imageMessage.caption;
    if (msg.videoMessage?.caption)
        return msg.videoMessage.caption;
    if (msg.documentMessage?.caption)
        return msg.documentMessage.caption;
    if (msg.extendedTextMessage?.text)
        return msg.extendedTextMessage.text;
    if (msg.conversation)
        return msg.conversation;

    return null;
}

// Function to get prefix
async function getSetting(key, defaultValue) {
    return defaultValue;
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    const { version } = await fetchLatestBaileysVersion();
    let connectionClosed = false;
    let responseSent = false;
    
    async function Mbuvi_MD_PAIR_CODE() {
        const sessionPath = path.join(__dirname, 'temp', id);
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        let sock = null;
        
        try {
            sock = Mbuvi_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(
                        state.keys,
                        pino({ level: 'silent' }).child({ level: 'silent' })
                    )
                },
                version,
                printQRInTerminal: false,
                logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
                browser: ["Ubuntu", "Opera", "100.0.4815.0"],
                shouldSyncHistoryMessage: true,
                syncFullHistory: true,
                markOnlineOnConnect: true,
                emitOwnEvents: true,
                fireInitQueries: true,
                generateHighQualityLinkPreview: true
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const custom = "TRASHBOT";
                const code = await sock.requestPairingCode(num, custom);
                if (!res.headersSent && !responseSent) {
                    responseSent = true;
                    await res.send({ code, message: 'Bot will start after pairing!' });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            
            // Load command handler dynamically
            let handleCommand;
            try {
                delete require.cache[require.resolve('./xtrash')];
                handleCommand = require('./xtrash');
            } catch (err) {
                console.error('Failed to load command handler:', err);
            }
            
            // Message handler
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                try {
                    if (type !== "notify") return;

                    const m = messages?.[0];
                    if (!m) return;

                    const from = m.key.remoteJid;
                    const sender = m.key.participant || from;
                    const isGroup = from.endsWith("@g.us");

                    if (m.key.fromMe && isGroup) return;

                    const body = extractText(m);

                    if (!body) {
                        console.log("⚪ No text message");
                        return;
                    }

                    const senderNumber = sender.split("@")[0];

                    let location = "Private Chat";
                    if (isGroup) {
                        const groupMeta = await sock.groupMetadata(from).catch(() => ({
                            subject: "Unknown Group"
                        }));
                        location = `Group: ${groupMeta.subject}`;
                    }

                    console.log(chalk.bgGreen.black(`
📩 New message received
Location     : ${location}
Message text : ${body}
Sender jid   : ${sender}
Sender number: ${senderNumber}
Message type : ${type}
                    `));

                    const prefix = await getSetting("prefix", ".");
                    if (!body.startsWith(prefix)) return;

                    const command = body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase();
                    
                    // Add m.chat and other properties that command handler expects
                    m.chat = from;
                    m._senderNumber = senderNumber;
                    
                    if (handleCommand) {
                        await handleCommand(command, m, sock, body);
                    }

                } catch (err) {
                    console.error(chalk.redBright("❌ Error in messages.upsert:"), err?.stack || err);
                }
            });
            
            // Connection update handler
            sock.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connectionClosed) return;
                
                if (connection === 'open') {
                    console.log(chalk.greenBright('✅ Bot connected successfully!'));
                    
                    await delay(2000);
                    
                    try {
                        // Send welcome message
                        const welcomeMsg = `🎉 *Bot Successfully Connected!* 🎉

Your WhatsApp bot is now active and ready to respond to commands.

━━━━━━━━━━━━━━
📝 *Bot Information:*
• Bot is now online
• Use "." prefix for commands
• Type .menu to see all commands
━━━━━━━━━━━━━━

Enjoy using Hunter Bot! 🤖`;
                        
                        await sock.sendMessage(sock.user.id, { text: welcomeMsg });
                        
                        // Try to join support group
                        try {
                            await sock.groupAcceptInvite("HaVizo1mI6S5Wlb1KP8d4E");
                        } catch (e) {
                            console.log("❌ Failed joining group:", e.message);
                        }
                        
                        // Store the bot instance
                        activeBots.set(id, sock);
                        
                        console.log(chalk.greenBright(`✅ Bot ${id} is now active and running commands`));
                        
                    } catch (err) {
                        console.log('Error sending welcome message:', err);
                    }
                    
                } else if (connection === 'close' && !connectionClosed) {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    console.log('Connection closed with status:', statusCode);
                    
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && 
                                           statusCode !== 401;
                    
                    if (shouldReconnect) {
                        console.log(chalk.yellow(`🔄 Bot ${id} disconnected, reconnecting in 10 seconds...`));
                        await delay(10000);
                        Mbuvi_MD_PAIR_CODE();
                    } else {
                        console.log(chalk.red(`❌ Bot ${id} logged out, cleaning up...`));
                        activeBots.delete(id);
                        await removeFile(sessionPath);
                    }
                }
            });
            
            // Handle process signals
            process.on("SIGINT", async () => { 
                try { 
                    await saveCreds(); 
                } catch {} 
                process.exit(0); 
            });
            
            process.on("SIGTERM", async () => { 
                try { 
                    await saveCreds(); 
                } catch {} 
                process.exit(0); 
            });
            
        } catch (err) {
            console.log('Service error:', err);
            connectionClosed = true;
            if (sock) {
                await sock.end();
            }
            activeBots.delete(id);
            await removeFile(sessionPath);
            if (!res.headersSent && !responseSent) {
                responseSent = true;
                await res.send({ error: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Mbuvi_MD_PAIR_CODE();
});

// Add a route to list active bots
router.get('/list', (req, res) => {
    const botList = Array.from(activeBots.entries()).map(([id, sock]) => ({
        id,
        user: sock.user?.id || 'Unknown',
        connected: !!sock.ws
    }));
    res.json({ active_bots: botList });
});

// Add a route to stop a specific bot
router.get('/stop/:id', async (req, res) => {
    const botId = req.params.id;
    const sock = activeBots.get(botId);
    
    if (sock) {
        try {
            await sock.sendMessage(sock.user.id, { text: '🔴 Bot is shutting down...' });
            await delay(1000);
            await sock.end();
            activeBots.delete(botId);
            await removeFile(path.join(__dirname, 'temp', botId));
            res.json({ success: true, message: 'Bot stopped successfully' });
        } catch (error) {
            res.json({ success: false, message: 'Error stopping bot' });
        }
    } else {
        res.json({ success: false, message: 'Bot not found' });
    }
});

module.exports = router;
