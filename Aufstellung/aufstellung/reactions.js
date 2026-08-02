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


        if (user.bot)
            return;



        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch(error) {

                console.error(
                    "❌ Reaction Fetch Fehler:",
                    error
                );

                return;

            }

        }



        if (
            reaction.emoji.name !== "✅" &&
            reaction.emoji.name !== "❌"
        ) {

            return;

        }




        let data =
            load();



        console.log(
            "📂 GELADENE DATEN:",
            data
        );



        if (!data.messageId)
            return;



        if (
            reaction.message.id !== data.messageId
        ) {

            return;

        }




        const guild =
            reaction.message.guild;


        if (!guild)
            return;




        const member =
            await guild.members.fetch(
                user.id
            );


        const nickname =
            member.displayName;




        // Sicherheit

        if (
            !Array.isArray(data.alle)
        ) {

            data.alle = [];

        }


        if (
            !Array.isArray(data.dabei)
        ) {

            data.dabei = [];

        }





        // ✅ Hinzufügen

        if (
            reaction.emoji.name === "✅"
        ) {


            if (
                !data.dabei.includes(
                    nickname
                )
            ) {

                data.dabei.push(
                    nickname
                );

            }


        }





        // ❌ Entfernen

        if (
            reaction.emoji.name === "❌"
        ) {


            data.dabei =
                data.dabei.filter(
                    name =>
                    name !== nickname
                );


        }




        // WICHTIG:
        // alle bleibt unverändert

        save({

            messageId:
                data.messageId,

            channelId:
                data.channelId,

            alle:
                data.alle,

            dabei:
                data.dabei

        });





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

`
📅 **Datum:** ${datum}

🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei**

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

            embeds: [
                embed
            ]

        });



        console.log(
            "✅ Aufstellung aktualisiert:",
            nickname
        );


        console.log(
            "👥 Noch offen:",
            keine
        );


    }

};
