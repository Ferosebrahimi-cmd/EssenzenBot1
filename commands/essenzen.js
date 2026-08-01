const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { User } = require("../database/database");


module.exports = {

    data: new SlashCommandBuilder()

        .setName("essenzen")
        .setDescription("Essenzen Verwaltung")


        .addSubcommand(sub =>
            sub
                .setName("rangliste")
                .setDescription("Zeigt alle Essenzen")
        )


        .addSubcommand(sub =>
            sub
                .setName("geben")
                .setDescription("Gibt einem Spieler Essenzen")
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
                .setDescription("Entfernt Essenzen")
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
        ),



    async execute(interaction) {


        const sub =
            interaction.options.getSubcommand();



        // =========================
        // Rangliste alle Spieler
        // =========================

        if (sub === "rangliste") {


            const users =
                await User.find()
                    .sort({
                        essenzen: -1
                    });



            if (!users.length) {

                return interaction.reply({

                    content:
                        "Keine Daten vorhanden.",

                    ephemeral: true

                });

            }



            let liste = "";



            for (let i = 0; i < users.length; i++) {


                let name =
                    users[i].nickname || "Unbekannt";



                try {

                    const member =
                        await interaction.guild.members.fetch(
                            users[i].id
                        );


                    name =
                        member.nickname ||
                        member.user.username;


                } catch {}



                liste +=
                    `${i + 1}. ${name} - ${users[i].essenzen} Essenzen\n`;

            }



            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "Essenzen Rangliste"
                    )

                    .setDescription(
                        liste
                    );



            return interaction.reply({

                embeds: [
                    embed
                ]

            });

        }




        // =========================
        // Leader prüfen
        // =========================

        const leader =
            interaction.member.roles.cache.some(
                role =>
                    role.name === "Leader"
            );



        if (!leader) {

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
                "Essenzen aktualisiert.",

            ephemeral: true

        });


    }

};
