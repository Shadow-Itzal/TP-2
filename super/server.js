const express = require('express');
const { connectToMongoDB, disconnectFromMongoDB } = require('./src/mongodb');
const { ObjectId } = require('mongodb');

const app = express();

app.use(express.json());

let db;
let productosCollection;

connectToMongoDB().then(client => {
    if (client) {
        db = client.db('supermercado'); // usa el nombre real de tu base
        productosCollection = db.collection('productos');
    }
});

// ----------    RUTAS     -----------

// 🟢 GET - Todos los productos
app.get('/productos', async (req, res) => {
    try {
        const productos = await productosCollection.find().toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener productos' });
    }
});

// 🟢 GET - Producto por codigo
app.get('/productos/codigo/:codigo', async (req, res) => {
    try {
        const codigoBuscado = parseInt(req.params.codigo);
        const producto = await productosCollection.findOne({ codigo: codigoBuscado });
        if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al buscar por código' });
    }
});

// 🟢 GET - Producto por nombre
app.get('/productos/nombre/:nombre', async (req, res) => {
    try {
        const producto = await productosCollection.findOne({ nombre: req.params.nombre });
        if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar por nombre' });
    }
});

// 🟢 GET - Productos por categoría
app.get('/productos/categoria/:categoria', async (req, res) => {
    try {
        const categoriaBuscada = req.params.categoria;
        const productos = await productosCollection.find({ categoria: categoriaBuscada }).toArray();

        if (productos.length === 0) return res.status(404).json({ mensaje: 'No se encontraron productos en esta categoría' });

        res.json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al buscar por categoría' });
    }
});

// 🟡 POST - Crear producto
app.post('/productos', async (req, res) => {
    try {
        const nuevo = req.body;
        const resultado = await productosCollection.insertOne(nuevo);
        res.status(201).json({ _id: resultado.insertedId, ...nuevo });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al crear producto' });
    }
});

// 🟠 PUT - Actualizar producto
app.put('/productos/codigo/:codigo', async (req, res) => {
    try {
        const codigoBuscado = parseInt(req.params.codigo);
        const actualizacion = await productosCollection.findOneAndUpdate(
            { codigo: codigoBuscado },
            { $set: req.body },
            { returnDocument: 'after' }
        );
        if (!actualizacion.value) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json(actualizacion.value);
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al actualizar producto' });
    }
});

// 🔴 DELETE - Eliminar producto
app.delete('/productos/codigo/:codigo', async (req, res) => {
    try {
        const codigoBuscado = parseInt(req.params.codigo);
        const resultado = await productosCollection.deleteOne({ codigo: codigoBuscado });
        if (resultado.deletedCount === 0) return res.status(404).json({ mensaje: 'Producto no encontrado' });
        res.json({ mensaje: 'Producto eliminado' });
    } catch (error) {
        res.status(400).json({ mensaje: 'Error al eliminar producto' });
    }
});



app.listen(3030, () => {
    console.log('Servidor funcionando en http://localhost:3030');
});


process.on('SIGINT', async () => {
    await disconnectFromMongoDB(); // llama a tu función
    console.log('🛑 Servidor detenido por el usuario');
    process.exit(0);
});