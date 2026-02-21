const express = require('express');
const cors = require('cors');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');

require('dotenv').config();
require('./src/datasources/connection');

const app = express();
const port = process.env.PORT || 7070;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'src/api/views'));
app.set('view engine', 'ejs');

app.use(cookieParser('keyboard cat'));
app.use(
  session({
    cookie: { maxAge: 60000000 },
    resave: true,
    saveUninitialized: true,
    secret: 'secretsession',
  })
);
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  next();
});

// Middleware to log each API hit
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

require('./src/api/routes')(app);

app.listen(port, () => {
  console.log(`server is running http://localhost:${port}`);
});
