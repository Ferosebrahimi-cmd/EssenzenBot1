const {
    EmbedBuilder
} = require("discord.js");

const config = require("./config");


async function getStatus(client, guild) {

    const role =
        guild.roles.cache.find(
            r => r.name === config.roleName
        );


    if (!role) {

        return {
            dabei: [],
            nichtDabei: [],
            unsicher: [],
            offen: []
        };

    }


    const members =
        role.members;


    return {

        dabei: [],
        nichtDabei: [],
        unsicher: [],

        offen:
            members.map(
                member => member.user.username
            )

    };

}



function createEmbed(status) {


    const tomorrow =
        new Date();


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const datum =
        tomorrow.toLocaleDateString(
            "de-DE"
        );



    return new EmbedBuilder()

        .setTitle(
            "📋 Aufstellung"
        )

        .setDescription(

`📅 Aufstellungsdatum: ${datum}
🕗 Uhrzeit: ${config.meetingHour}

━━━━━━━━━━━━━━

✅ Dabei (${status.dabei.length})
${status.dabei.join("\n") || "-"}

━━━━━━━━━━━━━━

❌ Nicht dabei (${status.nichtDabei.length})
${status.nichtDabei.join("\n") || "-"}

━━━━━━━━━━━━━━

❓ Unsicher (${status.unsicher.length})
${status.unsicher.join("\n") || "-"}

━━━━━━━━━━━━━━

⏳ Keine Rückmeldung (${status.offen.length})
${status.offen.join("\n") || "-"}`

        );

}



async function sendAufstellung(client) {


    const channel =
        await client.channels.fetch(
            config.channelId
        );


    const guild =
        channel.guild;



    const status =
        await getStatus(
            client,
            guild
        );



    const embed =
        createEmbed(
            status
        );



    const message =
        await channel.send({

            embeds: [
                embed
            ]

        });



    await message.react("✅");
    await message.react("❌");
    await message.react("❓");



    return message;

}



module.exports = {

    sendAufstellung,
    createEmbed,
    getStatus

};
