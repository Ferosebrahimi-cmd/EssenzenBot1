const {
    EmbedBuilder
} = require("discord.js");

const {
    load,
    save
} = require("./storage");


module.exports = async function handleReaction(
    reaction,
    user
) {

    if (user.bot)
        return;


    const data = load();


    console.log("📂 GELADENE DATEN:", data);



    // Nur die aktuelle Aufstellung
    if (
        !data.messageId ||
        reaction.message.id !== data.messageId
    )
        return;



    const emoji =
        reaction.emoji.name;



    if (
        emoji !== "✅" &&
        emoji !== "❌"
    )
        return;



    const guild =
        reaction.message.guild;


    const member =
        await guild.members.fetch(
            user.id
        );


    const name =
        member.displayName;



    // ======================
    // ✅ Dabei
    // ======================

    if (emoji === "✅") {


        if (
            !data.dabei.includes(name)
        ) {

            data.dabei.push(name);

        }


        console.log(
            "✅ Dabei:",
            name
        );


    }



    // ======================
    // ❌ Entfernen
    // ======================

    if (emoji === "❌") {


        data.dabei =
            data.dabei.filter(
                n => n !== name
            );


        console.log(
            "❌ Entfernt:",
            name
        );


    }




    save(data);



    // ======================
    // Embed aktualisieren
    // ======================


    const alle =
        data.alle || [];


    const dabei =
        data.dabei || [];



    const offen =
        alle.filter(
            name =>
            !dabei.includes(name)
        );



    const embed =
        EmbedBuilder.from(
            reaction.message.embeds[0]
        )
        .setDescription(

`
📅 **Datum:** Aufstellung

🕗 **Uhrzeit:**


━━━━━━━━━━━━━━


**✅ Dabei (${dabei.length})**

${
dabei.length
?
dabei.map(
n => `✅ ${n}`
).join("\n")
:
"Niemand"
}



━━━━━━━━━━━━━━


**❌ Keine Rückmeldung (${offen.length})**

${
offen.length
?
offen.map(
n => `❌ ${n}`
).join("\n")
:
"Alle haben reagiert"
}

`

        );



    await reaction.message.edit({

        embeds:[
            embed
        ]

    });



    console.log(
        "👥 Noch offen:",
        offen
    );

};
