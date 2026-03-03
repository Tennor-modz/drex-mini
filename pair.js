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

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;
    const { version } = await fetchLatestBaileysVersion();
    let connectionClosed = false; // Flag to track if connection is already closed
    
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
                shouldSyncHistoryMessage: false, // Disable history sync
                syncFullHistory: false, // Don't sync full history
                markOnlineOnConnect: false // Don't mark as online
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
            
            sock.ev.on('connection.update', async (s) => {
                const { connection, lastDisconnect } = s;
                
                // If connection is already closed, don't process further
                if (connectionClosed) return;
                
                if (connection === 'open') {
                    await delay(5000);
                    
                    try {
                        let data = fs.readFileSync(__dirname + `/temp/${id}/creds.json`);
                        let b64data = Buffer.from(data).toString('base64');
                        
                        // Send session to user
                        let session = await sock.sendMessage(sock.user.id, { 
                            text: 'trashcore~' + b64data 
                        });

                        let Mbuvi_MD_TEXT = `
        
╔════════════════════◇
║『 SESSION CONNECTED』
║ 🔷 Trashcore Bot
║ 🔷 By Trashcore 
╚════════════════════╝


---

╔════════════════════◇
║『 You've chosen Trashcore Bots』
║ -Set the session ID in Heroku:
║ - SESSION_ID: 
╚════════════════════╝
╔════════════════════◇
║web: www.trashcorex.zone.id
╚═════════════════════╝
𒂀 TRASHBOTS


---

Don't Forget To Give Star⭐ To My Repo
______________________________`;

                        await sock.sendMessage(sock.user.id, { 
                            text: Mbuvi_MD_TEXT 
                        }, { quoted: session });

                        await delay(1000);
                        
                        // Set flag to prevent further processing
                        connectionClosed = true;
                        
                        // Forcefully close the connection
                        if (sock.ws) {
                            sock.ws.close();
                        }
                        
                        // End the socket completely
                        await sock.end();
                        sock = null;
                        
                        // Clean up temp files
                        await removeFile('./temp/' + id);
                        
                    } catch (err) {
                        console.log('Error sending session:', err);
                        connectionClosed = true;
                        if (sock) {
                            await sock.end();
                        }
                        await removeFile('./temp/' + id);
                    }
                    
                } else if (connection === 'close' && !connectionClosed) {
                    // Check if it's not a normal logout
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    const shouldReconnect = statusCode !== DisconnectReason.loggedOut && 
                                           statusCode !== 401 && 
                                           !connectionClosed;
                    
                    if (shouldReconnect) {
                        await delay(10000);
                        Mbuvi_MD_PAIR_CODE();
                    } else {
                        // Clean up if logged out
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
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: 'Service Currently Unavailable' });
            }
        }
    }
    
    return await Mbuvi_MD_PAIR_CODE();
});

module.exports = router;
