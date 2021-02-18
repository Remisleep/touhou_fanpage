const express = require('express');

const staticPath = __dirname;

const app = express();

app.use(express.static(staticPath));

app.listen(2000);