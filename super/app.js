const express = require('express');
const productosRouter = require('./src/routes/productos.routes');

const app = express();

app.use(express.json());
app.use('/productos', productosRouter);   // prefijo común

// fallback 404
app.use((_, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));

module.exports = app;
