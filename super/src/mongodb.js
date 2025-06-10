// cargamos dotenv y lo configuramos, para poder usar las variables de entorno
const dotenv = require('dotenv');
dotenv.config();

// importamos MongoClient del driver oficial de MongoDb
const { MongoClient } = require('mongodb');

// leemos la URI desde el archivo .env
const URI = process.env.MONGODB_URI; // esto hace referencia al archivo .env

// creamos una instancia de MongoClient, esto permite interactuar con la base de datos
const client = new MongoClient(URI);

// funcion para conectar a la base de datos
async function connectToMongoDB() {
    try {
        await client.connect();
            console.log('Conectado a la base de datos, MongoDB');
        return client; // devolvemos el cliente si la conexion fue existosa
    } catch (error) {
        console.error('Error al conectar a la base de datos MongoDB', error);
        return null; // devolvemos null si la conexion fallo
    }
}   


// funcion para desconectar de la base de datos
async function disconnectFromMongoDB() {
    try {
        await client.close();
        console.log('Desconectado de la base de datos, MongoDB');
    } catch (error) {
        console.error('Error al desconectar de la base de datos MongoDB', error);
    } finally {
        // finalmente cerramos el cliente. Este bloque se ejecuta siempre
        console.log('Manejo de conexion finalizado');
    }
}


// Exportamos las funciones. Estas funciones pueden usar en otros archivos
module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB
};