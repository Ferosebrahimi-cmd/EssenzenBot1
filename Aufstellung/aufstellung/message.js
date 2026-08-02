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

`📅 **Aufstellung:** ${datum}
🕗 **Uhrzeit:** ${config.meetingHour}


**✅ Dabei:**
Noch niemand


**❌ Keine Rückmeldung:**
Noch keine Auswertung


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


    save({

        messageId:
            message.id,

        channelId:
            channel.id,

        alle:
            mitglieder,

        dabei:[]

    });


    return message;

}


module.exports = {
    sendAufstellung
};
