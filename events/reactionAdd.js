const {
    Events
} = require("discord.js");


const handleReaction =
    require("../aufstellung/reactions");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        console.log(
            "🔥 REAKTION ERKANNT"
        );


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
