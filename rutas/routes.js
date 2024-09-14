const express = require('express');
const router = express.Router();
const users = require('../data/users');
const { generateToken, verifyToken } = require('../middlewares/authMiddleware');
const axios = require('axios');

router.get('/', (req, res) => {
  if (!req.session.token) {
    const formTemplate = `
    <form action="/login" method="post">
      <label for="username">Usuario:</label>
      <input type="text" id="username" name="username" required/>
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required/>
      <button type="submit">Iniciar sesión</button>
    </form>
    <a href="/search">Buscar</a>
    `;
    res.send(formTemplate);
  } else {
    res.send(`
      <h1>Bienvenido</h1>
      <a href="/search">Buscar</a>
      <form action="/logout" method="post">
      <button type="submit">Cerrar la sesión</button>
    </form>
    `);
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    res.status(401).json({ mensaje: 'Usuario o contraseña incorrecta' });
  } else {
    const token = generateToken(user);
    req.session.token = token;
    res.redirect('/search');
  }
});

router.get('/search', verifyToken, (req, res) => {
  const userId = req.user;
  const user = users.find((user) => user.id === userId);

  if (!user) {
    res.status(401).json({ mensaje: 'Usuario no encontrado' });
  } else {
    const template = `
      <h1>Hola ${user.name}</h1>
      <a href="/">volver a la home</a>
      <form action="/logout" method="post">
        <button type="submit">Cerrar sesión</button>
      </form>
      <form action="/character" method="get">
        <label for="personajeName">Buscar personaje:</label>
        <input type="text" id="personajeName" name="personajeName" />
        <button type="submit">Buscar</button>
      </form>
    `;
    res.send(template);
  }
});

router.get('/character', async (req, res) => {
  const personajeName = req.query.personajeName; 
  const url = `https://rickandmortyapi.com/api/character/?name=${personajeName}`;

  try {
    const response = await axios.get(url);
    const character = response.data.results[0];

    if (character) {
      const { name, status, species, gender, origin, image } = character;
      const template = `
        <h1>${name}</h1>
        <p>Status: ${status}</p>
        <p>Especie: ${species}</p>
        <p>Género: ${gender}</p>
        <p>Origen: ${origin.name}</p>
        <img src="${image}" alt="${name}" />
        <a href="/search">Volver a buscar</a>
        <form action="/logout" method="post">
          <button type="submit">Cerrar sesión</button>
        </form>
      `;
      res.send(template);
    } else {
      res.status(404).send('<h1>Personaje no encontrado</h1>');
    }
  } catch (error) {
    res.status(404).json({ error: 'Error al obtener el personaje' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
