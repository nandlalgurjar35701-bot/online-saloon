const express = require('express');
const app = express();
const cors = require("cors");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
require('dotenv').config();

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, 'src/admin/views'));
app.set("view engine", "ejs");
app.use(cookieParser(process.env.COOKIE_SECRET || "keyboard cat"));
app.use(session({
    cookie: { maxAge: 60000000 },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "secretsession"
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
