const {
    Events,
    EmbedBuilder
} = require("discord.js");

const {
    load,
    save
} = require("../Aufstellung/aufstellung/storage");

const config = require("../Aufstellung/aufstellung/config");


module.exports = {

    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        if (user.bot)
            return;


        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch (error) {

                console.error(error);
                return;

            }

        }


        const data = load();


        if (!data.messageId)
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



        // Teilnehmer Array sicherstellen
        if (!Array.isArray(data.dabei)) {

            data.dabei = [];

        }



        // ======================
        // DABEI
        // ======================

        if (
            reaction.emoji.name === "✅"
        ) {


            if (
                !data.dabei.includes(name)
            ) {

                data.dabei.push(name);

                console.log(
                    "✅ Dabei:",
                    name
                );

            }


        }



        // ======================
        // NICHT DABEI
        // ======================

        if (
            reaction.emoji.name === "❌"
        ) {


            data.dabei =
                data.dabei.filter(
                    n => n !== name
                );


            console.log(
                "❌ Entfernt:",
                name
            );


        }



        save(data);



        // ======================
        // Embed aktualisieren
        // ======================


        const role =
            guild.roles.cache.find(
                r => r.name === config.roleName
            );


        const alle =
            role
            ? role.members.map(
                m => m.displayName
            )
            : [];



        const keine =
            alle.filter(
                n => !data.dabei.includes(n)
            );



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
${keine.length
? keine.map(
    n => `❌ ${n}`
).join("\n")
: "Alle haben reagiert"}

`

        );



        await reaction.message.edit({

            embeds:[
                embed
            ]

        });



    }

};
