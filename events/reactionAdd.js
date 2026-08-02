const {
    Events
} = require("discord.js");


const {
    execute: handleReaction
} = require("../Aufstellung/reactions");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        console.log(
            "🔥 REAKTION ERKANNT"
        );


        // Bot-Reaktionen ignorieren
        if (user.bot) return;



        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch(error) {

                console.error(
                    "❌ Reaction Fetch Fehler:",
                    error
                );

                return;

            }

        }



        await handleReaction(
            reaction,
            user
        );


    }

};
