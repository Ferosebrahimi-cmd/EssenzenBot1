const {
    EmbedBuilder
} = require("discord.js");

const {
    load,
    save
} = require("./storage");

const config = require("./config");


async function execute(reaction, user) {

    if (user.bot) return;


    if (reaction.partial) {

        try {

            await reaction.fetch();

        } catch {

            return;

        }

    }


    const data = load();


    if (reaction.message.id !== data.messageId)
        return;



    const member =
        await reaction.message.guild.members.fetch(user.id);


    const name =
        member.displayName;



    // Sicherheit falls alte Speicherung

    if (!data.dabei)
        data.dabei = [];


    if (!data.nichtDabei)
        data.nichtDabei = [];



    // =========================
    // Auswahl Toggle System
    // =========================


    if (reaction.emoji.name === "✅") {


        // Wenn bereits dabei -> zurücksetzen

        if (data.dabei.includes(name)) {


            data.dabei =
                data.dabei.filter(
                    n => n !== name
                );


        } else {


            // Aus anderer Auswahl entfernen

            data.nichtDabei =
                data.nichtDabei.filter(
                    n => n !== name
                );


            data.dabei.push(name);


        }



    } else if (reaction.emoji.name === "❌") {



        // Wenn bereits nicht dabei -> zurücksetzen

        if (data.nichtDabei.includes(name)) {


            data.nichtDabei =
                data.nichtDabei.filter(
                    n => n !== name
                );


        } else {


            data.dabei =
                data.dabei.filter(
                    n => n !== name
                );


            data.nichtDabei.push(name);


        }



    } else if (reaction.emoji.name === "❔") {



        // Manuell zurück auf keine Rückmeldung


        data.dabei =
            data.dabei.filter(
                n => n !== name
            );


        data.nichtDabei =
            data.nichtDabei.filter(
                n => n !== name
            );



    } else {

        return;

    }




    save(data);




    const keineRueckmeldung =
        data.alle.filter(

            n =>
            !data.dabei.includes(n) &&
            !data.nichtDabei.includes(n)

        );





    const embed =
        new EmbedBuilder()


        .setTitle(
            "🔥 Vatos MC Aufstellung"
        )


        .setDescription(`

📅 **Datum:** **${data.datum}**


🕗 **Uhrzeit:** ${config.meetingHour}


━━━━━━━━━━━━━━


**✅ Dabei (${data.dabei.length})**

${
data.dabei.length
?
data.dabei.map(
n => `✅ **${n}**`
).join("\n")
:
"Noch niemand"
}



━━━━━━━━━━━━━━


**❌ Nicht dabei (${data.nichtDabei.length})**

${
data.nichtDabei.length
?
data.nichtDabei.map(
n => `❌ **${n}**`
).join("\n")
:
"Noch niemand"
}



━━━━━━━━━━━━━━


**❔ Keine Rückmeldung (${keineRueckmeldung.length})**

${
keineRueckmeldung.length
?
keineRueckmeldung.map(
n => `❔ **${n}**`
).join("\n")
:
"Alle haben abgestimmt"
}



━━━━━━━━━━━━━━


Reagiere mit:

✅ = Dabei

❌ = Nicht dabei

❔ = Keine Rückmeldung

`)


        .setColor(0xff0000);





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



module.exports = {

    execute

};
