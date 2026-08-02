const {
    Events
} = require("discord.js");

const {
    createEmbed,
    getStatus
} = require("./message");

const config = require("./config");


module.exports = {


    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        if (user.bot) return;


        if (!["✅", "❌", "❓"].includes(reaction.emoji.name)) {
            return;
        }



        const message =
            reaction.message;



        if (
            message.channel.id !== config.channelId
        ) {
            return;
        }



        const guild =
            message.guild;



        const role =
            guild.roles.cache.find(
                r => r.name === config.roleName
            );



        if (!role) return;



        const member =
            await guild.members.fetch(
                user.id
            );



        if (!member.roles.cache.has(role.id)) {
            return;
        }



        const status = {

            dabei: [],
            nichtDabei: [],
            unsicher: [],
            offen: []

        };



        const members =
            role.members;



        for (const [
            id,
            roleMember
        ] of members) {



            const reactions =
                message.reactions.cache;



            const hatDabei =
                reactions
                    .get("✅")
                    ?.users.cache.has(id);



            const hatNichtDabei =
                reactions
                    .get("❌")
                    ?.users.cache.has(id);



            const hatUnsicher =
                reactions
                    .get("❓")
                    ?.users.cache.has(id);



            if (hatDabei) {


                status.dabei.push(
                    roleMember.user.username
                );


            }
            else if (hatNichtDabei) {


                status.nichtDabei.push(
                    roleMember.user.username
                );


            }
            else if (hatUnsicher) {


                status.unsicher.push(
                    roleMember.user.username
                );


            }
            else {


                status.offen.push(
                    roleMember.user.username
                );


            }


        }



        const embed =
            createEmbed(
                status
            );



        await message.edit({

            embeds: [
                embed
            ]

        });


    }

};
