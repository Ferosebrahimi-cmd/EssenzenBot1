const {
    EmbedBuilder
} = require("discord.js");

const config =
    require("./config");

const {
    save,
    load
} = require("./storage");

async function sendAufstellung(client) {

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

    // alte Aufstellung löschen

    const alte =
        load();

    if (alte.messageId) {

        try {

            const alteNachricht =
                await channel.messages.fetch(
                    alte.messageId
                );

            await alteNachricht.delete();

            console.log(
                "🗑️ Alte Aufstellung gelöscht"
            );

        } catch {

            console.log(
                "ℹ️ Alte Nachricht nicht gefunden"
            );

        }

    }

    const mitglieder =
        [...role.members.values()]
            .map(
                member =>
                    member.displayName
            );

    console.log(
        "👥 Mitglieder gespeichert:",
        mitglieder.length
    );

    const datum =
        new Date(
            Date.now() + 86400000
        )
            .toLocaleDateString(
                "de-DE"
            );

    const embed =
        new EmbedBuilder()

            .setTitle(
                "🔥 Vatos MC Aufstellung"
            )

            .setDescription(`

📅 **Datum:** ${datum}

🕗 **Uhrzeit:** ${config.meetingHour}

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
        ? mitglieder.map(name => `❔ ${name}`).join("\n")
        : "Keine Mitglieder gefunden"
}

━━━━━━━━━━━━━━

**Reagiere mit:**
✅ = Dabei
❌ = Nicht dabei

`)

            .setColor(
                0xff0000
            );

    const message =
        await channel.send({

            embeds: [
                embed
            ]

        });

    await message.react("✅");
    await message.react("❌");

    save({

        messageId:
            message.id,

        channelId:
            channel.id,

        alle:
            [...mitglieder],

        dabei:
            [],

        nichtDabei:
            []

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
