const {
    SlashCommandBuilder
} = require("discord.js");

const {
    sendAufstellung
} = require("../Aufstellung/aufstellung");


module.exports = {

    data: new SlashCommandBuilder()
        .setName("aufstellung")
        .setDescription("Erstellt eine neue Vatos MC Aufstellung"),


    async execute(interaction) {

        try {

            await interaction.deferReply({
                ephemeral: true
            });


           await sendAufstellung(
    interaction.client
);


            await interaction.editReply(
                "✅ Aufstellung wurde erstellt!"
            );


        } catch (error) {

            console.error(
                "❌ Fehler beim Slash-Command Aufstellung:",
                error
            );


            await interaction.editReply(
                "❌ Fehler beim Erstellen der Aufstellung."
            );

        }

    }

};