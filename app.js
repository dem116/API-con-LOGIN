const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const axios = require('axios'); 
const bcrypt = require('bcrypt');  
const hashedSecret = require("./crypto/crypto")
const router = require("./rutas/routes")
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: hashedSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
  })
)

app.use("/", router)






app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
    });