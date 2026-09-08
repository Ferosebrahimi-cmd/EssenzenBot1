require("dotenv").config();

const mongoose = require("mongoose");

const { User } = require("./database/database");


async function resetEssenzen() {

    try {

        // Warten, bis MongoDB verbunden ist
        await mongoose.connection.asPromise();


        const result = await User.updateMany(
            {},
            {
                $set: {
                    essenzen: -350
                }
            }
        );


        console.log(
            `✅ Alle Essenzen wurden auf -350 gesetzt (${result.modifiedCount} geändert)`
        );


        await mongoose.connection.close();

        process.exit(0);


    } catch (error) {

        console.error(
            "❌ Fehler beim Zurücksetzen:",
            error
        );

        process.exit(1);

    }

}


resetEssenzen();

