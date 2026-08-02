const {
    execute
} = require("../Aufstellung/reactionsRemove");


module.exports = {

    name: "messageReactionRemove",

    async execute(reaction, user, client) {

        execute(reaction, user);

    }

};
