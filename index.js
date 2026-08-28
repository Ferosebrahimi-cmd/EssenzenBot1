require("dotenv").config();

const dns = require("node:dns");
dns.setDefaultResultOrder("ipv4first");

console.log("🟢 Node Version:", process.version);

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

const { startScheduler } = require("./Aufstellung/scheduler");
const { synchronizeAufstellung } = require("./Aufstellung/syncReactions");



require("./database/database");


const app = express();

const PORT = process.env.PORT || 3000;


app.get("/", (req, res) => {
    res.send("✅ EssenzenBot läuft!");
});


app.listen(PORT, () => {
    console.log(`🌐 Webserver läuft auf Port ${PORT}`);
});



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


client.commands = new Collection();



const commandsPath = path.join(__dirname, "commands");


if (fs.existsSync(commandsPath)) {

    const commandFiles =
        fs.readdirSync(commandsPath)
        .filter(file => file.endsWith(".js"));


    for (const file of commandFiles) {

        const command =
            require(path.join(commandsPath, file));


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




const eventsPath = path.join(__dirname, "events");


console.log(
    "🔍 Suche Events:",
    eventsPath
);



if (fs.existsSync(eventsPath)) {


    const eventFiles =
        fs.readdirSync(eventsPath)
        .filter(file => file.endsWith(".js"));


    console.log(
        "📁 Events:",
        eventFiles
    );



    for (const file of eventFiles) {


        const event =
            require(path.join(eventsPath, file));


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





client.once(Events.ClientReady, async () => {


    try {


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



        await synchronizeAufstellung(client);



        

     



        // täglicher Aufstellungs-Scheduler

        startScheduler(client);



    } catch (error) {


        console.error(
            "❌ Fehler beim Starten der Aufstellung:",
            error
        );


    }


});






client.on(
    "interactionCreate",
    async interaction => {

        if (!interaction.isChatInputCommand()) return;
console.log(
    `💬 Command empfangen: /${interaction.commandName} ${interaction.options.getSubcommand()}`
);
        const command =
            client.commands.get(
                interaction.commandName
            );

        if (!command) return;

        try {

            await command.execute(interaction);

        } catch (error) {

            console.error(
                "❌ Fehler beim Ausführen:",
                error
            );

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({
                        content: "❌ Fehler beim Ausführen.",
                        flags: 64
                    });

                } else {

                    await interaction.reply({
                        content: "❌ Fehler beim Ausführen.",
                        flags: 64
                    });

                }

            } catch (replyError) {

                console.error(
                    "❌ Fehler beim Senden der Fehlermeldung:",
                    replyError
                );

            }

        }

    }
);


console.log("🔎 Discord Login wird gestartet...");

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