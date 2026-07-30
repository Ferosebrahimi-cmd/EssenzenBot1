const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("essenzen")
        .setDescription("Verwaltung der Roten Essenzen")


        // 🩸➕ ADD
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


        // 🩸➖ REMOVE
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


        // 💎 KONTO
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


        // 👑 TOP
        .addSubcommand(sub =>
            sub
                .setName("top")
                .setDescription("Zeigt die Essenzen Rangliste")
        )


        // 📜 HISTORIE
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


        // 🔄 RESET
        .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("Setzt alle Essenzen auf 0")
        ),


    async execute(interaction) {

        const command = interaction.options.getSubcommand();


        const hasPermission =
            interaction.member.permissions.has(
                PermissionFlagsBits.ManageGuild
            );
        // =========================
        // 💎 KONTO
        // =========================

        if (command === "konto") {

            const user = interaction.options.getUser("nutzer");

            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;


            const konto = db.prepare(
                "SELECT essenzen FROM users WHERE id = ?"
            ).get(user.id);


            if (!konto) {
                return interaction.reply(
                    `💎 **${displayName}** hat noch keine Essenzen.`
                );
            }


            return interaction.reply(
                `💎 **Rote Essenzen Konto**\n\n` +
                `Nutzer: **${displayName}**\n` +
                `Essenzen: **${konto.essenzen}**`
            );
        }



        // =========================
        // 👑 TOP
        // =========================

        if (command === "top") {

            const users = db.prepare(
                "SELECT name, essenzen FROM users ORDER BY essenzen DESC LIMIT 10"
            ).all();


            if (users.length === 0) {
                return interaction.reply(
                    "👑 Keine Daten vorhanden."
                );
            }


            let text =
                "👑 **Rote Essenzen Rangliste**\n\n";


            users.forEach((user, index) => {

                text +=
                    `${index + 1}. **${user.name}** - ${user.essenzen} Essenzen\n`;

            });


            return interaction.reply(text);
        }




        // =========================
        // 📜 HISTORIE
        // =========================

        if (command === "historie") {

            const user = interaction.options.getUser("nutzer");

            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;


            const history = db.prepare(
                "SELECT * FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 10"
            ).all(user.id);



            if (history.length === 0) {

                return interaction.reply(
                    `📜 Keine Historie für **${displayName}** gefunden.`
                );

            }



            let text =
                `📜 **Historie von ${displayName}**\n\n`;



            history.forEach(entry => {

                text +=
                    `${entry.amount > 0 ? "🩸➕" : "🩸➖"} **${entry.amount}** Essenzen\n` +
                    `📝 Grund: ${entry.reason}\n\n`;

            });



            return interaction.reply(text);
        }




        // =========================
        // RECHTE FÜR VERWALTUNG
        // =========================

        if (!hasPermission) {

            return interaction.reply({
                content: "❌ Keine Berechtigung.",
                ephemeral: true
            });

        }
        // =========================
        // 🩸➕ ADD
        // =========================

        if (command === "add") {

            const user = interaction.options.getUser("nutzer");
            const amount = interaction.options.getInteger("anzahl");
            const reason = interaction.options.getString("grund");


            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;



            const existing = db.prepare(
                "SELECT * FROM users WHERE id = ?"
            ).get(user.id);



            if (existing) {

                db.prepare(
                    "UPDATE users SET essenzen = essenzen + ?, name = ? WHERE id = ?"
                ).run(
                    amount,
                    displayName,
                    user.id
                );


            } else {


                db.prepare(
                    "INSERT INTO users (id, name, essenzen) VALUES (?, ?, ?)"
                ).run(
                    user.id,
                    displayName,
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
                `🩸➕ **${displayName}** hat **${amount} Essenzen** erhalten.\n\n` +
                `💎 Kontostand: **${konto.essenzen}**\n` +
                `📝 Grund: ${reason}`
            );

        }





        // =========================
        // 🩸➖ REMOVE
        // =========================

        if (command === "remove") {

            const user = interaction.options.getUser("nutzer");
            const amount = interaction.options.getInteger("anzahl");
            const reason = interaction.options.getString("grund");


            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;



            const konto = db.prepare(
                "SELECT essenzen FROM users WHERE id = ?"
            ).get(user.id);



            if (!konto) {

                return interaction.reply(
                    `🩸➖ **${displayName}** besitzt keine Essenzen.`
                );

            }



            if (konto.essenzen < amount) {

                return interaction.reply(
                    `🩸➖ **${displayName}** hat nicht genug Essenzen.`
                );

            }



            db.prepare(
                "UPDATE users SET essenzen = essenzen - ?, name = ? WHERE id = ?"
            ).run(
                amount,
                displayName,
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
                `🩸➖ **${displayName}** wurden **${amount} Essenzen** entfernt.\n\n` +
                `💎 Kontostand: **${neuerStand.essenzen}**\n` +
                `📝 Grund: ${reason}`
            );

        }





        // =========================
        // 🔄 RESET
        // =========================

        if (command === "reset") {


            db.prepare(
                "UPDATE users SET essenzen = 0"
            ).run();



            return interaction.reply(
                "🔄 Alle Essenzen wurden auf 0 gesetzt."
            );

        }

    }
};
