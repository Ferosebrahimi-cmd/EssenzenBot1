const { Events } = require("discord.js");
const { execute: handleReaction } = require("../Aufstellung/reactions");

module.exports = {
  name: Events.MessageReactionAdd,

  async execute(reaction, user) {
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
    } catch (error) {
      console.error("❌ Fehler bei der Reaktionsverarbeitung:", error);
    }
  }
};
