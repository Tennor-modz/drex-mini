const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ai",
    alias: ["gpt", "gemini"],
    desc: "Chat with Yupra GPT-5 AI",
    category: "ai",
    react: "☺️",
    filename: __filename
},
async (conn, mek, m, { q, reply, react }) => {
    try {
        if (!q) {
            return reply("*AP KE PAS KOI SAWAL HAI 🤔 AUR APKO USKA JAWAB NAHI MIL RAHA 😢*\n*TO AP ESE LIKHO 🤗*\n\n*.AI ❮APKA SAWAL❯*\n*.GPT ❮APKA SAWAL❯*\n*.GEMINI ❮APKA SAWAL❯*\n\n*JAB AP ESE LIKHO GE 🤗 TO APKE SAWAL KA JAWAB BATA DIYA JAYE GA 😍♥️*");
        }

        const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(q)}`;

        const { data } = await axios.get(apiUrl, {
            timeout: 30000
        });

        console.log("YUPRA RAW:", data);

        if (!data || !data.result) {
            await react("😔");
            return reply("*APKE SAWAL KA JAWAB NAHI MILA SORRY 😔*.");
        }

        await reply(`*👑 BILAL-MD INTELLIGENCE 👑*\n\n${data.result}`);
        await react("😍");

    } catch (err) {
        console.error("*APKE SAWAL KA JAWAB NAHI MILA SORRY G 😔*:", err);
        await react("😔");
        reply("FAILED.....");
    }
});
