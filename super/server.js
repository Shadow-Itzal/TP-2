require('dotenv').config();           // lee .env
const app = require('./app');         // instancia de Express ya configurada
const { connectToMongoDB, disconnectFromMongoDB  } = require('./src/config/mongodb.js');

const PORT = process.env.PORT || 3030;

(async () => {
  await connectToMongoDB();             // abre conexión a Atlas
  const server = app.listen(PORT, () =>
    console.log(`🚀  API corriendo en http://localhost:${PORT}`)
  );

  // cierre limpio con Ctrl-C
  process.on('SIGINT', async () => {
    await disconnectFromMongoDB();
    console.log('🛑  Servidor detenido por el usuario');
    server.close(() => process.exit(0));
  });
})();
