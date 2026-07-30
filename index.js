require("dotenv").config();

const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();

const PORT = process.env.PORT || 3000;

// Kleiner Webserver für Render
app.get("/", (req, res) => {
    res.send("EssenzenBot läuft!");
});

app.listen(PORT, () => {
    console.log(`Webserver läuft auf Port ${PORT}`);
});


// Discord Bot

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ],
});


client.once("clientReady", () => {
    console.log(`✅ ${client.user.tag} ist online!`);
});


client.login(process.env.TOKEN);
