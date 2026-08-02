const {
    Events,
    EmbedBuilder
} = require("discord.js");

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



        let data = load();


        if (!data)
            return;



        if (
            reaction.message.id !== data.messageId
        )
            return;



        // Falls alte Speicherung benutzt wurde
        if (!Array.isArray(data.dabei)) {

            data.dabei = [];

        }



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


        embed.setDescription(

`📅 **Aufstellung**


**✅ Dabei:**
${data.dabei.length
? data.dabei.map(
    n => `✅ ${n}`
).join("\n")
: "Noch niemand"}


**❌ Keine Rückmeldung:**
Noch keine Auswertung

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
