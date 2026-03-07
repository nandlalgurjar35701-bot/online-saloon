const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');

require('dotenv').config();
require('./src/datasources/connection');

const app = express();
const port = process.env.PORT || 7070;
const host = '0.0.0.0';
const isProduction = process.env.NODE_ENV === 'production';
const mongoUrl =
  process.env.mongourl ||
  process.env.MONGO_URL ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (isProduction) {
  app.set('trust proxy', 1);
}

if (mongoUrl) {
  console.log('SESSION STORE: MongoDB session store enabled.');
} else {
  console.warn('SESSION WARNING: No MongoDB env found for sessions. Using MemoryStore fallback.');
}

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'src/api/views'));
app.set('view engine', 'ejs');

app.use(cookieParser('keyboard cat'));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secretsession',
    resave: false,
    saveUninitialized: false,
    store: mongoUrl
      ? MongoStore.create({
          mongoUrl,
          collectionName: 'sessions',
        })
      : undefined,
    cookie: {
      maxAge: 60000000,
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    },
  })
);
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

app.use((req, res, next) => {
  res.locals.successMessages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
  res.locals.currentPath = req.path || "/";
  next();
});

// Middleware to log each API hit
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

require('./src/api/routes')(app);

const server = http.createServer(app);
server.keepAliveTimeout = 120000;
server.headersTimeout = 125000;

server.listen(port, host, () => {
  console.log(`server is running http://${host}:${port}`);
});
