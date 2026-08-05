const { load, save } = require("./storage");
const {
    normalizeData,
    participantForMember,
    isSelected,
    buildEmbed
} = require("./state");

const VOTE_EMOJIS = ["✅", "❌", "❔"];

function chooseVote(emojis, data, participant) {
    if (emojis.size === 1) return [...emojis][0];

    // Falls eine Person mehrere alte Emojis stehen hat, wird ihre zuletzt
    // gespeicherte Auswahl beibehalten. Dadurch geht kein gültiger Status
    // beim Neustart verloren.
    if (isSelected(data.dabei, participant) && emojis.has("✅")) return "✅";
    if (isSelected(data.nichtDabei, participant) && emojis.has("❌")) return "❌";

    if (emojis.has("❔")) return "❔";
    if (emojis.has("❌")) return "❌";
    return "✅";
}

async function synchronizeAufstellung(client) {
    try {
        const data = normalizeData(load());
        if (!data.messageId || !data.channelId) return;

        const channel = await client.channels.fetch(data.channelId);
        if (!channel?.isTextBased()) return;

        const message = await channel.messages.fetch(data.messageId);
        const votesByUser = new Map();

        for (const emoji of VOTE_EMOJIS) {
            const reaction = message.reactions.cache.find(item => item.emoji.name === emoji);
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

        const previousDabei = data.dabei;
        const previousNichtDabei = data.nichtDabei;
        const previousData = {
            ...data,
            dabei: previousDabei,
            nichtDabei: previousNichtDabei
        };

        data.dabei = [];
        data.nichtDabei = [];

        for (const [userId, emojis] of votesByUser) {
            const member = await message.guild.members.fetch(userId);
            const participant = participantForMember(data, member);
            if (!participant) continue;

            const vote = chooseVote(emojis, previousData, participant);

            if (vote === "✅") data.dabei.push(participant.id);
            if (vote === "❌") data.nichtDabei.push(participant.id);
        }

        save(data);
        await message.edit({ embeds: [buildEmbed(data)] });
        console.log(`🔄 Aufstellung abgeglichen: ${votesByUser.size} Reaktionen geprüft`);
    } catch (error) {
        console.error("❌ Aufstellung konnte beim Start nicht abgeglichen werden:", error);
    }
}

module.exports = { synchronizeAufstellung };
