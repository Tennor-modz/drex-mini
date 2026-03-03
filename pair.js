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
    DisconnectReason
} = require('@trashcore/baileys');

// Store active bot instances
const activeBots = new Map();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Function to extract message text
function extractText(m) {
    if (!m || !m.message) return null;

    let msg = m.message;
    if (msg.ephemeralMessage?.message)
        msg = msg.ephemeralMessage.message;
    if (msg.viewOnceMessage?.message)
        msg = msg.viewOnceMessage.message;
        
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
                markOnlineOnConnect: true
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
            
            // Message handler
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                try {
                    if (type !== "notify") return;

                    for (const msg of messages) {
                        if (!msg.message) continue;
                        
                        // Skip own messages
                        if (msg.key.fromMe) continue;
                        
                        const from = msg.key.remoteJid;
                        const sender = msg.key.participant || from;
                        const senderNumber = sender.split('@')[0];
                        const body = extractText(msg);
                        
                        if (!body) continue;
                        
                        console.log(chalk.green(`\n📩 Message from ${senderNumber}: ${body}`));
                        
                        // Check for prefix
                        if (!body.startsWith('.')) continue;
                        
                        const command = body.slice(1).trim().split(/\s+/)[0].toLowerCase();
                        console.log(chalk.blue(`Command detected: ${command}`));
                        
                        // Add required properties to msg
                        msg.chat = from;
                        msg._senderNumber = senderNumber;
                        msg.sender = sender;
                        
                        // Load command handler
                        try {
                            delete require.cache[require.resolve('./xtrash')];
                            const handleCommand = require('./xtrash');
                            await handleCommand(command, msg, sock, body);
                        } catch (err) {
                            console.error(chalk.red('Command handler error:'), err);
                        }
                    }
                } catch (err) {
                    console.error(chalk.red("❌ Error in messages.upsert:"), err);
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

Your WhatsApp bot is now active!

━━━━━━━━━━━━━━
📝 *Commands:*
• .ping - Check bot response
• .menu - Show all commands
• .owner - Check if you're owner
━━━━━━━━━━━━━━

Use "." before commands!`;
                        
                        await sock.sendMessage(sock.user.id, { text: welcomeMsg });
                        
                        // Store the bot instance
                        activeBots.set(id, sock);
                        
                        console.log(chalk.greenBright(`✅ Bot ${id} is now active`));
                        
                    } catch (err) {
                        console.log('Error sending welcome message:', err);
                    }
                    
                } else if (connection === 'close' && !connectionClosed) {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && 
                                           statusCode !== 401;
                    
                    if (shouldReconnect) {
                        console.log(chalk.yellow(`🔄 Bot ${id} disconnected, reconnecting...`));
                        await delay(10000);
                        Mbuvi_MD_PAIR_CODE();
                    } else {
                        console.log(chalk.red(`❌ Bot ${id} logged out`));
                        activeBots.delete(id);
                        await removeFile(sessionPath);
                    }
                }
            });
            
        } catch (err) {
            console.log('Service error:', err);
            connectionClosed = true;
            if (sock) await sock?.end();
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

module.exports = router;
