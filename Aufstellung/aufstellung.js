const {
    EmbedBuilder
} = require("discord.js");

const config = require("./config");

const {
    save,
    load
} = require("./storage");

async function sendAufstellung(client, heute = false) {

    console.log("📋 Erstelle neue Aufstellung...");


    let datum;


    if (heute) {

        datum =
            new Date().toLocaleDateString(
                "de-DE"
            );

    } else {

        const morgen = new Date();

        morgen.setDate(
            morgen.getDate() + 1
        );

        datum =
            morgen.toLocaleDateString(
                "de-DE"
            );

    }


    const channel =
        await client.channels.fetch(
            config.channelId
        );


    const guild =
        channel.guild;


    await guild.members.fetch();


    const role =
        guild.roles.cache.find(
            r =>
            r.name === config.roleName
        );


    if (!role) {

        console.log(
            "❌ Rolle nicht gefunden:",
            config.roleName
        );

        return null;

    }


    // Alte Aufstellung löschen

    const alte = load();


    if (alte.messageId) {

        try {

            const alteNachricht =
                await channel.messages.fetch(
                    alte.messageId
                );

            await alteNachricht.delete();


        } catch {

            console.log(
                "ℹ️ Alte Nachricht nicht gefunden"
            );

        }

    }



    // Mitglieder holen

    const mitglieder =
        [...role.members.values()]
        .map(
            member =>
            member.displayName
        );






    const embed =
        new EmbedBuilder()

        .setTitle(
            "🔥 Vatos MC Aufstellung"
        )

        .setDescription(

`
📅 **Datum:** **${datum}**

🕗 **Uhrzeit:** **${config.meetingHour}**

━━━━━━━━━━━━━━


**✅ Dabei (0)**

Noch niemand


━━━━━━━━━━━━━━


**❌ Nicht dabei (0)**

Noch niemand


━━━━━━━━━━━━━━


**❔ Keine Rückmeldung (${mitglieder.length})**

${
mitglieder.length
?
mitglieder.map(
name =>
`❔ **${name}**`
).join("\n")
:
"Niemand"
}


━━━━━━━━━━━━━━


Reagiere mit:

✅ = Dabei

❌ = Nicht dabei

❔ = Keine Rückmeldung

`

        )

        .setColor(
            0xff0000
        );



const message =
    await channel.send({

        content:
            `<@&${role.id}>`,

        embeds: [
            embed
        ],

        allowedMentions: {
            roles: [
                role.id
            ]
        }

    });



    await message.react("✅");
    await message.react("❌");
    await message.react("❔");



  save({

    messageId: message.id,

    channelId: channel.id,

    datum: datum,

    alle: [...mitglieder],

    dabei: [],

    nichtDabei: []

});



    console.log(
        "💾 Aufstellung gespeichert:",
        mitglieder.length,
        "Mitglieder"
    );


    return message;

}


module.exports = {

    sendAufstellung

};
