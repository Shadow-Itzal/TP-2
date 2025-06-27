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
    $jsonSchema: { // esto significa que el esquema es un JSON Schema
      bsonType: 'object',  //bsonType: 'object' indica que el esquema es un objeto
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
async function initCollections() {  // inicializa la colección
  const existing = await db.listCollections({ name: 'productos' }).toArray();  // verifica si la colección 'productos' ya existe
  if (existing.length === 0) {  // si no existe, crea la colección
    await db.createCollection('productos', productoSchema);  // crea la colección
    console.log('🗄️ Colección "productos" creada con validación de esquema');  
  } else {
    // Si ya existe, aplicar validación con collMod
    await db.command({  // aplica la validación
      collMod: 'productos',  // nombre de la colección
      ...productoSchema,  // esquema
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
  if (!db) {  // si no se ha conectado, lanza un error
    throw new Error('⚠️ La base de datos no está conectada. Llama a connectToMongoDB primero.');  // throw new Error() lanza un error
  }
  return db;
}

// CRUD para productos

// Función para crear un producto
async function createProducto(producto) {  // crea un producto
  const collection = getDB().collection('productos');  // obtiene la colección
  // Asegurar tipos adecuados
  const doc = {  // inicializa el documento
    codigo: parseInt(producto.codigo, 10),  // asegurar tipos adecuados
    nombre: String(producto.nombre).trim(),  // asegurar tipos adecuados y limpiar espacios
    precio: Number(producto.precio),  // asegurar tipos adecuados
    categoria: String(producto.categoria).trim(),  // asegurar tipos adecuados y limpiar espacios
  };
  const result = await collection.insertOne(doc);  // inserta el producto
  return result.insertedId;  // devuelve el ID del producto creado
}

// Función para obtener productos
async function getProductos(filter = {}) {  // busca todos los productos
  const collection = getDB().collection('productos');  // obtiene la colección
  return collection.find(filter).toArray();  // devuelve todos los productos
}


// Función para obtener un producto por codigo
async function getProductoByCodigo(codigo) {  // busca un producto
  const collection = getDB().collection('productos');  // obtiene la colección
  return collection.findOne({ codigo: parseInt(codigo, 10) });  // busca un producto por su código
}


// Función para actualizar un producto
async function updateProducto(codigo, cambios) {  // actualiza un producto
  const collection = getDB().collection('productos');  // obtiene la colección
  const updateDoc = { $set: {} };  // inicializa el documento de actualización
  if (cambios.nombre) updateDoc.$set.nombre = String(cambios.nombre).trim(); // asegurar tipos adecuados y limpiar espacios del nombre
  if (cambios.precio !== undefined) updateDoc.$set.precio = Number(cambios.precio); // asegurar tipos adecuados y limpiar espacios del precio
  if (cambios.categoria) updateDoc.$set.categoria = String(cambios.categoria).trim();  // asegurar tipos adecuados y limpiar espacios de la categoría
  const result = await collection.updateOne({ codigo: parseInt(codigo, 10) }, updateDoc);  // actualiza el producto
  return result.modifiedCount;  // devuelve el número de documentos modificados
}


// Función para eliminar un producto
async function deleteProducto(codigo) {  // elimina un producto
  const collection = getDB().collection('productos');  // obtiene la colección
  const result = await collection.deleteOne({ codigo: parseInt(codigo, 10) });  // elimina el producto
  return result.deletedCount;  // devuelve el número de documentos eliminados
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

// exportaciones
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
