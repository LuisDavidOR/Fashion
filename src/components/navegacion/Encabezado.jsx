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

  const manejarToggle = () => setMostrarMenu(!mostrarMenu);

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
          {mostrarMenu ? <i className="bi-house-fill me-2"></i> : null}
          <strong>Inicio</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {mostrarMenu ? <i className="bi-images me-2"></i> : null}
          <strong>Catálogo</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/citas")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {mostrarMenu ? <i className="bi-calendar-check-fill me-2"></i> : null}
          <strong>Agendar cita</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
        >
          {mostrarMenu ? (
            <i className="bi-person-fill-lock me-2"></i>
          ) : null}
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
            {mostrarMenu ? <i className="bi-house-fill me-2"></i> : null}
            <strong>Inicio</strong>
          </Nav.Link>

          {esAdmin && (
            <>
              <Nav.Link
                onClick={() => manejarNavegacion("/categorias")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                {mostrarMenu ? <i className="bi-tags-fill me-2"></i> : null}
                <strong>Categorías</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/servicios")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                {mostrarMenu ? <i className="bi-scissors me-2"></i> : null}
                <strong>Servicios</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/clientes")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                {mostrarMenu ? <i className="bi-people-fill me-2"></i> : null}
                <strong>Clientes</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/empleados")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                {mostrarMenu ? <i className="bi-person-badge-fill me-2"></i> : null}
                <strong>Empleados</strong>
              </Nav.Link>

              <Nav.Link
                onClick={() => manejarNavegacion("/insumos")}
                className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
              >
                {mostrarMenu ? <i className="bi-box-seam-fill me-2"></i> : null}
                <strong>Insumos</strong>
              </Nav.Link>
            </>
          )}

          {(esAdmin || esCliente || esEmpleado) && (
            <Nav.Link
              onClick={() => manejarNavegacion("/citas")}
              className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
            >
              {mostrarMenu ? <i className="bi-calendar-check-fill me-2"></i> : null}
              <strong>{esCliente ? "Mis Citas" : "Citas"}</strong>
            </Nav.Link>
          )}

          <Nav.Link
            onClick={() => manejarNavegacion("/catalogo")}
            className={mostrarMenu ? "navbar-fashion-link-offcanvas" : "navbar-fashion-link"}
          >
            {mostrarMenu ? <i className="bi-grid-fill me-2"></i> : null}
            <strong>Catálogo</strong>
          </Nav.Link>

          {!mostrarMenu && (
            <Nav.Link
              onClick={manejarCerrarSesion}
              className="navbar-fashion-link"
            >
              <i className="bi-box-arrow-right me-2"></i>
            </Nav.Link>
          )}
        </Nav>

        {mostrarMenu && (
          <div className="mt-3 p-3 rounded bg-light text-dark">
            <p className="mb-2">
              <i className="bi-envelope-fill me-2"></i>
              {usuario?.email?.toLowerCase() || "Usuario"}
            </p>

            <button
              className="btn btn-outline-danger mt-3 w-100"
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
          onHide={() => setMostrarMenu(false)}
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
