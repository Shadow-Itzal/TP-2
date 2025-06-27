require('dotenv').config();
const app = require('./app');
const { connectToMongoDB, disconnectFromMongoDB } = require('./src/config/mongodb.js');

const PORT = process.env.PORT || 3030;

(async () => {
  await connectToMongoDB();

  const server = app.listen(PORT, () =>
    console.log(`🚀  API corriendo en http://localhost:${PORT}`)
  );

  // cierre limpio con Ctrl-C
  process.on('SIGINT', async () => {
    console.log('\n🛑 Deteniendo servidor...');

    // este try hace el cierre limpio
    try {
      await disconnectFromMongoDB();
      console.log('✔️ Base de datos desconectada');

      server.close(() => {
        console.log('✔️ Servidor cerrado');
        process.exit(0);
      });

      // Timeout para forzar salida si el servidor no cierra a tiempo (10 seg)
      setTimeout(() => {
        console.error('❗ Forzando cierre porque el servidor no cerró a tiempo');
        process.exit(1);
      }, 10000);

    } catch (error) {
      console.error('❌ Error durante el cierre:', error);
      process.exit(1);
    }
  });
})();
