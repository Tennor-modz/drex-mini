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

// Function to get setting (you can modify this to get from DB or config)
async function getSetting(key, defaultValue) {
    // For now, return default value
    // You can implement database/config storage later
    return defaultValue;
}

// Command handler function with your message extraction logic
async function handleCommands(sock, sender, m) {
    try {
        // Your exact message extraction logic
        const text =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            m.message?.documentMessage?.caption ||
            m.message?.buttonsResponseMessage?.selectedButtonId ||
            m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
            m.message?.templateButtonReplyMessage?.selectedId ||
            "";

        if (!text) return;

        console.log('Received message:', text); // Debug log

        const prefix = await getSetting("prefix", ".");
        if (!text.startsWith(prefix)) return;

        const args = text.slice(prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        console.log('Command detected:', command, args); // Debug log

        // Basic commands
        if (command === 'ping') {
            await sock.sendMessage(sender, { text: '```Pong! 🏓```' });
        }
        
        else if (command === 'menu' || command === 'help') {
            const menuText = `╔════════════════════◇
║『 *TRASHBOT COMMANDS* 』
║ 
║ ▢ *.ping* - Check bot response
║ ▢ *.menu* - Show this menu
║ ▢ *.time* - Show current time
║ ▢ *.info* - Bot information
║ ▢ *.test* - Test if bot works
║ 
║ 🔷 More commands coming soon!
╚════════════════════╝`;
            
            await sock.sendMessage(sender, { text: menuText });
        }
        
        else if (command === 'test') {
            await sock.sendMessage(sender, { text: '✅ Bot is working perfectly!' });
        }
        
        else if (command === 'time') {
            const now = new Date();
            const timeString = now.toLocaleString('en-US', { 
                timeZone: 'Africa/Nairobi',
                dateStyle: 'full',
                timeStyle: 'long'
            });
            await sock.sendMessage(sender, { 
                text: `📅 *Date:* ${timeString}`
            });
        }
        
        else if (command === 'info') {
            const infoText = `🤖 *Trashcore Bot*
⚡ *Version:* 1.0.0
👑 *Owner:* Trashcore
🌐 *Website:* www.trashcorex.zone.id
📱 *Platform:* WhatsApp Bot
⚙️ *Status:* Active`;
            
            await sock.sendMessage(sender, { text: infoText });
        }
        
        // Add more commands here
        
    } catch (error) {
        console.error('Error handling command:', error);
        await sock.sendMessage(sender, { text: '❌ Error executing command' });
    }
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    const { version } = await fetchLatestBaileysVersion();
    let connectionClosed = false;
    let responseSent = false;
    
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
            
            // Message handler with your logic
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                console.log('Message event triggered:', type);
                
                for (const msg of messages) {
                    try {
                        // Skip if no message
                        if (!msg.message) continue;
                        
                        // Get sender
                        const sender = msg.key.remoteJid;
                        
                        // Skip own messages
                        if (msg.key.fromMe) continue;
                        
                        // Skip status broadcasts
                        if (sender === 'status@broadcast') continue;
                        
                        // Handle commands using your logic
                        await handleCommands(sock, sender, msg);
                        
                    } catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            });
            
            // Handle connection updates
            sock.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                
                if (connectionClosed) return;
                
                if (connection === 'open') {
                    console.log('✅ Bot connected successfully!');
                    
                    await delay(2000);
                    
                    try {
                        // Send welcome message
                        const welcomeMsg = `🎉 *Bot Successfully Connected!* 🎉

Your WhatsApp bot is now active and ready to respond to commands.

━━━━━━━━━━━━━━
📝 *Available Commands:*
• *.ping* - Check if bot is online
• *.menu* - Show all commands
• *.time* - Show current time
• *.info* - Bot information
• *.test* - Test bot response

━━━━━━━━━━━━━━
💡 *Prefix:* Use "." before commands
Example: .ping

Enjoy using Trashcore Bot! 🤖`;
                        
                        await sock.sendMessage(sock.user.id, { text: welcomeMsg });
                        
                        // Store the bot instance
                        activeBots.set(id, sock);
                        
                        console.log(`✅ Bot ${id} is now active and running commands`);
                        
                    } catch (err) {
                        console.log('Error sending welcome message:', err);
                    }
                    
                } else if (connection === 'close' && !connectionClosed) {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    console.log('Connection closed with status:', statusCode);
                    
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && 
                                           statusCode !== 401;
                    
                    if (shouldReconnect) {
                        console.log(`🔄 Bot ${id} disconnected, reconnecting in 10 seconds...`);
                        await delay(10000);
                        Mbuvi_MD_PAIR_CODE();
                    } else {
                        console.log(`❌ Bot ${id} logged out, cleaning up...`);
                        activeBots.delete(id);
                        await removeFile('./temp/' + id);
                    }
                }
            });
            
        } catch (err) {
            console.log('Service error:', err);
            connectionClosed = true;
            if (sock) {
                await sock.end();
            }
            activeBots.delete(id);
            await removeFile('./temp/' + id);
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
            await removeFile('./temp/' + botId);
            res.json({ success: true, message: 'Bot stopped successfully' });
        } catch (error) {
            res.json({ success: false, message: 'Error stopping bot' });
        }
    } else {
        res.json({ success: false, message: 'Bot not found' });
    }
});

module.exports = router;
