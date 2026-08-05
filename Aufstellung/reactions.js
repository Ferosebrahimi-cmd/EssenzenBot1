const { load, save } = require("./storage");
const {
    enqueueUpdate,
    normalizeData,
    participantForMember,
    removeParticipant,
    buildEmbed
} = require("./state");

async function execute(reaction, user) {
    if (user.bot) return;

    return enqueueUpdate(async () => {
        try {
            if (reaction.partial) await reaction.fetch();
            if (reaction.message.partial) await reaction.message.fetch();

            const data = normalizeData(load());
            if (reaction.message.id !== data.messageId) return;

            const member = await reaction.message.guild.members.fetch(user.id);
            const participant = participantForMember(data, member);

            // Nur Mitglieder der gespeicherten Aufstellungsrolle dürfen abstimmen.
            if (!participant) return;

            if (reaction.emoji.name === "✅") {
                data.nichtDabei = removeParticipant(data.nichtDabei, participant);
                if (!data.dabei.includes(participant.id)) {
                    data.dabei.push(participant.id);
                }
            } else if (reaction.emoji.name === "❌") {
                data.dabei = removeParticipant(data.dabei, participant);
                if (!data.nichtDabei.includes(participant.id)) {
                    data.nichtDabei.push(participant.id);
                }
            } else if (reaction.emoji.name === "❔") {
                data.dabei = removeParticipant(data.dabei, participant);
                data.nichtDabei = removeParticipant(data.nichtDabei, participant);
            } else {
                return;
            }

            save(data);
            await reaction.message.edit({ embeds: [buildEmbed(data)] });
            console.log("✅ Aufstellung aktualisiert:", participant.name);
        } catch (error) {
            console.error("❌ Fehler bei Aufstellung-Reaktion:", error);
        }
    });
}

module.exports = { execute };
