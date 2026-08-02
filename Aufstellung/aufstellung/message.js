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



    // Alte Nachricht löschen

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


        } catch {

            console.log(
                "Keine alte Aufstellung vorhanden"
            );

        }

    }



    // Rollenmitglieder holen

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




    const message =
        await channel.send({

            content:
            `<@&${role.id}>`,

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
