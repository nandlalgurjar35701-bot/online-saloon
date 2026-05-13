const express = require('express');
const cors = require('cors');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const serviceController = require("./src/api/controller/serviceController");

require('dotenv').config();
require('./src/datasources/connection');

const app = express();
const port = process.env.PORT || 7070;

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', [path.join(__dirname, 'src/api/views'), path.join(__dirname, 'src/admin/views')]);
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
  res.locals.currentPath = req.path || "/";
  next();
});

// Middleware to log each API hit
app.use((req, res, next) => {
  console.table({ [req.method]: req.originalUrl });
  console.log(req.query, req.body);
  req.headers['subdomain'] = req.host.split('.')[0];

  next();
});

require('./src/api/routes')(app);
require('./src/admin/routes')(app);

app.all("*", serviceController.notFoundPage);

app.listen(port, () => {
  console.log(`server is running http://localhost:${port}`);
});
