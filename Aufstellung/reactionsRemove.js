const { load, save } = require("./storage");
const {
    enqueueUpdate,
    normalizeData,
    participantForMember,
    isSelected,
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
            if (!participant) return;

            // Nur die Auswahl entfernen, deren Emoji tatsächlich gelöscht wurde.
            if (reaction.emoji.name === "✅" && isSelected(data.dabei, participant)) {
                data.dabei = removeParticipant(data.dabei, participant);
            } else if (reaction.emoji.name === "❌" && isSelected(data.nichtDabei, participant)) {
                data.nichtDabei = removeParticipant(data.nichtDabei, participant);
            } else if (reaction.emoji.name !== "❔") {
                return;
            }

            save(data);
            await reaction.message.edit({ embeds: [buildEmbed(data)] });
            console.log("↩️ Reaktion entfernt:", participant.name);
        } catch (error) {
            console.error("❌ Fehler beim Entfernen einer Aufstellungs-Reaktion:", error);
        }
    });
}

module.exports = { execute };
