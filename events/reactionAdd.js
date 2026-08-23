const { Events } = require("discord.js");
const { execute: handleReaction } = require("../Aufstellung/reactions");
const { synchronizeAufstellung } = require("../Aufstellung/syncReactions");

module.exports = {
    name: Events.MessageReactionAdd,

    async execute(reaction, user, client) {
        if (user.bot) return;

        try {
            if (reaction.partial) {
                await reaction.fetch();
            }

            if (reaction.message.partial) {
                await reaction.message.fetch();
            }

            console.log(
                `🔥 Reaktion erkannt: ${reaction.emoji.name} von ${user.tag}`
            );

            await handleReaction(reaction, user);
            await synchronizeAufstellung(client);
        } catch (error) {
            console.error("❌ Fehler bei der Reaktionsverarbeitung:", error);
        }
    }
};