const {
    Events,
    EmbedBuilder
} = require("discord.js");

const {
    load,
    save
} = require("./storage");

const config = require("./config");


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


        if (
            reaction.emoji.name !== "✅" &&
            reaction.emoji.name !== "❌"
        ) {

            return;

        }



        let data = load();


        if (!data)
            return;



        // Nur aktuelle Aufstellung

        if (
            reaction.message.id !== data.messageId
        ) {

            return;

        }



        const guild =
            reaction.message.guild;


        const member =
            await guild.members.fetch(
                user.id
            );


        const nickname =
            member.displayName;



        // Sicherheit

        const alle =
            Array.isArray(data.alle)
            ? [...data.alle]
            : [];


        let dabei =
            Array.isArray(data.dabei)
            ? [...data.dabei]
            : [];





        if (
            reaction.emoji.name === "✅"
        ) {

            if (
                !dabei.includes(nickname)
            ) {

                dabei.push(
                    nickname
                );

            }

        }



        if (
            reaction.emoji.name === "❌"
        ) {

            dabei =
                dabei.filter(
                    name =>
                    name !== nickname
                );

        }



        // Wichtig:
        // ALLE bleibt erhalten

        save({

            messageId:
                data.messageId,

            channelId:
                data.channelId,

            alle:
                alle,

            dabei:
                dabei

        });






        const keine =
            alle.filter(
                name =>
                !dabei.includes(name)
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

`
📅 **Datum:** ${datum}

🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei**

${
dabei.length
?
dabei.map(
name =>
`✅ ${name}`
).join("\n")
:
"Noch niemand"
}


━━━━━━━━━━━━━━


**❌ Keine Rückmeldung**

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



        console.log(
            "✅ Aufstellung aktualisiert:",
            nickname
        );


    }

};
