const {
    EmbedBuilder
} = require("discord.js");


const config =
    require("./config");


const {
    save,
    load
} = require("./storage");



async function sendAufstellung(client) {


    const channel =
        await client.channels.fetch(
            config.channelId
        );



    const guild =
        channel.guild;



    // Mitglieder neu laden
    await guild.members.fetch();



    const role =
        guild.roles.cache.find(
            r => r.name === config.roleName
        );



    if (!role) {

        console.log(
            "❌ Rolle nicht gefunden:",
            config.roleName
        );

        return;

    }




    // Alte Aufstellung löschen

    const alte =
        load();


    if (alte.messageId) {

        try {

            const alteNachricht =
                await channel.messages.fetch(
                    alte.messageId
                );


            await alteNachricht.delete();


            console.log(
                "🗑️ Alte Aufstellung gelöscht"
            );


        } catch(error) {

            console.log(
                "ℹ️ Keine alte Aufstellung zum Löschen"
            );

        }

    }




    // Alle Mitglieder der Rolle holen

    const mitglieder =
        role.members.map(
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

Noch niemand



━━━━━━━━━━━━━━


**❌ Keine Rückmeldung**

${
mitglieder.length
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






    // Nachricht ohne Rollen-Ping senden

    const message =
        await channel.send({

            embeds:[
                embed
            ]

        });





    // Reaktionen setzen

    await message.react("✅");

    await message.react("❌");





    // Neue Aufstellung speichern

    save({

        messageId:
            message.id,


        channelId:
            channel.id,


        alle:
            mitglieder,


        dabei:
            []

    });





    console.log(
        "✅ Neue Aufstellung gespeichert"
    );



    return message;

}



module.exports = {

    sendAufstellung

};
