import mongoose from 'mongoose';

const gastoSchema = new mongoose.Schema({
    producto: String,
    precio: Number,
    impacto: String,
    fecha: { type: Date, default: Date.now }
});

const Gasto = mongoose.model('Gasto', gastoSchema);

export default Gasto;