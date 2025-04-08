require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {gerarResposta} = require('./ia/gerarResposta');

const app = express();
app.use(cors());
app.use(express.json());




