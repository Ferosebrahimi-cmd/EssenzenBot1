const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

const EMBED_COLOR = 0x8B0000;


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


            const konto = await db.User.findOne({
                id: user.id
            });


            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("💎 Rote Essenzen Konto")
                .addFields(
                    {
                        name: "👤 Nutzer",
                        value: displayName,
                        inline: true
                    },
                    {
                        name: "💎 Kontostand",
                        value: `${konto ? konto.essenzen : 0} Essenzen`,
                        inline: true
                    }
                );


            return interaction.reply({
                embeds: [embed]
            });

        }
        // =========================
        // 👑 TOP
        // =========================

        if (command === "top") {

            const users = await db.User.find()
                .sort({ essenzen: -1 })
                .limit(10);


            if (users.length === 0) {

                return interaction.reply(
                    "👑 Keine Daten vorhanden."
                );

            }


            let ranking = "";


            users.forEach((user, index) => {

                let platz;

                if (index === 0) platz = "🥇";
                else if (index === 1) platz = "🥈";
                else if (index === 2) platz = "🥉";
                else platz = `${index + 1}.`;


                ranking +=
                    `${platz} **${user.name}** - ${user.essenzen} Essenzen\n`;

            });


            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("👑 Rote Essenzen Rangliste")
                .setDescription(ranking);


            return interaction.reply({
                embeds: [embed]
            });

        }



        // =========================
        // 📜 HISTORIE
        // =========================

        if (command === "historie") {

            const user = interaction.options.getUser("nutzer");

            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;


            const history = await db.History.find({
                user_id: user.id
            })
                .sort({ _id: -1 })
                .limit(10);



            if (history.length === 0) {

                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLOR)
                    .setTitle("📜 Essenzen Historie")
                    .setDescription(
                        `Keine Historie für **${displayName}** vorhanden.`
                    );


                return interaction.reply({
                    embeds: [embed]
                });

            }



            let text = "";


            history.forEach(entry => {

                text +=
                    `${entry.amount > 0 ? "🩸➕" : "🩸➖"} **${entry.amount} Essenzen**\n` +
                    `📝 ${entry.reason}\n\n`;

            });



            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("📜 Essenzen Historie")
                .setDescription(
                    `👤 **${displayName}**\n\n${text}`
                );


            return interaction.reply({
                embeds: [embed]
            });

        }




        // =========================
        // RECHTE
        // =========================

        if (!hasPermission) {

            return interaction.reply({
                content: "Keine Berechtigung.",
                ephemeral: true
            });

        }




        // =========================
        // 🩸 ADD
        // =========================

        if (command === "add") {

            const user = interaction.options.getUser("nutzer");
            const amount = interaction.options.getInteger("anzahl");
            const reason = interaction.options.getString("grund");


            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;



            let konto = await db.User.findOne({
                id: user.id
            });



            if (konto) {

                konto.essenzen += amount;
                konto.name = displayName;

                await konto.save();

            } else {

                konto = await db.User.create({
                    id: user.id,
                    name: displayName,
                    essenzen: amount
                });

            }



            await db.History.create({
                user_id: user.id,
                amount: amount,
                reason: reason,
                moderator: interaction.user.username,
                date: new Date().toLocaleString("de-DE")
            });



            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("🩸➕ Essenzen hinzugefügt")
                .addFields(
                    {
                        name: "👤 Nutzer",
                        value: displayName,
                        inline: true
                    },
                    {
                        name: "💎 Menge",
                        value: `+${amount} Essenzen`,
                        inline: true
                    },
                    {
                        name: "📝 Grund",
                        value: reason
                    },
                    {
                        name: "💎 Neuer Kontostand",
                        value: `${konto.essenzen} Essenzen`
                    }
                );


            return interaction.reply({
                embeds: [embed]
            });

        }




        // =========================
        // 🩸 REMOVE
        // =========================

        if (command === "remove") {

            const user = interaction.options.getUser("nutzer");
            const amount = interaction.options.getInteger("anzahl");
            const reason = interaction.options.getString("grund");


            const member = await interaction.guild.members.fetch(user.id);
            const displayName = member.displayName;



            const konto = await db.User.findOne({
                id: user.id
            });



            if (!konto) {

                return interaction.reply(
                    "🩸➖ Nutzer besitzt keine Essenzen."
                );

            }



            if (konto.essenzen < amount) {

                return interaction.reply(
                    "🩸➖ Nicht genug Essenzen vorhanden."
                );

            }



            konto.essenzen -= amount;
            konto.name = displayName;

            await konto.save();



            await db.History.create({
                user_id: user.id,
                amount: -amount,
                reason: reason,
                moderator: interaction.user.username,
                date: new Date().toLocaleString("de-DE")
            });



            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("🩸➖ Essenzen entfernt")
                .addFields(
                    {
                        name: "👤 Nutzer",
                        value: displayName,
                        inline: true
                    },
                    {
                        name: "💎 Menge",
                        value: `-${amount} Essenzen`,
                        inline: true
                    },
                    {
                        name: "📝 Grund",
                        value: reason
                    },
                    {
                        name: "💎 Neuer Kontostand",
                        value: `${konto.essenzen} Essenzen`
                    }
                );


            return interaction.reply({
                embeds: [embed]
            });

        }




        // =========================
        // 🔄 RESET
        // =========================

        if (command === "reset") {

            await db.User.updateMany(
                {},
                {
                    essenzen: 0
                }
            );


            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle("🔄 Essenzen Reset")
                .setDescription(
                    "Alle Essenzen wurden auf **0** gesetzt."
                );


            return interaction.reply({
                embeds: [embed]
            });

        }

    }
};
