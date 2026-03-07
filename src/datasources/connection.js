const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mongoUrl =
    process.env.mongourl ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

if (!mongoUrl) {
    console.error("MONGO CONFIG ERROR: No MongoDB URL found in env.");
}

const connectWithRetry = async () => {
    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4,
            maxPoolSize: 10
        });
    } catch (error) {
        console.error("MongoDB initial connection failed. Retrying in 10s...");
        console.error(error?.message || error);
        setTimeout(connectWithRetry, 10000);
    }
};

if (mongoUrl) {
    connectWithRetry();
}

db = mongoose.connection;
db.on("error", (err) => {
    console.error("MongoDB connection error:", err?.message || err);
});
db.once("open", function () {
    console.log("connection succeeded");
});

module.exports = db
