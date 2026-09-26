const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB verbunden");
    })
    .catch(err => {
        console.error("❌ MongoDB Fehler:", err);
    });


// User Daten
const userSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },

    nickname: {
        type: String,
        default: "Unbekannt"
    },

  essenzen: {
    type: Number,
    default: 0
}
});


// Essenzen Verlauf
const historySchema = new mongoose.Schema({

    user_id: {
        type: String,
        required: true
    },

    menge: {
        type: Number,
        required: true
    },

    typ: {
        type: String,
        required: true
    },

    ausgefuehrt_von: {
        type: String,
        default: "System"
    },

    datum: {
        type: Date,
        default: Date.now
    }
});


const User = mongoose.model("User", userSchema);
const History = mongoose.model("History", historySchema);


module.exports = {
    User,
    History
};
