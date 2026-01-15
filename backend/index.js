import 'dotenv/config';
import express from 'express'; // Traemos la librería (las comillas importan al importar con module)
import mongoose from 'mongoose';
import Gasto from './models/Gasto.js';
import cors from 'cors';


const app = express(); // Creamos una instancia de la aplicación
app.use(cors());
app.use(express.json());
const PORT = 3000; // Definimos en qué "puerta" escuchará el servidor

// Añadimos 'EcoTrackerDB' justo antes de '?'
// Esta versión usa el puerto 27017 directamente, que suele saltarse el error de DNS
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅Conectado a MongoDB Atlas.'))
  .catch(err => {
    console.error('✖️ ERROR EN CUESTIÓN:')
    console.error(err.message);
  });

// Cuando alguien entre a la ruta principal (/) de nuestro servidor...
app.get('/', (req, res) => {
  res.send('¡Servidor de EcoTrack funcionando! 🌱');
});

app.get('/gastos', (req, res) => {
    const misGastos = [
        { id: 1, producto: 'Cepillo de Bambú', precio: 5.50, impacto: 'Bajo' },
        { id: 2, producto: 'Bolsa de Tela', precio: 2.00, impacto: 'Nulo' },
        { id: 3, producto: 'Botella de Plástico', precio: 1.50, impacto: 'Alto' }
    ];

    res.json(misGastos); // Acá es .json en vez de .send
})

app.post('/nuevo-gasto', async(req, res) => {
  const { producto, precio, impacto} = req.body;

  const precioNumerico = Number(precio);
  const soloNumeros = /^\d+$/.test(producto);

  if (!producto || typeof producto !=='string' || producto.trim().length === 0 || soloNumeros) {
    return res.status(400).json({mensaje: 'El nombre del producto debe ser válido, ej: Pan, Queso, Jamón.'});
  }

  if (isNaN(precioNumerico) || precioNumerico <= 0) {
    return res.status(400).json({mensaje: 'El precio debe ser un número válido, ej: 10, 1, 5, 100.'});
  }
  try {
    const nuevoGasto = new Gasto({
      producto,
      precio,
      impacto: impacto || 'Bajo' // Si no viene impacto le ponemos bajo por defecto.
    });

    await nuevoGasto.save();
    res.status(201).json({ mensaje: 'Gasto guardado con éxito', dato: nuevoGasto });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al guardar', error: error.message });
  }
});

app.delete('/eliminar-gasto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Gasto.findByIdAndDelete(id);
    res.json({ mensaje: 'Gasto eliminado correctamente'});
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el gasto'});
  }
})

app.get('/ver-gastos', async(req, res) => {
  const gastos = await Gasto.find();
  res.json(gastos);

});


// Le decimos al servidor que empiece a escuchar
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
