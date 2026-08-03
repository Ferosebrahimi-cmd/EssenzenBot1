const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "aufstellung.json");

function standardData() {
    return {
        messageId: null,
        channelId: null,
        datum: null,
        alle: [],
        dabei: [],
        nichtDabei: []
    };
}

function load() {

    if (!fs.existsSync(file)) {
        return standardData();
    }

    try {

        const data = JSON.parse(
            fs.readFileSync(file, "utf8")
        );
return {
    messageId: data.messageId || null,
    channelId: data.channelId || null,
    datum: data.datum || null,
    alle: Array.isArray(data.alle) ? data.alle : [],
    dabei: Array.isArray(data.dabei) ? data.dabei : [],
    nichtDabei: Array.isArray(data.nichtDabei)
        ? data.nichtDabei
        : []
};
        return {
            messageId: data.messageId || null,
            channelId: data.channelId || null,
            alle: Array.isArray(data.alle) ? data.alle : [],
            dabei: Array.isArray(data.dabei) ? data.dabei : [],
            nichtDabei: Array.isArray(data.nichtDabei)
                ? data.nichtDabei
                : []
        };

    } catch (err) {

        console.error("❌ Fehler beim Laden:", err);
        return standardData();

    }

}

function save(data) {

    fs.writeFileSync(
        file,
        JSON.stringify({
            messageId: data.messageId,
            channelId: data.channelId,
            datum: data.datum,
            alle: data.alle,
            dabei: data.dabei,
            nichtDabei: data.nichtDabei
        }, null, 4)
    );

    console.log("💾 Aufstellung gespeichert");

}

module.exports = {
    load,
    save
};