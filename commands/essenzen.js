const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

const EMBED_COLOR = 0x8B0000;


module.exports = {

    data: new SlashCommandBuilder()

        .setName("essenzen")
        .setDescription("Verwaltung der Roten Essenzen")


        // =====================
        // ADD
        // =====================

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
                        .setDescription("Beweisbild hochladen")
                        .setRequired(true)
                )
        )


        // =====================
        // REMOVE
        // =====================

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


        // =====================
        // KONTO
        // =====================

        .addSubcommand(sub =>
            sub
                .setName("konto")
                .setDescription("Zeigt den Kontostand")

                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )
        )


        // =====================
        // TOP
        // =====================

        .addSubcommand(sub =>
            sub
                .setName("top")
                .setDescription("Zeigt die Rangliste")
        )


        // =====================
        // HISTORIE
        // =====================

        .addSubcommand(sub =>
            sub
                .setName("historie")
                .setDescription("Zeigt den Verlauf")

                .addUserOption(option =>
                    option
                        .setName("nutzer")
                        .setDescription("Nutzer auswählen")
                        .setRequired(true)
                )
        )


        // =====================
        // RESET
        // =====================

        .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("Setzt alle Essenzen auf 0")
        ),



    async execute(interaction) {


        const command =
            interaction.options.getSubcommand();



        // =====================
        // KONTO
        // =====================

        if(command === "konto"){


            const user =
                interaction.options.getUser("nutzer");


            const member =
                await interaction.guild.members.fetch(user.id);



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
                        value:
                        `${konto ? konto.essenzen : 0} Essenzen`
                    }

                );



            return interaction.reply({
                embeds:[embed]
            });

        }





        // =====================
        // TOP
        // =====================

        if(command === "top"){


            const users =
                await db.User.find()
                .sort({
                    essenzen:-1
                })
                .limit(36);



            if(users.length === 0){

                return interaction.reply(
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
                `${platz} **${user.name}** - ${user.essenzen} Essenzen\n`;


            });



            const embed =
                new EmbedBuilder()

                .setColor(EMBED_COLOR)

                .setTitle("👑 Rote Essenzen Rangliste")

                .setDescription(ranking);



            return interaction.reply({
                embeds:[embed]
            });


        }





        // =====================
        // HISTORIE
        // =====================

        if(command === "historie"){


            const user =
                interaction.options.getUser("nutzer");



            const member =
                await interaction.guild.members.fetch(user.id);



            const history =
                await db.History.find({
                    user_id:user.id
                })
                .sort({
                    _id:-1
                })
                .limit(10);



            if(history.length === 0){

                return interaction.reply(
                    "📜 Keine Historie vorhanden."
                );

            }



            let text = "";



            history.forEach(entry=>{

                text +=

                `${entry.amount > 0 ? "🩸➕":"🩸➖"} ${entry.amount} Essenzen\n`+

                `📌 ${entry.reason}\n\n`;

            });



            const embed =
                new EmbedBuilder()

                .setColor(EMBED_COLOR)

                .setTitle("📜 Essenzen Historie")

                .setDescription(
                    `👤 ${member.displayName}\n\n${text}`
                );



            return interaction.reply({
                embeds:[embed]
            });


        }
        // =====================
        // ADD
        // =====================

        if(command === "add"){


            const user =
                interaction.options.getUser("nutzer");


            const amount =
                interaction.options.getInteger("anzahl");


            const image =
                interaction.options.getAttachment("bild");



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

                date:new Date().toLocaleString("de-DE")

            });




            const embed =

            new EmbedBuilder()

            .setColor(EMBED_COLOR)

            .setTitle("🩸➕ Essenzen hinzugefügt")


            .addFields(

                {
                    name:"👤 Nutzer",
                    value:member.displayName
                },

                {
                    name:"💎 Menge",
                    value:`+${amount} Essenzen`
                },

                {
                    name:"📸 Beweis",
                    value:`[Bild öffnen](${image.url})`
                },

                {
                    name:"💎 Neuer Kontostand",
                    value:`${konto.essenzen} Essenzen`
                }

            );



            return interaction.reply({

                embeds:[embed]

            });


        }







        // =====================
        // REMOVE
        // =====================

        if(command === "remove"){



            const user =
                interaction.options.getUser("nutzer");



            const amount =
                interaction.options.getInteger("anzahl");



            const reason =
                interaction.options.getString("grund");



            const member =
                await interaction.guild.members.fetch(user.id);




            const konto =
                await db.User.findOne({
                    id:user.id
                });




            if(!konto){

                return interaction.reply(
                    "❌ Nutzer besitzt keine Essenzen."
                );

            }




            konto.essenzen -= amount;

            konto.name = member.displayName;



            await konto.save();





            await db.History.create({

                user_id:user.id,

                amount:-amount,

                reason:reason,

                moderator:interaction.user.username,

                date:new Date().toLocaleString("de-DE")

            });






            const embed =

            new EmbedBuilder()

            .setColor(EMBED_COLOR)

            .setTitle("🩸➖ Essenzen entfernt")


            .addFields(

                {
                    name:"👤 Nutzer",
                    value:member.displayName
                },


                {
                    name:"💎 Menge",
                    value:`-${amount} Essenzen`
                },


                {
                    name:"📌 Grund",
                    value:reason
                },


                {
                    name:"💎 Neuer Kontostand",
                    value:`${konto.essenzen} Essenzen`
                }


            );




            return interaction.reply({

                embeds:[embed]

            });


        }








        // =====================
        // RESET
        // =====================

        if(command === "reset"){



            await db.User.updateMany(

                {},

                {
                    essenzen:0
                }

            );



            return interaction.reply(

                "🔄 Alle Essenzen wurden zurückgesetzt."

            );


        }



    }

};

