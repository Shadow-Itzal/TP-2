// db/index.js
// cargamos dotenv y lo configuramos
const dotenv = require('dotenv');
dotenv.config();

// importamos MongoClient del driver oficial de MongoDB
const { MongoClient } = require('mongodb');

// leemos la URI y el nombre de la base de datos desde .env
const URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'supermercado'; // fallback si no está en .env

// creamos una instancia de MongoClient
const client = new MongoClient(URI);

let db = null; // referencia a la base de datos

// Configuración de validación de esquema JSON para la colección 'productos'
const productoSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['codigo', 'nombre', 'precio', 'categoria'],
      properties: {
        codigo: {
          bsonType: 'int',
          description: 'Debe ser un entero y es obligatorio',
        },
        nombre: {
          bsonType: 'string',
          description: 'Debe ser una cadena de texto y es obligatorio',
        },
        precio: {
          bsonType: ['double', 'int'],
          minimum: 0,
          description: 'Debe ser un número no negativo',
        },
        categoria: {
          bsonType: 'string',
          description: 'Debe ser una cadena de texto y es obligatorio',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

// Función para inicializar la colección con validación (si no existe)
async function initCollections() {
  const existing = await db.listCollections({ name: 'productos' }).toArray();
  if (existing.length === 0) {
    await db.createCollection('productos', productoSchema);
    console.log('🗄️ Colección "productos" creada con validación de esquema');
  } else {
    // Si ya existe, aplicar validación con collMod
    await db.command({
      collMod: 'productos',
      ...productoSchema,
    });
    console.log('🔧 Validación de esquema aplicada a colección "productos"');
  }
}

// función para conectar a la base de datos
async function connectToMongoDB() {
  try {
    await client.connect();
    db = client.db(DB_NAME); // guarda referencia
    console.log(`✅ Conectado a MongoDB: base de datos "${DB_NAME}"`);
    await initCollections(); // inicializa la colección
    return client;
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    return null;
  }
}

// función para obtener la instancia de la base de datos
function getDB() {
  if (!db) {
    throw new Error('⚠️ La base de datos no está conectada. Llama a connectToMongoDB primero.');
  }
  return db;
}

// CRUD para productos
async function createProducto(producto) {
  const collection = getDB().collection('productos');
  // Asegurar tipos adecuados
  const doc = {
    codigo: parseInt(producto.codigo, 10),
    nombre: String(producto.nombre).trim(),
    precio: Number(producto.precio),
    categoria: String(producto.categoria).trim(),
  };
  const result = await collection.insertOne(doc);
  return result.insertedId;
}

async function getProductos(filter = {}) {
  const collection = getDB().collection('productos');
  return collection.find(filter).toArray();
}

async function getProductoByCodigo(codigo) {
  const collection = getDB().collection('productos');
  return collection.findOne({ codigo: parseInt(codigo, 10) });
}

async function updateProducto(codigo, cambios) {
  const collection = getDB().collection('productos');
  const updateDoc = { $set: {} };
  if (cambios.nombre) updateDoc.$set.nombre = String(cambios.nombre).trim();
  if (cambios.precio !== undefined) updateDoc.$set.precio = Number(cambios.precio);
  if (cambios.categoria) updateDoc.$set.categoria = String(cambios.categoria).trim();
  const result = await collection.updateOne({ codigo: parseInt(codigo, 10) }, updateDoc);
  return result.modifiedCount;
}

async function deleteProducto(codigo) {
  const collection = getDB().collection('productos');
  const result = await collection.deleteOne({ codigo: parseInt(codigo, 10) });
  return result.deletedCount;
}

// función para desconectar
async function disconnectFromMongoDB() {
  try {
    await client.close();
    console.log('🔌 Desconectado de MongoDB');
  } catch (error) {
    console.error('❌ Error al desconectar de MongoDB:', error);
  } finally {
    console.log('🧹 Limpieza finalizada');
  }
}

module.exports = {
  connectToMongoDB,
  disconnectFromMongoDB,
  getDB,
  createProducto,
  getProductos,
  getProductoByCodigo,
  updateProducto,
  deleteProducto,
};
