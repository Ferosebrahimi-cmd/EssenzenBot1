const fs = require("fs");
const path = require("path");


const file =
    path.join(
        __dirname,
        "aufstellung.json"
    );



function load() {


    if (!fs.existsSync(file)) {

        return {
            messageId: null,
            channelId: null,
            alle: [],
            dabei: []
        };

    }



    try {


        const data =
            JSON.parse(
                fs.readFileSync(
                    file,
                    "utf8"
                )
            );


        return {

            messageId:
                data.messageId || null,


            channelId:
                data.channelId || null,


            alle:
                Array.isArray(data.alle)
                ? data.alle
                : [],


            dabei:
                Array.isArray(data.dabei)
                ? data.dabei
                : []

        };


    } catch(error) {


        console.error(
            "❌ Fehler beim Laden:",
            error
        );


        return {
            messageId: null,
            channelId: null,
            alle: [],
            dabei: []
        };


    }

}




function save(data) {


    fs.writeFileSync(

        file,

        JSON.stringify(

            {

                messageId:
                    data.messageId,


                channelId:
                    data.channelId,


                alle:
                    data.alle,


                dabei:
                    data.dabei

            },

            null,

            4

        )

    );


    console.log(
        "💾 Aufstellung gespeichert"
    );


}




module.exports = {

    load,
    save

};
