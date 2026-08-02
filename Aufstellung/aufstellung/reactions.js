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


    const data = load();


    console.log(
        "📂 GELADENE DATEN:",
        data
    );



    // Nur die Aufstellungs-Nachricht bearbeiten

    if (
        reaction.message.id !== data.messageId
    ) {

        console.log(
            "❌ Falsche Nachricht"
        );

        return;

    }



    const name =
        user.globalName ||
        user.username;



    console.log(
        "👤 Spieler:",
        name
    );



    // Namen aus alter Liste holen

    const istDabei =
        data.dabei.includes(name);



    // ✅ Reaktion

    if (
        reaction.emoji.name === "✅"
    ) {


        if (!istDabei) {

            data.dabei.push(
                name
            );

        }


        data.alle =
            data.alle.filter(
                n => n !== name
            );


    }




    // ❌ Reaktion

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

            data.alle.push(
                name
            );

        }

    }



    save(data);



    console.log(
        "💾 Neue Daten gespeichert:",
        data
    );



    // Nachricht aktualisieren

    try {


        const embed =
            new EmbedBuilder()

            .setTitle(
                "🔥 Vatos MC Aufstellung"
            )

            .setDescription(

`
📅 **Datum**

🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei**

${
data.dabei.length
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
data.alle.length
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

            embeds:[
                embed
            ]

        });



        console.log(
            "✅ Aufstellung aktualisiert"
        );


    }
    catch(error) {


        console.error(
            "❌ Update Fehler:",
            error
        );


    }


}



module.exports = {

    execute

};
