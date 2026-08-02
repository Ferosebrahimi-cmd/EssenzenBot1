const {
    Events,
    EmbedBuilder
} = require("discord.js");


const {
    load,
    save
} = require("./storage");


const config =
    require("./config");



module.exports = {


    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        // Bot ignorieren
        if (user.bot)
            return;



        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch {

                return;

            }

        }



        const data =
            load();



        if (
            !data.messageId ||
            reaction.message.id !== data.messageId
        )
            return;



        if (
            reaction.emoji.name !== "✅" &&
            reaction.emoji.name !== "❌"
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



        if (!Array.isArray(data.dabei)) {

            data.dabei = [];

        }



        // =================
        // ✅ Dabei
        // =================

        if (
            reaction.emoji.name === "✅"
        ) {


            if (
                !data.dabei.includes(nickname)
            ) {

                data.dabei.push(
                    nickname
                );

            }

        }



        // =================
        // ❌ Nicht dabei
        // =================

        if (
            reaction.emoji.name === "❌"
        ) {


            data.dabei =
                data.dabei.filter(
                    name =>
                    name !== nickname
                );

        }




        save(data);




        const keine =
            data.alle.filter(
                name =>
                !data.dabei.includes(name)
            );



        const datum =
            new Date(
                Date.now() + 86400000
            ).toLocaleDateString(
                "de-DE"
            );




        const embed =
            new EmbedBuilder()

            .setTitle(
                "🔥 Vatos MC Aufstellung"
            )

            .setDescription(

`📅 **Datum:** ${datum}
🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei:**

${
data.dabei.length
?
data.dabei.map(
name =>
`✅ ${name}`
).join("\n")
:
"Noch niemand"
}



━━━━━━━━━━━━━━


**❌ Keine Rückmeldung:**

${
keine.length
?
keine.map(
name =>
`❌ ${name}`
).join("\n")
:
"Alle haben reagiert"
}

`

            )

            .setColor(
                0xff0000
            );



        await reaction.message.edit({

            embeds:[
                embed
            ]

        });


    }


};
