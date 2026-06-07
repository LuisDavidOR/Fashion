import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";

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
import Insumos from './views/Insumos';
import Registro from './views/Registro';
import Perfil from './views/Perfil';
import InteligenciaNegocio from "./pages/InteligenciaNegocio";

import RutaProtegida from "./components/rutas/RutaProtegida";
import RecuperarCredenciales from './components/login/RecuperarCredenciales';
import RestablecerPassword from './components/login/RestablecerPassword';
import ScrollToTop from './components/ScrollToTop';
const App = () => {
  return(
    <AuthProvider>
      <Router>
        <Encabezado />

        <main className='margen-superior-main'>
          <ScrollToTop />
          <Routes>
            <Route path='/login' element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route
              path="/recuperar-credenciales"
              element={<RecuperarCredenciales />}
            />
            <Route
              path="/restablecer-password"
              element={<RestablecerPassword />}
            />

            <Route path='/' element={<Inicio />} />

            <Route path='/catalogo' element={<Catalogo />} />

            <Route path="/citas" element={<Citas />} />

            <Route path='/categorias' element={<RutaProtegida rolesPermitidos={["admin"]}><Categorias /></RutaProtegida>} />
            <Route path='/servicios' element={<RutaProtegida rolesPermitidos={["admin"]}><Servicios /></RutaProtegida>} />
            <Route path='/empleados' element={<RutaProtegida rolesPermitidos={["admin"]}><Empleados /></RutaProtegida>} />
            <Route path='/clientes' element={<RutaProtegida rolesPermitidos={["admin"]}><Clientes /></RutaProtegida>} />
            <Route path='/insumos' element={<RutaProtegida rolesPermitidos={["admin"]}><Insumos /></RutaProtegida>} />
            <Route path="/inteligencia-negocio" element={<RutaProtegida rolesPermitidos={["admin"]}><InteligenciaNegocio /></RutaProtegida>} />
            <Route path='/perfil' element={<RutaProtegida rolesPermitidos={["cliente", "empleado"]}><Perfil /></RutaProtegida>}/>
            
            <Route path='*' element={<Pagina404/>} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;