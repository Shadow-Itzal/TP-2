// importamos express y lo configuramos, para poder usar las funciones de express
const express = require('express');
const app = express();

// importamos las funciones del archivo mongodb.js
const { connectToMongoDB, disconnectFromMongoDB } = require('./src/mongodb.js');
const { ObjectId } = require('mongodb'); 
const { parse } = require('dotenv');

// configuramos el puerto en el que se va a ejecutar el servidor
const PORT = process.env.PORT || 3030; // revisar si funciona, si no es 3006 ó 3008

app.use(express.json()); // sirve para poder recibir datos en formato json


// RUTAS

// ruta principal del servidor
app.get('/', (req, res) => {
    res.status(200).send('Bienvenido al supermercado Backend')
});


// ruta a /frutas, obtiene todas las frutas
app.get('/productos', async (req, res) => {
    const client = await connectToMongoDB();
    const db = client.db('supermercado');
    const frutas = await db.collection('supermercado').find().toArray();

    if (!client) {
        res.status(500).send( 'Error al conectarse a MongoDB');
        return;
    }

    await disconnectFromMongoDB();
    res.status(200).json(productos);
})
















