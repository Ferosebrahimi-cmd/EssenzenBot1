const {
    execute
} = require("../Aufstellung/reactionsRemove");


module.exports = {

    name: "messageReactionRemove",

    async execute(reaction, user) {
        await execute(reaction, user);

    }

};
