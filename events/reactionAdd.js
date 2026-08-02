const {
    Events
} = require("discord.js");


const {
    execute
} = require("../Aufstellung/aufstellung/reactions");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {

        await execute(
            reaction,
            user
        );

    }

};
