import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [gastos, setGastos] = useState([]) // Aquí guardaremos los datos
  const [formulario, setFormulario] = useState({
    producto: '',
    precio: '',
    impacto: 'Bajo'
  })
  const [cargando, setCargando] = useState(true);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    })
  }

  const enviarGasto = async (e) => {
    e.preventDefault()

    if (formulario.precio <= 0) {
      return alert('El precio no puede ser negativo o un 0.')
    }

    try {
      setCargando(true);
      const respuesta = await axios.post('http://localhost:3000/nuevo-gasto', formulario)

      setGastos([...gastos, respuesta.data.dato])

      setFormulario({ producto: '', precio: '', impacto: 'Bajo' })
      alert('¡Gasto guardado con éxito! 🌎')
    } catch (error) {
      const mensajeError = error.response?.data?.mensaje || 'Hubo un error';
      alert(mensajeError);
    } finally {
      setCargando(false);
    }
  }

  const colorImpacto = (impacto) => {
    if (impacto === 'Bajo') return 'bg-green-100 text-green-800 border-green-200'
    if (impacto === 'Medio') return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const eliminarGasto = async (id) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este gasto?')) {
      try {
        setCargando(true);
        await axios.delete(`http://localhost:3000/eliminar-gasto/${id}`);
        const nuevaLista = gastos.filter(gasto => gasto._id !== id);
        setGastos(nuevaLista);
      } catch (error) {
        alert('No se pudo eliminar el gasto.');
        console.log(error)
      } finally {
        setCargando(false);
      }
    }
  }

  const totalGastado = gastos.reduce((acc, gasto) => acc + Number(gasto.precio), 0);

  useEffect(() => {
    // Función para pedir los datos al backend
    const obtenerDatos = async () => {
      try {
        setCargando(true);
        const respuesta = await axios.get('http://localhost:3000/ver-gastos')
        setGastos(respuesta.data)
      } catch (error) {
        console.error("Error al pedir gastos:", error)
      } finally {
        setCargando(false);
      }
    }
    obtenerDatos()
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 p-8 font-sans'>
      <div className='max-w-4xl mx-auto'>
        {/* Header Cabezales */}

        <header className='text-center mb-10'>
          <h1 className='text-4xl font-bold text-green-600 mb-2'>🌱 EcoTracker </h1>
          <p className='text-gray-600'>Controla tus gastos y su impacto ambiental</p>
        </header>

        <div className='bg-green-600 text-white p-6 rounded-xl shadow-lg mb-8 flex justify-between items-center'>
          <div>
            <p className="text-green-100 text-sm uppercase font-bold tracking-wider">Inversión Eco-Friendly</p>
            <h2 className='text-4xl font-black'>${totalGastado.toLocaleString()}</h2>
          </div>
          <div className="text-3xl">💰</div>
        </div>

        {/* Formulario estilizado */}

        <section className='bg-white p-6 rounded-xl shadow-md mb-10 border border-gray-100'>
          <h2 className='text-xl font-semibold mb-4 text-gray-700'>Registrar gastos</h2>
          <form onSubmit={enviarGasto} className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            {/* Producto */}
            <input className='p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none' type='text' name='producto' placeholder='¿Qué compraste?' value={formulario.producto} onChange={manejarCambio} required />

            {/* Precio */}
            <input className='p-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none' type='number' name='precio' placeholder='Precio ($)' value={formulario.precio} onChange={manejarCambio} required />

            {/* Impacto */}
            <select className='p-2 border rounded-lg bg-white' name='impacto' value={formulario.impacto} onChange={manejarCambio}>
              <option value='Bajo'>Impacto Bajo</option>
              <option value='Medio'>Impacto Medio</option>
              <option value='Alto'>Impacto Alto</option>
            </select>

            <button className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300'> Guardar </button>
          </form>
        </section>

        {/* Lista de Gastos en tarjetas */}
        { cargando ? (
          <div className='col-span-full flex flex-col items-center py-10'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4'></div>
            <p className='text-gray-500 animate-pulse'>Conectando con la naturaleza (y la base de datos)...</p>
          </div>
        ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {gastos.map(gasto => (
            <div key={gasto._id} className='bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-green-500 flex justify-between items-center'>
              <div>
                <h3 className='font-bold text-gray-800 uppercase text-sm'>{gasto.producto}</h3>
                <p className='text-2xl font-light text-gray-600'>${gasto.precio}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorImpacto(gasto.impacto)}`}>
                {gasto.impacto}
              </span>

              <button onClick={() => eliminarGasto(gasto._id)} className='text-red-500 hover:text-red-700 text-sm font-medium transition-colors'> Eliminar 🗑️</button>
            </div>
          ))}
        </div>

        )}
      </div>
    </div>
      
  )
}

export default App