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


        console.log("================================");
        console.log("🔥 REAKTION ERKANNT");
        console.log("User:", user.tag);
        console.log("Emoji:", reaction.emoji.name);
        console.log("Message:", reaction.message.id);
        console.log("================================");



        // Bots ignorieren
        if (user.bot)
            return;



        // Partials laden
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




        let data =
            load();



        // Falls keine Daten existieren
        if (!data) {

            data = {};

        }



        // Sicherheit für Arrays

        if (!Array.isArray(data.alle)) {

            data.alle = [];

        }


        if (!Array.isArray(data.dabei)) {

            data.dabei = [];

        }





        // Nur aktuelle Aufstellung

        if (
            !data.messageId ||
            reaction.message.id !== data.messageId
        ) {

            return;

        }






        // Nur diese Emojis

        if (
            reaction.emoji.name !== "✅" &&
            reaction.emoji.name !== "❌"
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







        // =====================
        // ✅ Dabei
        // =====================

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


                console.log(
                    "✅ Dabei:",
                    nickname
                );


            }


        }






        // =====================
        // ❌ Nicht dabei
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






        // Wer fehlt noch?

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
data.dabei.length > 0
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
keine.length > 0
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
