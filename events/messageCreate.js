
console.log("📩 messageCreate Datei geladen");

const { User, History } = require("../database/database");

module.exports = {

    name: "messageCreate",

    async execute(message) {

        // Bots ignorieren
        if (message.author.bot) return;


        // Erkennt: +20 oder +20 Essenzen
        const match = message.content.match(/^\+(\d+)(?:\s*essenzen)?$/i);

        if (!match) return;


        const menge = Number(match[1]);


        try {

            let user = await User.findOne({
                id: message.author.id
            });


            // Neuer User
            if (!user) {

                user = new User({
                    id: message.author.id,
                    nickname: message.member?.nickname || message.author.username,
                    essenzen: 0
                });

            }


            // Nickname aktualisieren
            user.nickname =
                message.member?.nickname || message.author.username;


            // Essenzen hinzufügen
            user.essenzen += menge;


            await user.save();


            // Verlauf speichern
            await History.create({

                user_id: message.author.id,

                menge: menge,

                typ: "Chat",

                ausgefuehrt_von: message.author.id

            });


            // Reaktion setzen
            await message.react("✅");


        } catch (error) {

            console.error("❌ Fehler bei Essenzen:", error);

        }

    }

};
