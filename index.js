const express = require('express');
const cors = require('cors');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const serviceController = require("./src/api/controller/serviceController");
const tendentModel = require('./src/models/tendent.model');

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

  // Retain flash messages for admin routes which call req.flash() with no arguments
  const message = {};
  if (res.locals.successMessages.length > 0) message.success = res.locals.successMessages;
  if (res.locals.errorMessages.length > 0) message.error = res.locals.errorMessages;

  const originalFlash = req.flash.bind(req);
  req.flash = function (type, msg) {
    if (arguments.length === 0) {
      const allFlash = originalFlash();
      return { ...message, ...allFlash };
    }
    return originalFlash(type, msg);
  };

  next();
});

// Middleware to log each API hit
app.use(async (req, res, next) => {
  if (req.path === '/ping') {
    return next();
  }
  console.log(req.protocol + '://' + req.get('host') + req.originalUrl);
  console.table({ [req.method]: req.originalUrl });
  console.log(req.query, req.body);
  req.headers['subdomain'] = req.host.split('.')[0];
  console.log(req.headers['subdomain'], '----subdomain')
  let data = await tendentModel.findOne({ subdomain: req.headers['subdomain'], status: 'active' })
  console.log(data, '----data')
  if (data) {
    req.headers['tendentId'] = data._id;
  } else {
    let data = await tendentModel.findOne({ status: 'active' })
    if (data) {
      req.headers['tendentId'] = data._id;
    }
  }
  next();
});

require('./src/api/routes')(app);
require('./src/admin/routes')(app);

app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.all("*", serviceController.notFoundPage);

// Uptime self-ping mechanism to keep Render server awake (free tier)
const https = require('https');
const http = require('http');

function keepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL || process.env.url;
  if (!url) {
    console.log('[Uptime] No external URL configured.');
    return;
  }

  const pingUrl = `${url.replace(/\/$/, '')}/ping`;
  console.log(`[Uptime] Setting up self-ping for: ${pingUrl}`);

  // Ping immediately on start
  const client = pingUrl.startsWith('https') ? https : http;
  client.get(pingUrl, (res) => {
    console.log(`[Uptime] Initial self-ping status: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('[Uptime] Initial self-ping failed:', err.message);
  });

  // Set interval to ping every 10 minutes
  setInterval(() => {
    client.get(pingUrl, (res) => {
      console.log(`[Uptime] Periodic self-ping status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error('[Uptime] Periodic self-ping failed:', err.message);
    });
  }, 10 * 60 * 1000); // 10 minutes
}

keepAlive();

app.listen(port, () => {
  console.log(`server is running http://localhost:${port}`);
});
