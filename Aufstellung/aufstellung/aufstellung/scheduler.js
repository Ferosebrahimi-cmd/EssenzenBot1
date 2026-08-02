const cron = require("node-cron");

const config = require("./config");
const {
    sendAufstellung
} = require("./message");

const {
    save
} = require("./storage");


function startScheduler(client) {


    cron.schedule(
        `${config.minute} ${config.hour} * * *`,
        async () => {


            try {


                console.log(
                    "📋 Erstelle neue Aufstellung..."
                );


                const message =
                    await sendAufstellung(
                        client
                    );


                save({

                    messageId:
                        message.id,

                    channelId:
                        config.channelId

                });


                console.log(
                    "✅ Aufstellung erstellt"
                );


            }
            catch(error) {


                console.error(
                    "❌ Fehler bei Aufstellung:",
                    error
                );


            }


        },


        {
            timezone:
                "Europe/Berlin"
        }


    );



    console.log(
        "⏰ Aufstellung Scheduler gestartet"
    );


}


module.exports = {

    startScheduler

};
