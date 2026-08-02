const {
    Events
} = require("discord.js");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        console.log(
            "🔥 REAKTION ERKANNT:",
            user.username,
            reaction.emoji.name
        );


        if(user.bot)
            return;


        if(reaction.partial){

            try {

                await reaction.fetch();

            } catch(error){

                console.error(
                    "Partial Fehler:",
                    error
                );

                return;

            }

        }


    }

};
