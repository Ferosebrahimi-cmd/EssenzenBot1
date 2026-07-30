const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
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

                .addAttachmentOption(option =>
                    option
                        .setName("bild")
                        .setDescription("Beweisbild")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("remove")
                .setDescription("Entfernt Essenzen")

                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )

                .addIntegerOption(option =>
                    option
                        .setName("anzahl")
                        .setDescription("Anzahl")
                        .setRequired(true)
                )

                .addStringOption(option =>
                    option
                        .setName("grund")
                        .setDescription("Grund")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("konto")
                .setDescription("Zeigt Essenzen")

                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("top")
                .setDescription("Rangliste")
        )


        .addSubcommand(sub =>
            sub
                .setName("historie")
                .setDescription("Verlauf anzeigen")

                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer")
                        .setRequired(true)
                )
        )


        .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("Alle Essenzen zurücksetzen")
        ),



    async execute(interaction) {


        await interaction.deferReply();


        const command =
            interaction.options.getSubcommand();



        // =========================
        // ADMIN CHECK
        // =========================

        if(
            ["add","remove","reset"].includes(command)
            &&
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ){

            return interaction.editReply(
                "❌ Du benötigst Administrator-Rechte."
            );

        }




        // =========================
        // KONTO
        // =========================

        if(command === "konto"){


            const user =
                interaction.options.getUser("nutzer");


            let member;


            try {

                member =
                await interaction.guild.members.fetch(user.id);

            } catch {

                member = {
                    displayName:user.username
                };

            }



            const konto =
                await db.User.findOne({
                    id:user.id
                });



            const embed =
                new EmbedBuilder()

                .setColor(EMBED_COLOR)

                .setTitle("💎 Rote Essenzen Konto")

                .addFields(

                    {
                        name:"👤 Nutzer",
                        value:member.displayName
                    },

                    {
                        name:"💎 Essenzen",
                        value:`${konto ? konto.essenzen : 0}`
                    }

                );


            return interaction.editReply({
                embeds:[embed]
            });


        }





        // =========================
        // TOP
        // =========================

        if(command === "top"){


            const users =
                await db.User.find()
                .sort({
                    essenzen:-1
                })
                .limit(36);



            if(users.length === 0){

                return interaction.editReply(
                    "👑 Keine Daten vorhanden."
                );

            }



            let ranking = "";


            users.forEach((user,index)=>{


                let platz =
                    index === 0 ? "🥇" :
                    index === 1 ? "🥈" :
                    index === 2 ? "🥉" :
                    `${index+1}.`;


                ranking +=
                `${platz} **${user.name}** - ${user.essenzen} 💎\n`;


            });



            const embed =
                new EmbedBuilder()

                .setColor(EMBED_COLOR)

                .setTitle("👑 Essenzen Rangliste")

                .setDescription(ranking);



            return interaction.editReply({
                embeds:[embed]
            });


        }





        // =========================
        // HISTORIE
        // =========================

        if(command === "historie"){


            const user =
                interaction.options.getUser("nutzer");



            const history =
                await db.History.find({
                    user_id:user.id
                })
                .sort({
                    _id:-1
                })
                .limit(10);



            if(history.length === 0){

                return interaction.editReply(
                    "📜 Keine Historie vorhanden."
                );

            }



            let text = "";



            history.forEach(entry=>{


                text +=

                `${entry.amount > 0 ? "🩸➕":"🩸➖"} ${entry.amount} Essenzen\n`;

                text +=

                `📌 ${entry.reason}\n\n`;


            });



            const embed =
                new EmbedBuilder()

                .setColor(EMBED_COLOR)

                .setTitle("📜 Historie")

                .setDescription(text);



            return interaction.editReply({
                embeds:[embed]
            });


        }





        // =========================
        // ADD
        // =========================

        if(command === "add"){


            const user =
                interaction.options.getUser("nutzer");


            const amount =
                interaction.options.getInteger("anzahl");


            const image =
                interaction.options.getAttachment("bild");



            if(amount <= 0){

                return interaction.editReply(
                    "❌ Anzahl muss größer als 0 sein."
                );

            }



            const member =
                await interaction.guild.members.fetch(user.id);



            let konto =
                await db.User.findOne({
                    id:user.id
                });



            if(konto){

                konto.essenzen += amount;
                konto.name = member.displayName;

                await konto.save();


            } else {


                konto =
                await db.User.create({

                    id:user.id,

                    name:member.displayName,

                    essenzen:amount

                });

            }



            await db.History.create({

                user_id:user.id,

                amount:amount,

                reason:image.url,

                moderator:interaction.user.username,

                date:new Date()

            });



            const embed =
                new EmbedBuilder()

                .setColor(0x00AA00)

                .setTitle("🩸➕ Essenzen hinzugefügt")

                .addFields(

                    {
                        name:"👤 Nutzer",
                        value:member.displayName
                    },

                    {
                        name:"💎 Menge",
                        value:`+${amount}`
                    },

                    {
                        name:"📸 Beweis",
                        value:`[Bild öffnen](${image.url})`
                    },

                    {
                        name:"💎 Kontostand",
                        value:`${konto.essenzen}`
                    }

                );



            return interaction.editReply({
                embeds:[embed]
            });


        }





        // =========================
        // REMOVE
        // =========================

        if(command === "remove"){


            const user =
                interaction.options.getUser("nutzer");


            const amount =
                interaction.options.getInteger("anzahl");


            const reason =
                interaction.options.getString("grund");



            const konto =
                await db.User.findOne({
                    id:user.id
                });



            if(!konto){

                return interaction.editReply(
                    "❌ Nutzer besitzt keine Essenzen."
                );

            }



            konto.essenzen -= amount;


            if(konto.essenzen < 0){

                konto.essenzen = 0;

            }


            await konto.save();



            await db.History.create({

                user_id:user.id,

                amount:-amount,

                reason:reason,

                moderator:interaction.user.username,

                date:new Date()

            });



            return interaction.editReply({

                embeds:[

                    new EmbedBuilder()

                    .setColor(0xAA0000)

                    .setTitle("🩸➖ Essenzen entfernt")

                    .setDescription(
                        `${amount} Essenzen wurden entfernt.\n\nGrund: ${reason}`
                    )

                ]

            });


        }





        // =========================
        // RESET
        // =========================

        if(command === "reset"){


            await db.User.updateMany(

                {},

                {
                    essenzen:0
                }

            );


            return interaction.editReply(
                "🔄 Alle Essenzen wurden zurückgesetzt."
            );

        }


    }

};

