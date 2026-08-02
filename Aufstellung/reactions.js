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

    const name = member.displayName;

    // Sicherheit
    if (!data.nichtDabei)
        data.nichtDabei = [];

    // Überall entfernen
    data.dabei =
        data.dabei.filter(n => n !== name);

    data.nichtDabei =
        data.nichtDabei.filter(n => n !== name);

    // Neue Auswahl
    if (reaction.emoji.name === "✅") {

        data.dabei.push(name);

    } else if (reaction.emoji.name === "❌") {

        data.nichtDabei.push(name);

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

            .setTitle("🔥 Vatos MC Aufstellung")

            .setDescription(`

📅 **Datum:** ${new Date(Date.now() + 86400000).toLocaleDateString("de-DE")}

🕗 **Uhrzeit:** ${config.meetingHour}

━━━━━━━━━━━━━━

**✅ Dabei (${data.dabei.length})**

${data.dabei.length
    ? data.dabei.map(n => `✅ ${n}`).join("\n")
    : "Noch niemand"}

━━━━━━━━━━━━━━

**❌ Nicht dabei (${data.nichtDabei.length})**

${data.nichtDabei.length
    ? data.nichtDabei.map(n => `❌ ${n}`).join("\n")
    : "Noch niemand"}

━━━━━━━━━━━━━━

**❔ Keine Rückmeldung (${keineRueckmeldung.length})**

${keineRueckmeldung.length
    ? keineRueckmeldung.map(n => `❔ ${n}`).join("\n")
    : "Alle haben abgestimmt"}

━━━━━━━━━━━━━━

**Reagiere mit:**
✅ = Dabei
❌ = Nicht dabei

`)

            .setColor(0xff0000);

    await reaction.message.edit({
        embeds: [embed]
    });

    console.log("✅ Aufstellung aktualisiert:", name);

}

module.exports = {
    execute
};
