const {
    Events
} = require("discord.js");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user, client) {


        console.log(
            "🔥 REAKTION EVENT:",
            user.tag,
            reaction.emoji.name,
            reaction.message.id
        );


        if (user.bot)
            return;


        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch (error) {

                console.error(
                    "❌ Reaction Fetch Fehler:",
                    error
                );

                return;

            }

        }


        console.log(
            "✅ Reaktion erfolgreich verarbeitet"
        );


    }

};
