'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet'); // Security middleware
const cors = require('cors');
const bodyParser = require('body-parser');

const apiRoutes = require('./routes/api.js');
const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner');

const app = express();

// Security middleware
app.use(helmet()); // Secure HTTP headers
app.use(cors({ origin: '*' })); // Allow cross-origin requests (For FCC testing purposes only)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use('/public', express.static(process.cwd() + '/public'));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

// For FCC testing purposes
fccTestingRoutes(app);

// Routing for API
apiRoutes(app);

// 404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

// Start our server and tests
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; // for testing
