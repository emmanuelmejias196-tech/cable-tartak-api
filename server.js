const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 🗄️ Base de Datos en memoria con usuarios del sistema iniciales
let baseDeDatos = {
  // El dueño principal viene creado por defecto para poder iniciar el negocio
  usuariosSistema: [
    { usuario: "enmanuel", clave: "tartak2026", nombre: "Enmanuel (Dueño)", rol: "dueño" }
  ],
  clientes: [
    { cedula: "12345678", nombre: "Juan Perez", plan: "Plan Oro - 300 Mbps", activo: false, clave: "" }
  ],
  pagos: [],
  fallas: []
};

app.get('/', (req, res) => {
  res.send('⚡ Servidor Central de Cable Tartak con Multi-usuarios Operando.');
});

// 🔑 RUTA DE LOGIN ÚNICO: Verifica si el usuario y clave existen en el sistema
app.post('/api/admin/login', (req, res) => {
  const { usuario, clave } = req.body;
  const cuentaFound = baseDeDatos.usuariosSistema.find(u => u.usuario === usuario.toLowerCase() && u.clave === clave);

  if (!cuentaFound) {
    return res.status(401).json({ error: "Usuario o contraseña inválidos en Cable Tartak." });
  }

  // Si coincide, le responde a la web con su nombre y su rol real
  res.json({ nombre: cuentaFound.nombre, rol: cuentaFound.rol });
});

// 👑 RUTA EXCLUSIVA DEL DUEÑO: Crear cuentas para nuevos Administradores o Técnicos
app.post('/api/admin/crear-personal', (req, res) => {
  const { usuario, clave, nombre, rol } = req.body;

  if (!usuario || !clave || !nombre || !rol) {
    return res.status(400).json({ error: "Todos los campos son obligatorios para crear personal." });
  }

  const existe = baseDeDatos.usuariosSistema.find(u => u.usuario === usuario.toLowerCase());
  if (existe) return res.status(400).json({ error: "Ese nombre de usuario ya está asignado." });

  baseDeDatos.usuariosSistema.push({ usuario: usuario.toLowerCase(), clave, nombre, rol });
  res.json({ mensaje: `¡Usuario ${nombre} creado con éxito con el rol de ${rol}!`, total: baseDeDatos.usuariosSistema.length });
});

// 👑 RUTA EXCLUSIVA DEL DUEÑO: Listar todo el personal registrado
app.get('/api/admin/personal', (req, res) => {
  res.json(baseDeDatos.usuariosSistema);
});

// --- ENLACES ESTÁNDAR PREVIOS ---
app.post('/api/admin/pre-cargar-cliente', (req, res) => {
  const { cedula, nombre, plan } = req.body;
  baseDeDatos.clientes.push({ cedula, nombre, plan, activo: false, clave: "" });
  res.json({ mensaje: "Cliente pre-cargado con éxito" });
});
app.get('/api/admin/clientes', (req, res) => res.json(baseDeDatos.clientes));
app.get('/api/admin/fallas', (req, res) => res.json(baseDeDatos.fallas));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor Multi-usuario activo en puerto ${PORT}`));
