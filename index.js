require("dotenv").config();

const express = require("express");
const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");


// =========================
// Render Webserver
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("EssenzenBot läuft!");
});

app.listen(PORT, () => {
    console.log(`Webserver läuft auf Port ${PORT}`);
});



// =========================
// Discord Bot
// =========================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
});



// =========================
// Commands laden
// =========================

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (fs.existsSync(commandsPath)) {

    const commandFiles = fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


    for (const file of commandFiles) {

        const filePath = path.join(commandsPath, file);
        const command = require(filePath);


        if ("data" in command && "execute" in command) {

            client.commands.set(
                command.data.name,
                command
            );

            console.log(`✅ Command geladen: ${command.data.name}`);

        }
    }
}



// =========================
// Interaction Handler
// =========================

client.on("interactionCreate", async interaction => {


    if (!interaction.isChatInputCommand()) return;


    const command = client.commands.get(
        interaction.commandName
    );


    if (!command) return;


    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);


        if (interaction.replied || interaction.deferred) {

            await interaction.followUp({
                content: "❌ Fehler beim Ausführen des Befehls.",
                ephemeral: true
            });

        } else {

            await interaction.reply({
                content: "❌ Fehler beim Ausführen des Befehls.",
                ephemeral: true
            });

        }
    }

});



// =========================
// Bot Start
// =========================

client.once("clientReady", () => {

    console.log(
        `✅ ${client.user.tag} ist online!`
    );

});


client.login(process.env.TOKEN);
