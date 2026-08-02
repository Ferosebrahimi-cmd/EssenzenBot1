require("dotenv").config();

const express = require("express");
const {
    Client,
    GatewayIntentBits,
    Collection,
    Partials
} = require("discord.js");

const fs = require("fs");
const path = require("path");


// =========================
// Aufstellung Modul
// =========================

const { startScheduler } = require("./Aufstellung/aufstellung/scheduler");


// =========================
// MongoDB verbinden
// =========================

require("./database/database");


// =========================
// Render Webserver
// =========================

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("✅ EssenzenBot läuft!");
});

app.listen(PORT, () => {

    console.log(
        `🌐 Webserver läuft auf Port ${PORT}`
    );

});


// =========================
// Discord Bot
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

    ]

});


// =========================
// Reaction Test
// =========================

client.on("messageReactionAdd", (reaction, user) => {

    console.log(
        "🔥 TEST REACTION:",
        user.tag,
        reaction.emoji.name
    );

});


client.on("raw", packet => {

    if (packet.t === "MESSAGE_REACTION_ADD") {

        console.log(
            "🔥 RAW REACTION EVENT ERHALTEN"
        );

    }

});


// =========================
// Commands laden
// =========================

client.commands = new Collection();

const commandsPath = path.join(
    __dirname,
    "commands"
);


if (fs.existsSync(commandsPath)) {

    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


    for (const file of commandFiles) {

        const command = require(
            path.join(commandsPath, file)
        );


        if (command.data && command.execute) {

            client.commands.set(
                command.data.name,
                command
            );


            console.log(
                `✅ Command geladen: ${command.data.name}`
            );

        }

    }

}


// =========================
// Events laden
// =========================

const eventsPath = path.join(
    __dirname,
    "events"
);


console.log(
    "🔍 Suche Events:",
    eventsPath
);


if (fs.existsSync(eventsPath)) {


    const eventFiles = fs
        .readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));


    console.log(
        "📁 Events:",
        eventFiles
    );


    for (const file of eventFiles) {


        const event = require(
            path.join(eventsPath, file)
        );


        if (event.name && event.execute) {


            client.on(
                event.name,
                (...args) =>
                    event.execute(...args, client)
            );


            console.log(
                `📂 Event geladen: ${event.name}`
            );

        }

    }

}


// =========================
// Bot Online
// =========================

client.once("ready", () => {


    client.user.setPresence({

        status: "online",

        activities: [

            {

                name: "Essenzen verwalten",

                type: 0

            }

        ]

    });


    console.log("==============================");

    console.log(
        `🤖 Bot: ${client.user.tag}`
    );


    console.log(
        `📡 Server: ${client.guilds.cache.size}`
    );


    console.log(
        "🟢 Status: Online"
    );


    console.log(
        "✅ Bot erfolgreich gestartet"
    );


    console.log("==============================");


    startScheduler(client);


});


// =========================
// Slash Commands
// =========================

client.on(
    "interactionCreate",
    async interaction => {


        if (!interaction.isChatInputCommand())
            return;


        const command =
            client.commands.get(
                interaction.commandName
            );


        if (!command)
            return;


        try {

            await command.execute(
                interaction
            );


        } catch (error) {


            console.error(error);


            const antwort = {

                content:
                    "❌ Fehler beim Ausführen.",

                ephemeral: true

            };


            if (
                interaction.replied ||
                interaction.deferred
            ) {


                await interaction.followUp(
                    antwort
                );


            } else {


                await interaction.reply(
                    antwort
                );

            }

        }


    }
);


// =========================
// Discord Login
// =========================

client.login(
    process.env.TOKEN
)
.then(() => {

    console.log(
        "🔑 Discord Login erfolgreich"
    );

})
.catch(error => {

    console.error(
        "❌ Discord Login Fehler:",
        error
    );

});
