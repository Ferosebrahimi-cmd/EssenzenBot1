console.log("📩 messageCreate Datei geladen");

const { User, History } = require("../database/database");

module.exports = {

    name: "messageCreate",

    async execute(message) {

        console.log("💬 Nachricht erkannt:", message.content);

        if (message.author.bot) return;

        const match = message.content.match(/^\+(\d+)(?:\s*essenzen)?$/i);

        console.log("🔎 Treffer:", match);

        if (!match) return;


        const menge = Number(match[1]);

        console.log("➕ Essenzen Menge:", menge);


        let user = await User.findOne({
            id: message.author.id
        });


        if (!user) {

            user = new User({
                id: message.author.id,
                nickname: message.member?.nickname || message.author.username,
                essenzen: 0
            });

        }


        user.nickname =
            message.member?.nickname || message.author.username;


        user.essenzen += menge;


        await user.save();


        await History.create({

            user_id: message.author.id,
            menge: menge,
            typ: "Chat",
            ausgefuehrt_von: message.author.id

        });


        await message.react("✅");

        console.log("✅ Essenzen gespeichert");

    }

};
