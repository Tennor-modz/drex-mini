require('dotenv').config();
const chalk = require("chalk");

module.exports = async function handleCommand(command, m, trashcore, body) {
  try {
    const senderNumber = m._senderNumber || m.key?.participant?.split('@')[0] || m.key?.remoteJid?.split('@')[0];
    const botNumber = trashcore.user.id.split(':')[0];
    const isOwner = senderNumber === botNumber || senderNumber === process.env.BOT_OWNER;
    const chatId = m.chat || m.key.remoteJid;
    const args = body.trim().split(/ +/).slice(1);
    const q = args.join(" ").trim();

    console.log(chalk.yellow(`\n🔧 Processing command: ${command}`));
    console.log(chalk.yellow(`Sender: ${senderNumber}, Bot: ${botNumber}, isOwner: ${isOwner}`));

    const reply = async (text) => {
      await trashcore.sendMessage(chatId, { text }, { quoted: m });
    };

    // Simple commands for testing
    switch (command) {
      case "ping":
        await reply("🏓 Pong! Bot is working!");
        console.log(chalk.green("✓ Ping command executed"));
        break;

      case "menu":
        const menuText = `╔════════════════════◇
║『 *HUNTER BOT MENU* 』
║ 
║ ▢ .ping - Check bot
║ ▢ .menu - This menu
║ ▢ .owner - Check owner
║ ▢ .test - Test command
║ 
╚════════════════════╝`;
        await reply(menuText);
        console.log(chalk.green("✓ Menu command executed"));
        break;

      case "owner":
        if (isOwner) {
          await reply("✅ You are the bot owner!");
        } else {
          await reply("❌ Only bot owner can use this!");
        }
        console.log(chalk.green("✓ Owner command executed"));
        break;

      case "test":
        await reply("✅ Test command works!");
        console.log(chalk.green("✓ Test command executed"));
        break;

      default:
        await reply("❓ Unknown command. Try .menu");
        console.log(chalk.red(`Unknown command: ${command}`));
        break;
    }

  } catch (err) {
    console.error(chalk.red("❌ Error in handleCommand:"), err);
  }
};
