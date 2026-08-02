require("dotenv").config();

const express = require("express");

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const { startScheduler } = require("./aufstellung/scheduler");
const aufstellungReaction = require("./aufstellung/reactions");


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

    ]

});


// =========================
// Commands laden
// =========================

client.commands = new Collection();


const commandsPath =
    path.join(__dirname, "commands");


if (fs.existsSync(commandsPath)) {


    const commandFiles =
        fs.readdirSync(commandsPath)
        .filter(file =>
            file.endsWith(".js")
        );


    for (const file of commandFiles) {


        const command =
            require(
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

const eventsPath =
    path.join(__dirname, "events");


console.log(
    "🔍 Suche Events:",
    eventsPath
);


if (fs.existsSync(eventsPath)) {


    const eventFiles =
        fs.readdirSync(eventsPath)
        .filter(file =>
            file.endsWith(".js")
        );


    console.log(
        "📁 Events:",
        eventFiles
    );


    for (const file of eventFiles) {


        const event =
            require(
                path.join(eventsPath, file)
            );


        if (event.name && event.execute) {


            client.on(
                event.name,
                (...args) =>
                    event.execute(
                        ...args,
                        client
                    )
            );


            console.log(
                `📂 Event geladen: ${event.name}`
            );


        }


    }


}


// =========================
// Aufstellung Reaktionen
// =========================

client.on(

    aufstellungReaction.name,

    (...args) =>
        aufstellungReaction.execute(
            ...args,
            client
        )

);


console.log(
    "📋 Aufstellung Reaktionen geladen"
);



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


    // Aufstellung starten

    startScheduler(client);


    console.log(
        "⏰ Aufstellung Scheduler gestartet"
    );


    console.log("==============================");


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


        } catch(error) {


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

client.login(process.env.TOKEN)

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
