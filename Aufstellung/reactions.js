const {
    EmbedBuilder
} = require("discord.js");


const {
    load,
    save
} = require("./storage");


const config = require("./config");



async function execute(reaction, user) {


    console.log(
        "🔥 REACTION VERARBEITUNG START"
    );


    // Bot ignorieren
    if (user.bot) return;



    const data = load();


    console.log(
        "📂 GELADENE DATEN:",
        data
    );



    // Nur Aufstellungs-Nachricht bearbeiten

    if (
        reaction.message.id !== data.messageId
    ) {

        console.log(
            "❌ Falsche Nachricht"
        );

        return;

    }



    // Server-Mitglied laden für Nickname

    let member;

    try {

        member =
            await reaction.message.guild.members.fetch(
                user.id
            );

    } catch(error) {

        console.error(
            "❌ Mitglied konnte nicht geladen werden:",
            error
        );

        return;

    }



    // Server Nickname verwenden

    const name =
        member.displayName;



    console.log(
        "👤 Server Name:",
        name
    );



    // Wenn jemand vorher in keiner Liste war,
    // automatisch hinzufügen

    if (
        !data.alle.includes(name) &&
        !data.dabei.includes(name)
    ) {

        data.alle.push(name);

    }



    // ✅ Dabei

    if (
        reaction.emoji.name === "✅"
    ) {


        if (
            !data.dabei.includes(name)
        ) {

            data.dabei.push(name);

        }



        data.alle =
            data.alle.filter(
                n => n !== name
            );


    }




    // ❌ Nicht dabei

    if (
        reaction.emoji.name === "❌"
    ) {


        data.dabei =
            data.dabei.filter(
                n => n !== name
            );



        if (
            !data.alle.includes(name)
        ) {

            data.alle.push(name);

        }


    }



    save(data);



    console.log(
        "💾 Neue Daten gespeichert:",
        data
    );



    // Embed aktualisieren

    try {


        const embed =
            new EmbedBuilder()

            .setTitle(
                "🔥 Vatos MC Aufstellung"
            )

            .setDescription(

`
📅 **Datum:** ${new Date().toLocaleDateString("de-DE")}

🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei**

${
data.dabei.length > 0
?
data.dabei.map(
n => `✅ ${n}`
).join("\n")
:
"Niemand"
}



━━━━━━━━━━━━━━


**❌ Keine Rückmeldung**

${
data.alle.length > 0
?
data.alle.map(
n => `❌ ${n}`
).join("\n")
:
"Alle haben abgestimmt"
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
            name
        );


    }
    catch(error) {

        console.error(
            "❌ Embed Update Fehler:",
            error
        );

    }


}



module.exports = {

    execute

};
