const express = require('express');
const {app} = require('./app');

app.use('/', express.static('pages'));
app.use('/assets', express.static('assets'));
