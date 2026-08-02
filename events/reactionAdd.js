const {
    Events
} = require("discord.js");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        console.log("================================");
        console.log("🔥 REAKTION ERKANNT");
        console.log("User:", user.tag);
        console.log("Emoji:", reaction.emoji.name);
        console.log("Message:", reaction.message.id);
        console.log("================================");


        if (user.bot)
            return;


        if (reaction.partial) {

            try {

                await reaction.fetch();

                console.log("✅ Partial geladen");

            } catch (error) {

                console.error(
                    "❌ Partial Fehler:",
                    error
                );

                return;

            }

        }


    }

};
