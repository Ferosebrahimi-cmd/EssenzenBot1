
const { load, save } = require("./storage");

const {
    normalizeData,
    participantForMember,
    buildEmbed
} = require("./state");

const VOTE_EMOJIS = ["✅", "❌", "❔"];

async function synchronizeAufstellung(client) {
    try {
        console.log("🔄 Starte Aufstellungs-Sync...");

        const data = normalizeData(load());

        if (!data.messageId || !data.channelId) {
            console.log("⚠️ Keine Aufstellung zum Synchronisieren gefunden");
            return;
        }

        const channel = await client.channels.fetch(data.channelId);

        if (!channel?.isTextBased()) {
            console.log("⚠️ Kanal nicht gefunden");
            return;
        }

        const message = await channel.messages.fetch(data.messageId);

        // Alle Reaktionen von Discord neu laden
        await message.reactions.fetch();

        const votesByUser = new Map();

        for (const emoji of VOTE_EMOJIS) {
            const reaction = message.reactions.cache.find(
                item => item.emoji.name === emoji
            );

            if (!reaction) continue;

            const users = await reaction.users.fetch();

            for (const user of users.values()) {
                if (user.bot) continue;

                if (!votesByUser.has(user.id)) {
                    votesByUser.set(user.id, new Set());
                }

                votesByUser.get(user.id).add(emoji);
            }
        }

        // Alte Abstimmungen vollständig neu aufbauen
        data.dabei = [];
        data.nichtDabei = [];

        let aktiveMitglieder = 0;
        let ehemaligeMitglieder = 0;

        for (const [userId, emojis] of votesByUser) {
            let member;

            try {
                member = await message.guild.members.fetch(userId);
            } catch (error) {
                if (error.code === 10007) {
                    ehemaligeMitglieder++;
                    continue;
                }

                console.error(`❌ Mitglied ${userId} konnte nicht geladen werden:`, error);
                continue;
            }

            const participant = participantForMember(data, member);
            if (!participant) continue;

            aktiveMitglieder++;

            // Nur eine eindeutige Reaktion wird übernommen.
            // Mehrere Reaktionen bedeuten keine Rückmeldung.
            if (emojis.size !== 1) continue;

            const vote = [...emojis][0];

            if (vote === "✅") {
                data.dabei.push(participant.id);
            } else if (vote === "❌") {
                data.nichtDabei.push(participant.id);
            }
        }

        save(data);

        await message.edit({
            embeds: [buildEmbed(data)]
        });

        console.log(`✅ Aufstellung synchronisiert: ${votesByUser.size} Reaktionen geprüft`);
        console.log(`👥 Aktive Mitglieder: ${aktiveMitglieder}`);

        if (ehemaligeMitglieder > 0) {
            console.log(`⏭️ Ehemalige Mitglieder übersprungen: ${ehemaligeMitglieder}`);
        }

    } catch (error) {
        console.error("❌ Aufstellung konnte beim Start nicht abgeglichen werden:", error);
    }
}

module.exports = { synchronizeAufstellung };
