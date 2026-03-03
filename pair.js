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

// Function to extract message text properly
function getMessageText(message) {
    if (!message) return '';
    
    // Try different message types
    if (message.conversation) {
        return message.conversation;
    } else if (message.extendedTextMessage?.text) {
        return message.extendedTextMessage.text;
    } else if (message.imageMessage?.caption) {
        return message.imageMessage.caption;
    } else if (message.videoMessage?.caption) {
        return message.videoMessage.caption;
    } else if (message.documentMessage?.caption) {
        return message.documentMessage.caption;
    } else if (message.buttonsResponseMessage?.selectedButtonId) {
        return message.buttonsResponseMessage.selectedButtonId;
    } else if (message.listResponseMessage?.singleSelectReply?.selectedRowId) {
        return message.listResponseMessage.singleSelectReply.selectedRowId;
    } else if (message.templateButtonReplyMessage?.selectedId) {
        return message.templateButtonReplyMessage.selectedId;
    }
    
    return '';
}

// Command handler function
async function handleCommands(sock, sender, msg, messageContent) {
    const msgText = getMessageText(messageContent);
    
    console.log('Received message:', msgText); // Debug log
    
    if (!msgText) return;
    
    const prefix = '.'; // Changed to dot prefix, you can use '!' or any other
    if (!msgText.startsWith(prefix)) return;
    
    const args = msgText.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    console.log('Command detected:', command, args); // Debug log
    
    try {
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
                // Add these options for better message handling
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
            
            // Better message handler
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                console.log('Message event triggered:', type); // Debug log
                
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
                        
                        console.log('Processing message from:', sender);
                        
                        // Handle commands
                        await handleCommands(sock, sender, msg, msg.message);
                        
                    } catch (error) {
                        console.error('Error processing message:', error);
                    }
                }
            });
            
            // Handle message updates (like edits)
            sock.ev.on('messages.update', async (updates) => {
                for (const update of updates) {
                    if (update.update?.message) {
                        console.log('Message updated:', update.key.id);
                    }
                }
            });
            
            // Handle presence updates
            sock.ev.on('presence.update', (update) => {
                // Optional: handle presence
            });
            
            // Handle group participants updates
            sock.ev.on('group-participants.update', (update) => {
                console.log('Group participants update:', update);
            });
            
            sock.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect, qr } = s;
                
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
