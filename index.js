
require("dotenv").config();

const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const {
    Client,
    GatewayIntentBits,
    Collection,
    Partials,
    Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// =========================
// Module laden
// =========================

const { startScheduler } = require("./Aufstellung/scheduler");
const { startTwitchMonitor } = require("./twitchLive");
const { synchronizeAufstellung } = require("./Aufstellung/syncReactions");

require("./database/database");

// =========================
// Webserver
// =========================

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("✅ EssenzenBot läuft!");
});

app.listen(PORT, () => {
    console.log(`🌐 Webserver läuft auf Port ${PORT}`);
});

// =========================
// Discord Client
// =========================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ],
    ws: {
        compress: false
    }
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
        try {
            const command = require(path.join(commandsPath, file));

            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Command geladen: ${command.data.name}`);
            }
        } catch (error) {
            console.error(`❌ Fehler beim Laden von ${file}:`, error);
        }
    }
}

// =========================
// Events laden
// =========================

const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {
        try {
            const event = require(path.join(eventsPath, file));

            if (event.name && event.execute) {
                client.on(
                    event.name,
                    (...args) => event.execute(...args, client)
                );

                console.log(`📂 Event geladen: ${event.name}`);
            }
        } catch (error) {
            console.error(`❌ Fehler beim Laden des Events ${file}:`, error);
        }
    }
}

// =========================
// Discord Bot bereit
// =========================

client.once(Events.ClientReady, async () => {
    console.log("==============================");
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`📡 Server: ${client.guilds.cache.size}`);
    console.log("🟢 Status: Online");
    console.log("✅ Bot erfolgreich gestartet");
    console.log("==============================");

    client.user.setPresence({
        status: "online",
        activities: [
            {
                name: "Essenzen verwalten",
                type: 0
            }
        ]
    });

    try {
        const synchronisiert = await synchronizeAufstellung(client);

if (synchronisiert) {
    console.log("✅ Aufstellung synchronisiert");
} else {
    console.log("⚠️ Aufstellung konnte nicht synchronisiert werden");
}
    } catch (error) {
        console.error("❌ Fehler bei der Aufstellung:", error);
    }

    try {
        startScheduler(client);
        console.log("✅ Aufstellungs-Scheduler gestartet");
    } catch (error) {
        console.error("❌ Scheduler Fehler:", error);
    }

    try {
        startTwitchMonitor(client);
        console.log("✅ Twitch-Monitor gestartet");
    } catch (error) {
        console.error("❌ Twitch-Monitor Fehler:", error);
    }
});

// =========================
// Slash Commands
// =========================

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`❌ Command nicht gefunden: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error("❌ Fehler beim Ausführen des Commands:", error);

        const antwort = {
            content: "❌ Fehler beim Ausführen.",
            flags: 64
        };

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(antwort);
            } else {
                await interaction.reply(antwort);
            }
        } catch (replyError) {
            console.error("❌ Fehler beim Senden der Fehlermeldung:", replyError);
        }
    }
});

// =========================
// Discord Fehlerprotokoll
// =========================

client.on("error", error => {
    console.error("❌ Discord Client Fehler:", error);
});

client.on("shardError", error => {
    console.error("❌ Discord Gateway Fehler:", error);
});

client.on("shardDisconnect", (event, id) => {
    console.error("🔴 Discord Verbindung getrennt:", id, event.code);
});

client.on("shardReconnecting", id => {
    console.log("🔄 Discord Verbindung wird wiederhergestellt:", id);
});

// =========================
// Discord Login
// =========================

client.login(process.env.TOKEN).catch(error => {
    console.error("❌ Discord Login Fehler:", error);
});
