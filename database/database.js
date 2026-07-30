const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB verbunden");
    })
    .catch(err => {
        console.error("❌ MongoDB Fehler:", err);
    });


const userSchema = new mongoose.Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    name: String,
    essenzen: {
        type: Number,
        default: 0
    }
});


const historySchema = new mongoose.Schema({
    user_id: String,
    amount: Number,
    reason: String,
    moderator: String,
    date: String
});


const User = mongoose.model("User", userSchema);
const History = mongoose.model("History", historySchema);


module.exports = {
    User,
    History
};
