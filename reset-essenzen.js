require("dotenv").config();

const mongoose = require("mongoose");

const { User } = require("./database/database");


async function resetEssenzen() {

    try {

        await mongoose.connection.once("open", async () => {


            await User.updateMany(
                {},
                {
                    $set: {
                        essenzen: -184
                    }
                }
            );


            console.log("✅ Alle Essenzen wurden auf -184 gesetzt");


            process.exit(0);


        });


    } catch (error) {

        console.error(
            "❌ Fehler beim Zurücksetzen:",
            error
        );


        process.exit(1);

    }

}


mongoose.connect(process.env.MONGO_URI)
    .then(() => {

        console.log("✅ MongoDB verbunden");

        resetEssenzen();

    })
    .catch(error => {

        console.error(
            "❌ MongoDB Fehler:",
            error
        );

        process.exit(1);

    });
    