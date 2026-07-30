const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("essenzen")
        .setDescription("Verwaltung der Roten Essenzen")


        .addSubcommand(sub =>
            sub
                .setName("add")
                .setDescription("Gibt einem Nutzer Rote Essenzen")
                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("anzahl")
                        .setDescription("Anzahl der Essenzen")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("grund")
                        .setDescription("Grund der Vergabe")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("remove")
                .setDescription("Entfernt Rote Essenzen")
                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("anzahl")
                        .setDescription("Anzahl der Essenzen")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("grund")
                        .setDescription("Grund der Entfernung")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("konto")
                .setDescription("Zeigt den Essenzen Kontostand")
                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("top")
                .setDescription("Zeigt die Essenzen Rangliste")
        )


        .addSubcommand(sub =>
            sub
                .setName("historie")
                .setDescription("Zeigt den Essenzen Verlauf")
                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("Setzt alle Essenzen zurück")
        ),



    async execute(interaction) {

        const command = interaction.options.getSubcommand();



        // KONTO

        if (command === "konto") {

            const user = interaction.options.getUser("nutzer");

            const konto = db.prepare(
                "SELECT essenzen FROM users WHERE id = ?"
            ).get(user.id);


            if (!konto) {
                return interaction.reply(
                    "Keine Essenzen vorhanden."
                );
            }


            return interaction.reply(
                `💎 **Rote Essenzen Konto**\n\n` +
                `Nutzer: **${user.username}**\n` +
                `Kontostand: **${konto.essenzen} Essenzen**`
            );
        }



        // TOP

        if (command === "top") {

            const users = db.prepare(
                "SELECT name, essenzen FROM users ORDER BY essenzen DESC LIMIT 10"
            ).all();


            if (users.length === 0) {
                return interaction.reply(
                    "Keine Daten vorhanden."
                );
            }


            let text = "👑 **Rote Essenzen Rangliste**\n\n";


            users.forEach((user, index) => {

                let platz;

                if (index === 0) platz = "🥇";
                else if (index === 1) platz = "🥈";
                else if (index === 2) platz = "🥉";
                else platz = `${index + 1}.`;


                text += `${platz} **${user.name}** - ${user.essenzen} Essenzen\n`;

            });


            return interaction.reply(text);
        }



        // HISTORIE

        if (command === "historie") {

            const user = interaction.options.getUser("nutzer");


            const history = db.prepare(
                "SELECT * FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 10"
            ).all(user.id);



            if (history.length === 0) {
                return interaction.reply(
                    "Keine Historie vorhanden."
                );
            }


            let text =
                `📜 **Rote Essenzen Historie**\n\n` +
                `Nutzer: **${user.username}**\n\n`;



            history.forEach(entry => {

                const emoji = entry.amount >= 0 ? "🩸➕" : "🩸➖";


                text +=
                    `${emoji} **${entry.amount > 0 ? "+" : ""}${entry.amount}** Essenzen\n` +
                    `📝 Grund: ${entry.reason}\n` +
                    `Moderator: ${entry.moderator}\n` +
                    `Datum: ${entry.date}\n\n`;

            });


            return interaction.reply(text);
        }



        // RESET

        if (command === "reset") {


            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {

                return interaction.reply({
                    content: "Keine Berechtigung.",
                    ephemeral: true
                });

            }


            db.prepare(
                "UPDATE users SET essenzen = 0"
            ).run();


            db.prepare(
                "DELETE FROM history"
            ).run();



            return interaction.reply(
                `🔄 **Rote Essenzen Reset durchgeführt!**\n\n` +
                `Alle Kontostände wurden auf **0** gesetzt.\n` +
                `Historie wurde gelöscht.\n\n` +
                `Ausgeführt von: **${interaction.user.username}**`
            );
        }



        // RECHTE

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {

            return interaction.reply({
                content: "Keine Berechtigung.",
                ephemeral: true
            });

        }



        // ADD

        if (command === "add") {


            const user = interaction.options.getUser("nutzer");
            const amount = interaction.options.getInteger("anzahl");
            const reason = interaction.options.getString("grund");


            const existing = db.prepare(
                "SELECT * FROM users WHERE id = ?"
            ).get(user.id);



            if (existing) {

                db.prepare(
                    "UPDATE users SET essenzen = essenzen + ?, name = ? WHERE id = ?"
                ).run(
                    amount,
                    user.username,
                    user.id
                );

            } else {

                db.prepare(
                    "INSERT INTO users (id,name,essenzen) VALUES (?,?,?)"
                ).run(
                    user.id,
                    user.username,
                    amount
                );

            }



            db.prepare(
                "INSERT INTO history (user_id, amount, reason, moderator, date) VALUES (?, ?, ?, ?, ?)"
            ).run(
                user.id,
                amount,
                reason,
                interaction.user.username,
                new Date().toLocaleString("de-DE")
            );



            const konto = db.prepare(
                "SELECT essenzen FROM users WHERE id = ?"
            ).get(user.id);



            return interaction.reply(
                `🩸➕ **${user.username}** hat **${amount} Rote Essenzen** erhalten.\n\n` +
                `💎 Neuer Kontostand: **${konto.essenzen}**\n` +
                `📝 Grund: ${reason}`
            );
        }



        // REMOVE

        if (command === "remove") {


            const user = interaction.options.getUser("nutzer");
            const amount = interaction.options.getInteger("anzahl");
            const reason = interaction.options.getString("grund");


            const konto = db.prepare(
                "SELECT essenzen FROM users WHERE id = ?"
            ).get(user.id);



            if (!konto) {

                return interaction.reply(
                    "Dieser Nutzer besitzt keine Essenzen."
                );

            }



            if (konto.essenzen < amount) {

                return interaction.reply(
                    "Nicht genügend Essenzen vorhanden."
                );

            }



            db.prepare(
                "UPDATE users SET essenzen = essenzen - ? WHERE id = ?"
            ).run(
                amount,
                user.id
            );



            db.prepare(
                "INSERT INTO history (user_id, amount, reason, moderator, date) VALUES (?, ?, ?, ?, ?)"
            ).run(
                user.id,
                -amount,
                reason,
                interaction.user.username,
                new Date().toLocaleString("de-DE")
            );



            const neuerStand = db.prepare(
                "SELECT essenzen FROM users WHERE id = ?"
            ).get(user.id);



            return interaction.reply(
                `🩸➖ **${user.username}** wurden **${amount} Rote Essenzen** entfernt.\n\n` +
                `💎 Neuer Kontostand: **${neuerStand.essenzen}**\n` +
                `📝 Grund: ${reason}`
            );
        }

    }
};
