const logger = require("./logger");
const express = require('express');
const app = express();

require('./startup/logging'); // Extracting Logging Logic
require('./startup/routes')(app); // Extracting Routes
require('./startup/db')(); // Extracting Db Logic
require('./startup/config')(); // Extracting Config Logic
require('./startup/validation')(); // Extracting Validation Logic

const port = process.env.PORT || 3000;
app.listen(port, () => logger.info(`Server started on port ${port}...`));
