
const { load, save } = require("./storage");

const {
    normalizeData,
    participantForMember,
    buildEmbed
} = require("./state");

const config = require("./config");

const VOTE_EMOJIS = ["✅", "❌", "❔"];

async function findCurrentAufstellung(channel, client) {
    const messages = await channel.messages.fetch({ limit: 100 });

    const matches = [...messages.values()]
        .filter(message =>
            message.author.id === client.user.id &&
            message.embeds.some(embed =>
                embed.title === "🔥 Vatos MC Aufstellung"
            )
        )
        .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    return matches[0] || null;
}

async function synchronizeAufstellung(client) {
    try {
        console.log("🔄 Starte Aufstellungs-Sync...");

        const data = normalizeData(load());

        if (!data.channelId) {
            console.log("⚠️ Kein Aufstellungskanal gespeichert");
            return false;
        }

        const channel = await client.channels.fetch(data.channelId);

        if (!channel?.isTextBased() || !channel.messages) {
            console.log("❌ Aufstellungskanal nicht gefunden");
            return false;
        }

        let message = null;

        if (data.messageId) {
            try {
                message = await channel.messages.fetch(data.messageId);
            } catch (error) {
                if (error.code !== 10008) throw error;

                console.log("⚠️ Alte Nachrichten-ID ungültig. Suche aktuelle Aufstellung...");
            }
        }

        if (!message) {
            message = await findCurrentAufstellung(channel, client);
        }

        if (!message) {
            console.log("❌ Keine aktuelle Aufstellung gefunden");
            return false;
        }

        data.messageId = message.id;
        data.channelId = channel.id;

      const description = message.embeds[0]?.description || "";

const dateMatch = description.match(/Datum:\*\*\s*\*\*(.*?)\*\*/);

if (dateMatch) {
    data.datum = dateMatch[1];
}

        const guild = message.guild;

        await guild.members.fetch();

        const role = guild.roles.cache.find(
            r => r.name === config.roleName
        );

        if (!role) {
            console.log("❌ Aufstellungsrolle nicht gefunden");
            return false;
        }

        data.alle = [...role.members.values()].map(member => ({
            id: member.id,
            name: member.displayName
        }));

       

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

        data.dabei = [];
        data.nichtDabei = [];

        for (const [userId, emojis] of votesByUser) {
            const member = guild.members.cache.get(userId);

            if (!member) continue;

            const participant = participantForMember(data, member);

            if (!participant || emojis.size !== 1) continue;

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

        console.log("✅ Aufstellung erfolgreich synchronisiert");
        console.log("🆔 Nachrichten-ID:", message.id);
        console.log("👥 Mitglieder:", data.alle.length);
        console.log("✅ Dabei:", data.dabei.length);
        console.log("❌ Nicht dabei:", data.nichtDabei.length);

        return true;

    } catch (error) {
        console.error("❌ Aufstellung konnte nicht synchronisiert werden:", error);
        return false;
    }
}

module.exports = { synchronizeAufstellung };
