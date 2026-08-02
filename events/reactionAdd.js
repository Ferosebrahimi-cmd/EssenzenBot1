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


        if(user.bot)
            return;


        const data =
            load();


        if(
            reaction.message.id !== data.messageId
        )
            return;


        if(
            reaction.emoji.name !== "✅"
        )
            return;


        const member =
            await reaction.message.guild.members.fetch(
                user.id
            );


        const name =
            member.displayName;


        if(
            !data.dabei.includes(name)
        ){

            data.dabei.push(name);

        }


        save(data);



        const message =
            await reaction.message.fetch();


        const embed =
            EmbedBuilder.from(
                message.embeds[0]
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
${data.alle
.filter(
n => !data.dabei.includes(n)
)
.map(
n => `❌ ${n}`
)
.join("\n") || "Alle haben reagiert"}

`

        );


        await message.edit({

            embeds:[
                embed
            ]

        });


    }

};
