const mongoose = require("mongoose");
const mongoURI = "mongodb://localhost:27017/bongDocs?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"

const connectToMongo = () => {
    try {
        mongoose.connect(mongoURI, () => {
            console.log("Connected to bongDocs server Successfully.");
        })
    } catch (error) {
        console.log("Failed to connect with server")
    }
}

module.exports = connectToMongo;