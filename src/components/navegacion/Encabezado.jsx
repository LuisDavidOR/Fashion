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
  const esLogin = location.pathname === "/login";

  //Contenido del menú
  let contenidoMenu;

  if (esLogin) {
    contenidoMenu = null;
  }
  else if (esInvitado) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">

        <Nav.Link
          onClick={() => manejarNavegacion("/")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          {mostrarMenu ? <i className="bi-house-fill me-2"></i> : null}
          <strong>Inicio</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/catalogo")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
        >
          {mostrarMenu ? <i className="bi-images me-2"></i> : null}
          <strong>Catálogo</strong>
        </Nav.Link>

        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "color-texto-marca" : "text-white"}
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
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-house-fill me-2"></i> : null}
            <strong>Inicio</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/categorias")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bookmark-fill me-2"></i> : null}
            <strong>Categorías</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/servicios")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
            <strong>Servicios</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/clientes")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
            <strong>Clientes</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/empleados")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
            <strong>Empleados</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/citas")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
            <strong>Citas</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/insumos")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
            <strong>Insumos</strong>
          </Nav.Link>

          <Nav.Link
            onClick={() => manejarNavegacion("/usuarios")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-bag-heart-fill me-2"></i> : null}
            <strong>Usuarios</strong>
          </Nav.Link>

          {/*Opción para ir al catálogo público desde admin */}
          <Nav.Link
            onClick={() => manejarNavegacion("/catalogo")}
            className={mostrarMenu ? "color-texto-marca" : "text-white"}
          >
            {mostrarMenu ? <i className="bi-images me-2"></i> : null}
            <strong>Catalogo</strong>
          </Nav.Link>

          {/*Icono cerrar sesión en barra superior */}
          {mostrarMenu ? null : (
            <Nav.Link
              onClick={manejarCerrarSesion}
              className={mostrarMenu ? "color-texto-marca" : "text-white"}
            >
              <i className="bi-box-arrow-right me-2"></i>
            </Nav.Link>
          )}

          <hr />
        </Nav>

        {/*Información del usuario y boton cerrar sesión */}
        {mostrarMenu && (
          <div className="mt-3 p-3 rounded bg-light text-dark">
            <p className="mb-2">
              <i className="bi-envelope-fill me-2"></i>
              {usuario?.email?.toLowerCase() || "Usuario"}
            </p>

            <button
              className="btn btn-outline-danger mt-3 w-100"
              onClick={cerrarSesion}
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
    <Navbar expand="md" fixed="top" className="color-navbar shadow-lg" variant="dark">
      <Container>

        <Navbar.Brand
          onClick={() => manejarNavegacion(usuario ? "/" : "/catalogo")}
          className="text-dark fw-bold d-flex align-items-center"
          style={{cursor: "pointer"}}
        >
          {
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
          }
          <strong>
            <h4
            className="mb-0"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: "600",
            }}
          >
            Salón Fashion
          </h4>
          </strong>
        </Navbar.Brand>

        {/* Botón del menú */}
        {!esLogin && (
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
