const {
    EmbedBuilder
} = require("discord.js");

const config = require("./config");
const storage = require("./storage");


async function sendAufstellung(client) {

    const channel = await client.channels.fetch(
        config.channelId
    );


    const guild = channel.guild;


    const role = guild.roles.cache.find(
        r => r.name === config.roleName
    );


    const date = new Date();

    date.setDate(
        date.getDate() + 1
    );


    const datum =
        date.toLocaleDateString(
            "de-DE"
        );


    const members = role
        ? role.members.map(
            member =>
                `❌ ${member.displayName}`
        )
        : [];


    const embed = new EmbedBuilder()

        .setTitle(
            "🔥 Vatos MC Aufstellung"
        )

        .setDescription(

`📅 **Aufstellung:** ${datum}
🕗 **Uhrzeit:** ${config.meetingHour}

Reagiere mit ✅ wenn du dabei bist.

**Teilnehmer:**
${members.length ? members.join("\n") : "Noch keine Rückmeldungen"}

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


    storage.save({

        messageId:
            message.id,

        channelId:
            channel.id,

        dabei: []

    });


    return message;

}


module.exports = {

    sendAufstellung

};
