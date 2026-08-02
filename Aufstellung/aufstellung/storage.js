const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "aufstellung.json");

function load() {

    if (!fs.existsSync(file)) {

        return {};

    }

    return JSON.parse(fs.readFileSync(file, "utf8"));

}

function save(data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 4)
    );

}

module.exports = {

    load,
    save

};
