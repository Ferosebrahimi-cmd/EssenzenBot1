const {
    Events
} = require("discord.js");

const {
    load,
    save
} = require("./storage");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        if(user.bot)
            return;


        const data = load();


        if(
            !data.messageId ||
            reaction.message.id !== data.messageId
        )
            return;


        if(
            reaction.emoji.name !== "✅"
        )
            return;



        const guild =
            reaction.message.guild;


        const member =
            await guild.members.fetch(
                user.id
            );


        const nickname =
            member.displayName;



        if(
            !data.dabei.includes(
                nickname
            )
        ){

            data.dabei.push(
                nickname
            );

        }


        save(data);



        const message =
            await reaction.message.fetch();



        const embed =
            message.embeds[0];


        const newDescription =

`📅 **Aufstellung**
🕗 **Uhrzeit**

Reagiere mit ✅ wenn du dabei bist.


**Dabei:**
${data.dabei.length
? data.dabei.map(
    name => `✅ ${name}`
).join("\n")
: "Noch niemand"}

`;


        const updated =
            EmbedBuilder.from(embed)
            .setDescription(
                newDescription
            );


        await message.edit({

            embeds:[
                updated
            ]

        });


    }

};
