const express = require('express');
const app = express();
const cors = require("cors");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const isProduction = process.env.NODE_ENV === "production";
const mongoUrl =
    process.env.mongourl ||
    process.env.MONGO_URL ||
    process.env.MONGODB_URI ||
    process.env.DATABASE_URL;

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'src/admin/views'));
app.set("view engine", "ejs");
if (isProduction) {
    app.set("trust proxy", 1);
}
if (mongoUrl) {
    console.log("SESSION STORE: MongoDB session store enabled.");
} else {
    console.warn("SESSION WARNING: No MongoDB env found for sessions. Using MemoryStore fallback.");
}
app.use(cookieParser(process.env.COOKIE_SECRET || "keyboard cat"));
app.use(session({
    cookie: {
        maxAge: 60000000,
        httpOnly: true,
        sameSite: "lax",
        secure: isProduction
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "secretsession",
    store: mongoUrl
        ? MongoStore.create({
            mongoUrl,
            collectionName: "admin_sessions"
        })
        : undefined
}));
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware to log each API hit
app.use((req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.originalUrl}`);
    next();
});

require('./src/datasources/connection');
const port = process.env.adminPORT || 7171;
// const routes = require("./src/api");
// const adminroutes = require("./src/admin");
app.use(cors());
require("./src/admin/routes")(app)

app.listen(port, () => {
    console.log(`server is running http://localhost:${port}`);
});
