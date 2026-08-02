const {
    Events,
    EmbedBuilder
} = require("discord.js");

const config = require("../Aufstellung/aufstellung/config");
const {
    load,
    save
} = require("../Aufstellung/aufstellung/storage");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        if (user.bot)
            return;


        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch {

                return;

            }

        }


        if (reaction.emoji.name !== "✅")
            return;


        const data = load();


        if (!data)
            return;


        if (
            reaction.message.id !== data.messageId
        )
            return;



        const guild =
            reaction.message.guild;


        const member =
            await guild.members.fetch(
                user.id
            );


        const name =
            member.displayName;



        if (!data.dabei.includes(name)) {

            data.dabei.push(name);

        }


        save(data);



        const embed =
            EmbedBuilder.from(
                reaction.message.embeds[0]
            );


        const dabeiText =
            data.dabei.length
            ?
            data.dabei.map(
                n => `✅ ${n}`
            ).join("\n")
            :
            "Noch niemand";


        embed.setDescription(

`📅 **Aufstellung**


**✅ Dabei:**
${dabeiText}


**❌ Keine Rückmeldung:**
Keine

`

        );


        await reaction.message.edit({

            embeds:[
                embed
            ]

        });


        console.log(
            "✅ Teilnehmer hinzugefügt:",
            name
        );


    }

};
