const {
    EmbedBuilder
} = require("discord.js");

const config = require("./config");

const {
    load
} = require("./storage");


async function updateAufstellungDatum(client) {

    console.log("📅 Ändere Aufstellungsdatum...");


    const daten = load();


    if (!daten.messageId) {

        console.log(
            "❌ Keine gespeicherte Aufstellung gefunden"
        );

        return;

    }


    const channel =
        await client.channels.fetch(
            config.channelId
        );


    let message;


    try {

        message =
            await channel.messages.fetch(
                daten.messageId
            );


    } catch {

        console.log(
            "❌ Aufstellungs-Nachricht nicht gefunden"
        );

        return;

    }



    const alterEmbed =
        message.embeds[0];


    if (!alterEmbed) {

        console.log(
            "❌ Kein Embed gefunden"
        );

        return;

    }



    const embed =
        EmbedBuilder.from(
            alterEmbed
        );



    const neueBeschreibung =
        alterEmbed.description.replace(
            /\*\*\d{2}\.\d{2}\.\d{4}\*\*/,
            "**06.08.2026**"
        );



    embed.setDescription(
        neueBeschreibung
    );



    await message.edit({

        embeds: [
            embed
        ]

    });



    console.log(
        "✅ Aufstellung wurde auf 06.08.2026 geändert"
    );

}



module.exports = {
    updateAufstellungDatum
};
