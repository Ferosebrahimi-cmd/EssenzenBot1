require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { Client, GatewayIntentBits, Collection } = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
}

client.once("clientReady", () => {
    console.log(`✅ ${client.user.tag} ist online!`);
});

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);

        await interaction.reply({
            content: "❌ Es ist ein Fehler aufgetreten.",
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);
