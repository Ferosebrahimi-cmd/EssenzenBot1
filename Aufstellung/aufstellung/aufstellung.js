const {
    EmbedBuilder
} = require("discord.js");


const config =
    require("./config");


const {
    save
} = require("./storage");



async function sendAufstellung(client) {


    console.log(
        "📋 Erstelle neue Aufstellung..."
    );



    const channel =
        await client.channels.fetch(
            config.channelId
        );



    const guild =
        channel.guild;



    const role =
        guild.roles.cache.find(
            r =>
            r.name === config.roleName
        );



    if (!role) {


        console.log(
            "❌ Rolle nicht gefunden:",
            config.roleName
        );


        return;

    }



    // Mitglieder richtig auslesen

    const mitglieder =
        [...role.members.values()]
        .map(
            member =>
            member.displayName
        );



    console.log(
        "👥 Mitglieder gefunden:",
        mitglieder
    );




    const datum =
        new Date(
            Date.now() + 86400000
        )
        .toLocaleDateString(
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

Noch niemand


━━━━━━━━━━━━━━


**❌ Keine Rückmeldung**

${mitglieder.length
?
mitglieder.map(
name =>
`❌ ${name}`
).join("\n")
:
"Keine Mitglieder gefunden"
}


`

        )

        .setColor(
            0xff0000
        );






    const message =
        await channel.send({

            embeds:[
                embed
            ]

        });




    await message.react("✅");

    await message.react("❌");





    save({

        messageId:
            message.id,


        channelId:
            channel.id,


        alle:
            [...mitglieder],


        dabei:
            []

    });



    console.log(
        "💾 Neue Aufstellung gespeichert"
    );


    console.log(
        "Gespeicherte Mitglieder:",
        mitglieder.length
    );



    return message;


}




module.exports = {

    sendAufstellung

};
