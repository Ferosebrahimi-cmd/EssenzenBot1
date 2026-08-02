const {
    Events,
    EmbedBuilder
} = require("discord.js");


const {
    load,
    save
} = require("../Aufstellung/aufstellung/storage");


const config =
    require("../Aufstellung/aufstellung/config");



module.exports = {


    name: Events.MessageReactionAdd,


    async execute(reaction, user) {


        // Bot ignorieren
        if (user.bot)
            return;



        // Falls Discord die Nachricht nicht geladen hat
        if (reaction.partial) {

            try {

                await reaction.fetch();

            } catch (error) {

                console.error(
                    "❌ Reaction Fetch Fehler:",
                    error
                );

                return;

            }

        }



        const data = load();



        // Keine aktive Aufstellung
        if (!data.messageId)
            return;



        // Nur Aufstellungsnachricht beachten
        if (
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



        // =====================
        // ✅ Dabei
        // =====================

        if (
            reaction.emoji.name === "✅"
        ) {


            if (
                !data.dabei.includes(nickname)
            ) {


                data.dabei.push(
                    nickname
                );


                console.log(
                    "✅ Teilnehmer:",
                    nickname
                );


            }


        }




        // =====================
        // ❌ Entfernen
        // =====================

        if (
            reaction.emoji.name === "❌"
        ) {


            data.dabei =
                data.dabei.filter(
                    name =>
                    name !== nickname
                );


            console.log(
                "❌ Entfernt:",
                nickname
            );


        }




        save(data);




        // =====================
        // Embed neu erstellen
        // =====================


        const datum =
            new Date(
                Date.now() + 86400000
            ).toLocaleDateString(
                "de-DE"
            );



        const keine =
            data.alle.filter(
                name =>
                !data.dabei.includes(name)
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
"Niemand"
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
