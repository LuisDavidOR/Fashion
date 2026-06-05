import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas } from "react-bootstrap";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";


const Encabezado = () => {

  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); //Para detectar la ruta actual

  const { usuario, rol, cerrarSesion } = useAuth();

  const esAdmin = usuario && rol === "admin";
  const esCliente = usuario && rol === "cliente";
  const esEmpleado = usuario && rol === "empleado";
  const esInvitado = !usuario;

  const manejarToggle = () => {
  const nuevoEstado = !mostrarMenu;
  setMostrarMenu(nuevoEstado);

  if (nuevoEstado) {
    document.body.classList.add("menu-abierto");
  } else {
    document.body.classList.remove("menu-abierto");
  }
};

  const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

  const manejarCerrarSesion = async () => {
    await cerrarSesion();
    setMostrarMenu(false);
    navigate("/login");
  };

  //Detectar rutas especiales
  const esRutaAuth =
    location.pathname === "/login" || location.pathname === "/registro";

  //Contenido del menú
  let contenidoMenu;

  if (esRutaAuth) {
    contenidoMenu = null;
  }
  else if (esInvitado) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">

        <Nav.Link
        onClick={() => manejarNavegacion("/")}
        className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
      >
        {!esAdmin && (
          <i className="bi-house-fill me-2"></i>
        )}

        <strong>Inicio</strong>
      </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          <i className="bi-grid-fill me-2"></i>
          <strong>Catálogo</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/citas")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
           <i className="bi-person-fill-lock me-2"></i>
          <strong>Agendar cita</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          <i className="bi-person-fill-lock me-2"></i>
          <strong>Iniciar sesión</strong>
        </Nav.Link>

      </Nav>
    );
  } else {
    contenidoMenu = (
      <>
        <Nav className="ms-auto pe-2">
          <Nav.Link
          onClick={() => manejarNavegacion("/")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {!esAdmin && (
            <i className="bi-house-fill me-2"></i>
          )}

          <strong>Inicio</strong>
        </Nav.Link>


          {esAdmin && (
            <>
              <Nav.Link
                onClick={() => manejarNavegacion("/categorias")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                
                <strong>Categorías</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/servicios")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                
                <strong>Servicios</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/clientes")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
               
                <strong>Clientes</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/empleados")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
               
                <strong>Empleados</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/insumos")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                
                <strong>Insumos</strong>
              </Nav.Link>
            </>
          )}

          {(esAdmin || esCliente || esEmpleado) && (
          <Nav.Link
            onClick={() => manejarNavegacion("/citas")}
            className={
              mostrarMenu
                ? "navbar-fashion-link-offcanvas"
                : "navbar-fashion-link"
            }
          >
            {!esAdmin && (
              <i className="bi-calendar-check-fill me-2"></i>
            )}

            <strong>
              {esCliente ? "Mis Citas" : "Citas"}
            </strong>
          </Nav.Link>
        )}

          <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {!esAdmin && (
            <i className="bi-grid-fill me-2"></i>
          )}

          <strong>Catálogo</strong>
        </Nav.Link>

          {(esCliente || esEmpleado) && (
            <Nav.Link
              onClick={() => manejarNavegacion("/perfil")}
              className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
            >
              <i className="bi-person-circle me-2"></i>
              <strong>Perfil</strong>
            </Nav.Link>
          )}

        {!mostrarMenu && (
        <Nav.Link
          onClick={manejarCerrarSesion}
          className="navbar-fashion-link"
        >
          <i className={`bi-box-arrow-right ${esCliente || esEmpleado ? "me-2" : ""}`}></i>

          {(esCliente || esEmpleado) && (
            <strong>Salir</strong>
          )}
        </Nav.Link>
      )}
      </Nav>
      {mostrarMenu && usuario && (
        <div className="mt-3 px-3">
          <button
            className="btn btn-outline-danger w-100"
            onClick={manejarCerrarSesion}
          >
            <i className="bi-box-arrow-right me-2"></i>
            Cerrar sesión
          </button>
        </div>
      )}
      </>
    );
  }

  return (
    <Navbar expand="md" fixed="top" className="navbar-fashion shadow-sm" variant="dark">
      <Container>

        <Navbar.Brand
          onClick={() => manejarNavegacion(usuario ? "/" : "/catalogo")}
          className="navbar-fashion-brand d-flex align-items-center ms-2"
          style={{cursor: "pointer"}}
        >
          
          <img
            alt="Logo Fashion"
            src={logo}
            width="42"
            height="42"
            className="d-inline-block me-2"
            style={{
              objectFit: "contain",
              borderRadius: "10px",
            }}
          />
          
            <h4 className="mb-0 navbar-fashion-title">
              Salón Fashion
            </h4>
        </Navbar.Brand>

        {/* Botón del menú */}
        {!esRutaAuth && (
          <Navbar.Toggle
            aria-controls="menu-offcanvas"
            onClick={manejarToggle}
          />
        )}

        {/*Menú lateral */}
        <Navbar.Offcanvas
          id="menu-offcanvas"
          placement="end"
          show={mostrarMenu}
         onHide={() => {
          setMostrarMenu(false);
          document.body.classList.remove("menu-abierto");
        }}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Menú Fashion</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            {contenidoMenu}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
    
  );
}

export default Encabezado;
