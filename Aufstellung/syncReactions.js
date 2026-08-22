const { load, save } = require("./storage");

const {
    normalizeData,
    participantForMember,
    isSelected,
    buildEmbed
} = require("./state");

const VOTE_EMOJIS = ["✅", "❌", "❔"];


function chooseVote(emojis, data, participant) {

    if (emojis.size === 1) {
        return [...emojis][0];
    }

    // Alte Auswahl behalten, falls mehrere Reaktionen vorhanden sind
    if (
        isSelected(data.dabei, participant) &&
        emojis.has("✅")
    ) {
        return "✅";
    }

    if (
        isSelected(data.nichtDabei, participant) &&
        emojis.has("❌")
    ) {
        return "❌";
    }

    if (emojis.has("❔")) {
        return "❔";
    }

    if (emojis.has("❌")) {
        return "❌";
    }

    return "✅";
}


async function synchronizeAufstellung(client) {

    try {

        console.log("🔄 Starte Aufstellungs-Sync...");


        const data =
            normalizeData(load());


        console.log(
            "🔎 Gespeicherte Aufstellung:",
            data.messageId,
            data.channelId
        );


        if (!data.messageId || !data.channelId) {

            console.log(
                "⚠️ Keine Aufstellung zum Synchronisieren gefunden"
            );

            return;
        }


        const channel =
            await client.channels.fetch(
                data.channelId
            );


        if (!channel?.isTextBased()) {

            console.log(
                "⚠️ Kanal nicht gefunden"
            );

            return;
        }


        const message =
            await channel.messages.fetch(
                data.messageId
            );


        // =========================
        // Reaktionen laden
        // =========================

        const votesByUser =
            new Map();


        for (const emoji of VOTE_EMOJIS) {

            const reaction =
                message.reactions.cache.find(
                    item =>
                        item.emoji.name === emoji
                );


            if (!reaction) continue;


            const users =
                await reaction.users.fetch();


            for (const user of users.values()) {

                // Bots ignorieren
                if (user.bot) continue;


                if (!votesByUser.has(user.id)) {

                    votesByUser.set(
                        user.id,
                        new Set()
                    );

                }


                votesByUser
                    .get(user.id)
                    .add(emoji);

            }

        }


        // =========================
        // Alte Daten merken
        // =========================

        const previousData = {

            ...data,

            dabei: data.dabei,

            nichtDabei: data.nichtDabei

        };


        data.dabei = [];
        data.nichtDabei = [];


        // =========================
        // Reaktionen auswerten
        // =========================

        let aktiveMitglieder = 0;
        let ehemaligeMitglieder = 0;


        for (const [userId, emojis] of votesByUser) {

            let member;


            try {

                member =
                    await message.guild.members.fetch(
                        userId
                    );

            } catch (error) {

                // User ist nicht mehr auf dem Server
                if (error.code === 10007) {

                    console.log(
                        `⏭️ Ehemaliges Mitglied übersprungen: ${userId}`
                    );

                    ehemaligeMitglieder++;

                    continue;
                }


                // Andere Fehler weiterhin anzeigen
                console.error(
                    `❌ Fehler beim Laden von Mitglied ${userId}:`,
                    error
                );

                continue;
            }


            const participant =
                participantForMember(
                    data,
                    member
                );


            if (!participant) continue;


            aktiveMitglieder++;


            const vote =
                chooseVote(
                    emojis,
                    previousData,
                    participant
                );


            if (vote === "✅") {

                data.dabei.push(
                    participant.id
                );

            }


            if (vote === "❌") {

                data.nichtDabei.push(
                    participant.id
                );

            }

        }


        // =========================
        // Daten speichern
        // =========================

        save(data);


        // =========================
        // Embed aktualisieren
        // =========================

        await message.edit({

            embeds: [
                buildEmbed(data)
            ]

        });


        console.log(
            `🔄 Aufstellung abgeglichen: ${votesByUser.size} Reaktionen geprüft`
        );


        console.log(
            `👥 Aktive Mitglieder: ${aktiveMitglieder}`
        );


        if (ehemaligeMitglieder > 0) {

            console.log(
                `⏭️ Ehemalige Mitglieder übersprungen: ${ehemaligeMitglieder}`
            );

        }


    } catch (error) {

        console.error(
            "❌ Aufstellung konnte beim Start nicht abgeglichen werden:",
            error
        );

    }

}


module.exports = {
    synchronizeAufstellung
};