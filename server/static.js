import express from 'express';
import { app } from './app.js';

app.use('/', express.static('pages'));
app.use('/assets', express.static('assets'));
