const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { User } = require("../database/database");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("verarbeitet")
.setDescription("Verarbeitet Verwaltung")


        .addSubcommand(sub =>
            sub
                .setName("rangliste")
                .setDescription("Zeigt alle Verarbeitet")
        )


        .addSubcommand(sub =>
            sub
                .setName("geben")
                .setDescription("Gibt Verarbeitet")
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("Spieler")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("menge")
                        .setDescription("Menge")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("entfernen")
                .setDescription("Entfernt Verarbeitet")
                .addUserOption(option =>
                    option
                        .setName("user")
                        .setDescription("Spieler")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("menge")
                        .setDescription("Menge")
                        .setRequired(true)
                )
        )
        
    .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("Setzt alle Verarbeitet auf 0")
        ),


    async execute(interaction) {


        const sub =
            interaction.options.getSubcommand();
        // =========================
        // Reset
        // =========================

        if (sub === "reset") {

            const istLeader =
                interaction.member.roles.cache.some(
                    role =>
                        role.name === "Leader"
                );

            if (!istLeader) {

                return interaction.reply({

                    content:
                        "Du benötigst die Leader-Rolle.",

                    ephemeral: true

                });

            }

            await User.updateMany(
                {},
                {
                    $set: {
                        essenzen: 0
                    }
                }
            );

            return interaction.reply({

                content:
                    "✅ Alle Verarbeitet wurden auf 0 gesetzt.",

                ephemeral: true

            });

        }


        // =========================
        // Rangliste
        // =========================

        // =========================
// Rangliste
// =========================

if (sub === "rangliste") {

    console.log("🟢 Rangliste gestartet");

    await interaction.deferReply();

    console.log("🟢 deferReply erfolgreich");

    const users = await User.find()
        .sort({
            essenzen: -1
        });

    console.log("🟢 Datenbankabfrage fertig");
    console.log("👥 User:", users.length);

    if (!users.length) {

        return interaction.editReply(
            "Keine Daten vorhanden."
        );

    }

    let liste = "";
    let platz = 1;

    for (let i = 0; i < users.length; i++) {

        let member;

        try {

            // Prüfen, ob der User noch auf dem Server ist
            member = await interaction.guild.members.fetch(
                users[i].id
            );

        } catch {

            // User ist nicht mehr auf dem Server
            continue;

        }

        const name =
            member.nickname ||
            member.user.username;

        liste +=
    `${platz}. ${name} = ${users[i].essenzen} Verarbeitet\n`;

        platz++;

        // Discord Embed Limit
        if (liste.length >= 3800) {

            liste +=
                "\nWeitere Spieler werden nicht angezeigt.";

            break;

        }

    }

    if (!liste) {

        return interaction.editReply(
            "Keine Mitglieder mit Verarbeitet gefunden."
        );

    }

    const embed =
        new EmbedBuilder()

            .setTitle(
    "Verarbeitet Rangliste"
)

            .setDescription(
                liste
            );

    return interaction.editReply({

        embeds: [
            embed
        ]

    });

}

        // =========================
        // Leader Rechte
        // =========================

        const istLeader =
            interaction.member.roles.cache.some(
                role =>
                    role.name === "Leader"
            );



        if (!istLeader) {


            return interaction.reply({

                content:
                    "Du benötigst die Leader-Rolle.",

                ephemeral: true

            });


        }



        const target =
            interaction.options.getUser("user");



        const menge =
            interaction.options.getInteger("menge");



        const member =
            await interaction.guild.members.fetch(
                target.id
            );



        const nickname =
            member.nickname ||
            member.user.username;



        let user =
            await User.findOne({

                id: target.id

            });



        if (!user) {


            user = new User({

                id:
                    target.id,

                nickname:
                    nickname,

                essenzen:
                    0

            });


        }



        user.nickname =
            nickname;



        if (sub === "geben") {

            user.essenzen += menge;

        }



        if (sub === "entfernen") {

            user.essenzen -= menge;


            if (user.essenzen < 0) {

                user.essenzen = 0;

            }

        }



        await user.save();



        await interaction.reply({

            content:
                "Verarbeitet aktualisiert.",

            ephemeral: true

        });


    }

};
