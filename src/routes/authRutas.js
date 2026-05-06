const express = require('express');

const enrutador = express.Router();

const authControlador = require('../controladores/authControlador');
const { verifyToken } = require('../middleware/authMiddleware');

enrutador.post('/login', authControlador.login);

enrutador.post('/logout', verifyToken, authControlador.logout);

module.exports = enrutador;
