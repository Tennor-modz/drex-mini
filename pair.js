const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require('pino');
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

// Command handler function
async function handleCommands(sock, sender, message) {
    const msgText = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || 
                    message.message?.imageMessage?.caption || '';
    
    if (!msgText) return;
    
    const prefix = '!'; // You can change this to any prefix you want
    if (!msgText.startsWith(prefix)) return;
    
    const args = msgText.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    // Basic commands
    if (command === 'ping') {
        await sock.sendMessage(sender, { text: 'Pong! 🏓' });
    }
    
    else if (command === 'menu' || command === 'help') {
        const menuText = `
╔════════════════════◇
║『 TRASHBOT COMMANDS 』
║ 
║ 🔷 !ping - Check bot response
║ 🔷 !menu - Show this menu
║ 🔷 !time - Show current time
║ 🔷 !sticker - Make sticker from image (reply to image)
║ 🔷 !info - Bot info
║ 
║ 🔷 More commands coming soon!
╚════════════════════╝
        `;
        await sock.sendMessage(sender, { text: menuText });
    }
    
    else if (command === 'time') {
        const now = new Date();
        await sock.sendMessage(sender, { 
            text: `Current time: ${now.toLocaleString()}` 
        });
    }
    
    else if (command === 'info') {
        const infoText = `
🤖 *Trashcore Bot*
⚡ Version: 1.0.0
👑 Owner: Trashcore
🌐 Website: www.trashcorex.zone.id
        `;
        await sock.sendMessage(sender, { text: infoText });
    }
    
    else if (command === 'sticker') {
        // Check if it's a reply to an image
        if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = message.message.extendedTextMessage.contextInfo.quotedMessage;
            if (quoted.imageMessage) {
                const imageMsg = await sock.downloadMediaMessage({
                    key: message.message.extendedTextMessage.contextInfo.stanzaId,
                    message: quoted
                });
                
                await sock.sendMessage(sender, { 
                    sticker: imageMsg,
                    mimetype: 'image/png'
                });
            }
        }
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    const { version } = await fetchLatestBaileysVersion();
    let connectionClosed = false;
    
    async function Mbuvi_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
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
                shouldSyncHistoryMessage: true, // Enable history sync for commands
                syncFullHistory: true, // Sync full history
                markOnlineOnConnect: true // Mark as online
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const custom = "TRASHBOT";
                const code = await sock.requestPairingCode(num, custom);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            
            // Message handler
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return;
                
                const msg = messages[0];
                if (!msg.message) return;
                
                const sender = msg.key.remoteJid;
                
                // Ignore own messages
                if (msg.key.fromMe) return;
                
                // Handle commands
                await handleCommands(sock, sender, msg);
            });
            
            sock.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connectionClosed) return;
                
                if (connection === 'open') {
                    await delay(2000);
                    
                    try {
                        // Send welcome message
                        const welcomeMsg = `
🎉 *Bot Successfully Connected!* 🎉

Your WhatsApp bot is now active and ready to respond to commands.

📝 *Commands:*
• !ping - Check if bot is online
• !menu - Show all commands
• !time - Show current time
• !info - Bot information

Enjoy using Trashcore Bot! 🤖
                        `;
                        
                        await sock.sendMessage(sock.user.id, { text: welcomeMsg });
                        
                        // Store the bot instance
                        activeBots.set(id, sock);
                        
                        console.log(`Bot ${id} is now active and running commands`);
                        
                        // Don't close the connection - keep bot running
                        
                    } catch (err) {
                        console.log('Error sending welcome message:', err);
                    }
                    
                } else if (connection === 'close' && !connectionClosed) {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && 
                                           statusCode !== 401;
                    
                    if (shouldReconnect) {
                        console.log(`Bot ${id} disconnected, reconnecting...`);
                        await delay(10000);
                        Mbuvi_MD_PAIR_CODE();
                    } else {
                        console.log(`Bot ${id} logged out, cleaning up...`);
                        activeBots.delete(id);
                        await removeFile('./temp/' + id);
                    }
                }
            });
            
        } catch (err) {
            console.log('Service restarted:', err);
            connectionClosed = true;
            if (sock) {
                await sock.end();
            }
            activeBots.delete(id);
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Mbuvi_MD_PAIR_CODE();
});

// Add a route to list active bots (optional)
router.get('/list', (req, res) => {
    const botList = Array.from(activeBots.keys());
    res.json({ active_bots: botList });
});

// Add a route to stop a specific bot (optional)
router.get('/stop/:id', async (req, res) => {
    const botId = req.params.id;
    const sock = activeBots.get(botId);
    
    if (sock) {
        await sock.end();
        activeBots.delete(botId);
        await removeFile('./temp/' + botId);
        res.json({ success: true, message: 'Bot stopped successfully' });
    } else {
        res.json({ success: false, message: 'Bot not found' });
    }
});

module.exports = router;
