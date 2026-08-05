const { EmbedBuilder } = require("discord.js");
const config = require("./config");

let queue = Promise.resolve();

function enqueueUpdate(task) {
    const result = queue.then(task, task);
    queue = result.catch(() => {});
    return result;
}

function normalizeParticipant(value) {
    if (typeof value === "string") {
        return { id: null, name: value };
    }

    return {
        id: value?.id || null,
        name: value?.name || "Unbekannt"
    };
}

function normalizeData(data) {
    data.alle = Array.isArray(data.alle)
        ? data.alle.map(normalizeParticipant)
        : [];
    data.dabei = Array.isArray(data.dabei) ? data.dabei : [];
    data.nichtDabei = Array.isArray(data.nichtDabei)
        ? data.nichtDabei
        : [];

    return data;
}

function participantForMember(data, member) {
    const participant = data.alle.find(entry =>
        entry.id === member.id || (!entry.id && entry.name === member.displayName)
    );

    if (!participant) return null;

    participant.id = member.id;
    participant.name = member.displayName;
    return participant;
}

function isSelected(list, participant) {
    return list.includes(participant.id) || list.includes(participant.name);
}

function removeParticipant(list, participant) {
    return list.filter(value =>
        value !== participant.id && value !== participant.name
    );
}

function selectedParticipants(data, list) {
    return data.alle.filter(participant => isSelected(list, participant));
}

function buildEmbed(data) {
    const dabei = selectedParticipants(data, data.dabei);
    const nichtDabei = selectedParticipants(data, data.nichtDabei);
    const keineRueckmeldung = data.alle.filter(participant =>
        !isSelected(data.dabei, participant) &&
        !isSelected(data.nichtDabei, participant)
    );

    const format = (participants, emoji, emptyText) => participants.length
        ? participants.map(participant => `${emoji} **${participant.name}**`).join("\n")
        : emptyText;

    return new EmbedBuilder()
        .setTitle("🔥 Vatos MC Aufstellung")
        .setDescription(`
📅 **Datum:** **${data.datum}**

🕗 **Uhrzeit:** ${config.meetingHour}

━━━━━━━━━━━━━━

**✅ Dabei (${dabei.length})**

${format(dabei, "✅", "Noch niemand")}

━━━━━━━━━━━━━━

**❌ Nicht dabei (${nichtDabei.length})**

${format(nichtDabei, "❌", "Noch niemand")}

━━━━━━━━━━━━━━

**❔ Keine Rückmeldung (${keineRueckmeldung.length})**

${format(keineRueckmeldung, "❔", "Alle haben abgestimmt")}

━━━━━━━━━━━━━━

Reagiere mit:

✅ = Dabei

❌ = Nicht dabei

❔ = Keine Rückmeldung
`)
        .setColor(0xff0000);
}

module.exports = {
    enqueueUpdate,
    normalizeData,
    participantForMember,
    isSelected,
    removeParticipant,
    buildEmbed
};
