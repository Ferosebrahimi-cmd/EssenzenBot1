const {
    EmbedBuilder
} = require("discord.js");

const config = require("./config");

const {
    save
} = require("./storage");


async function sendAufstellung(client) {


    const channel =
        await client.channels.fetch(
            config.channelId
        );


    const guild =
        channel.guild;



    const role =
        guild.roles.cache.find(
            r => r.name === config.roleName
        );



    const datum =
        new Date(
            Date.now() + 86400000
        ).toLocaleDateString(
            "de-DE"
        );



    const mitglieder =
        role
        ? role.members.map(
            m => m.displayName
        )
        : [];



    const embed =
        new EmbedBuilder()

        .setTitle(
            "🔥 Vatos MC Aufstellung"
        )

        .setDescription(

`📅 **Datum:** ${datum}
🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei:**

Niemand



━━━━━━━━━━━━━━


**❌ Keine Rückmeldung:**

${
mitglieder.length
?
mitglieder.map(
name =>
`❌ ${name}`
).join("\n")
:
"Keine Mitglieder gefunden"
}

`

        )

        .setColor(
            0xff0000
        );



    const message =
        await channel.send({

            content:
            role
            ? `<@&${role.id}>`
            : "",

            embeds:[
                embed
            ]

        });



    await message.react("✅");
    await message.react("❌");



    // WICHTIG:
    // komplette neue Aufstellung speichern
    // alte Daten werden überschrieben

    save({

        messageId:
            message.id,

        channelId:
            channel.id,


        alle:
            mitglieder,


        dabei:
            []

    });



    console.log(
        "🔄 Neue Aufstellung gespeichert - alte Daten gelöscht"
    );



    return message;

}



module.exports = {
    sendAufstellung
};
