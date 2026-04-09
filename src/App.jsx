import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Encabezado from "./components/navegacion/Encabezado";

import Inicio from "./views/Inicio";
import Catalogo from "./views/Catalogo";
import Categorias from "./views/Categorias";
import Citas from "./views/Citas";
import Clientes from "./views/Clientes";
import Empleados from "./views/Empleados";
import Pagina404 from "./views/Pagina404";
import Login from "./views/Login";
import Servicios from "./views/Servicios";
import RutaProtegida from "./components/rutas/RutaProtegida";

const App = () => {
  return(
    <Router>
      <Encabezado />

      <main className='margen-superior-main'>
        <Routes>
          <Route path='/login' element={<Login />} />

          <Route path='/' element={<RutaProtegida><Inicio /></RutaProtegida>} />
          <Route path='/categorias' element={<RutaProtegida><Categorias /></RutaProtegida>} />
          <Route path='/catalogo' element={<Catalogo />} />
          <Route path='/servicios' element={<RutaProtegida><Servicios /></RutaProtegida>} />
          <Route path='/empleados' element={<RutaProtegida><Empleados /></RutaProtegida>} />
          <Route path='/clientes' element={<RutaProtegida><Clientes /></RutaProtegida>} />
          <Route path='/citas' element={<RutaProtegida><Citas /></RutaProtegida>} />

          <Route path='*' element={<Pagina404/>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;