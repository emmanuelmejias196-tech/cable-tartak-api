const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Ruta de bienvenida para saber si está vivo en internet
app.get('/', (req, res) => {
  res.send('✔ Cable Tartak API funcionando correctamente.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
