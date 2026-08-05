require("dotenv").config();

const { REST, Routes } = require("discord.js");

const essenzen = require("./commands/essenzen");
const aufstellung = require("./commands/aufstellung");


const commands = [
    essenzen.data.toJSON(),
    aufstellung.data.toJSON()
];


const rest = new REST({ version: "10" })
    .setToken(process.env.TOKEN);


(async () => {

    try {

        console.log("Registriere Slash-Commands...");


        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );


        console.log("✅ Befehle aktualisiert!");


    } catch (error) {

        console.error(
            "❌ Fehler beim Registrieren:",
            error
        );

    }

})();