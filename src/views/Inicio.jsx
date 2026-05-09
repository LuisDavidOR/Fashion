import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";

const Inicio = () => {
  const { rol } = useAuth();
    const opcionesPorRol = {
      admin: [
        {
          titulo: "Categorías",
          descripcion: "Organiza los servicios del salón por categorías.",
          icono: "bi-bookmark-heart-fill",
          ruta: "/categorias",
        },
        {
          titulo: "Servicios",
          descripcion: "Administra precios, duración e imágenes de servicios.",
          icono: "bi-scissors",
          ruta: "/servicios",
        },
        {
          titulo: "Clientes",
          descripcion: "Gestiona la información de tus clientes registrados.",
          icono: "bi-people-fill",
          ruta: "/clientes",
        },
        {
          titulo: "Empleados",
          descripcion: "Controla empleados, especialidades, comisión y fotos.",
          icono: "bi-person-badge-fill",
          ruta: "/empleados",
        },
        {
          titulo: "Citas",
          descripcion: "Consulta y administra las citas del salón.",
          icono: "bi-calendar-check-fill",
          ruta: "/citas",
        },
        {
          titulo: "Insumos",
          descripcion: "Controla productos, costos, stock e inventario.",
          icono: "bi-box-seam-fill",
          ruta: "/insumos",
        },
        {
          titulo: "Catálogo",
          descripcion: "Vista elegante para mostrar servicios al cliente.",
          icono: "bi-grid-fill",
          ruta: "/catalogo",
        },
      ],

      cliente: [
        {
          titulo: "Catálogo",
          descripcion: "Explora nuestros servicios disponibles.",
          icono: "bi-grid-fill",
          ruta: "/catalogo",
        },
        {
          titulo: "Mis citas",
          descripcion: "Consulta el estado de tus citas.",
          icono: "bi-calendar-heart-fill",
          ruta: "/citas",
        },
      ],

      empleado: [
        {
          titulo: "Citas disponibles",
          descripcion: "Revisa citas pendientes para aceptar.",
          icono: "bi-calendar-check-fill",
          ruta: "/citas",
        },
        {
          titulo: "Catálogo",
          descripcion: "Consulta los servicios disponibles.",
          icono: "bi-grid-fill",
          ruta: "/catalogo",
        },
      ],

      invitado: [
        {
          titulo: "Catálogo",
          descripcion: "Explora nuestros servicios.",
          icono: "bi-grid-fill",
          ruta: "/catalogo",
        },
        {
          titulo: "Iniciar sesión",
          descripcion: "Accede para agendar citas.",
          icono: "bi-person-fill-lock",
          ruta: "/login",
        },
      ],
    };

    const opciones = opcionesPorRol[rol] || opcionesPorRol.invitado;
  const contenidoHeroPorRol = {
    admin: {
      etiqueta: "Sistema de Gestión",
      titulo: "Bienvenido a Salón Fashion",
      descripcion: "Administra tu salón de belleza de forma moderna, rápida y elegante.",
      botonPrincipal: "Ver Catálogo",
      rutaPrincipal: "/catalogo",
      botonSecundario: "Gestionar Citas",
      rutaSecundaria: "/citas",
    },

    cliente: {
      etiqueta: "Área de Cliente",
      titulo: "Bienvenido a tu espacio Fashion",
      descripcion: "Agenda tus citas, consulta tus servicios y comparte tu experiencia.",
      botonPrincipal: "Ver Catálogo",
      rutaPrincipal: "/catalogo",
      botonSecundario: "Mis Citas",
      rutaSecundaria: "/citas",
    },

    empleado: {
      etiqueta: "Área de Empleado",
      titulo: "Panel de trabajo Fashion",
      descripcion: "Consulta citas disponibles, acepta servicios y revisa tus asignaciones.",
      botonPrincipal: "Ver Citas",
      rutaPrincipal: "/citas",
      botonSecundario: "Ver Catálogo",
      rutaSecundaria: "/catalogo",
    },

    invitado: {
      etiqueta: "Bienvenido",
      titulo: "Descubre Salón Fashion",
      descripcion: "Explora nuestros servicios y crea una cuenta para agendar tu próxima experiencia.",
      botonPrincipal: "Ver Catálogo",
      rutaPrincipal: "/catalogo",
      botonSecundario: "Iniciar Sesión",
      rutaSecundaria: "/login",
    },
  };

  const contenidoHero = contenidoHeroPorRol[rol] || contenidoHeroPorRol.invitado;

  return (
    <Container className="inicio-container">
      <section className="inicio-hero">
        <div>
          <span className="inicio-etiqueta">{contenidoHero.etiqueta}</span>
            <h1>{contenidoHero.titulo}</h1>
            <p>{contenidoHero.descripcion}</p>

          <div className="inicio-acciones">
            <Button
              as={Link}
              to={contenidoHero.rutaPrincipal}
              className="btn-inicio-principal"
            >
              {contenidoHero.botonPrincipal}
            </Button>

            <Button
              as={Link}
              to={contenidoHero.rutaSecundaria}
              className="btn-inicio-secundario"
            >
              {contenidoHero.botonSecundario}
            </Button>
          </div>
        </div>

        <div className="inicio-hero-icono">
          <i className="bi bi-stars"></i>
        </div>
      </section>

      <div className="inicio-seccion-titulo">
        <h3>Accesos rápidos</h3>
        <p>Selecciona una sección para comenzar a trabajar.</p>
      </div>

      <Row className="g-4">
        {opciones.map((opcion, index) => (
          <Col xs={12} sm={6} lg={4} xl={3} key={opcion.titulo}>
            <Card
              className="inicio-card h-100"
              style={{
                animationDelay: `${index * 0.07}s`,
                animationFillMode: "both",
              }}
            >
              <Card.Body className="p-4">
                <div className="inicio-card-icono">
                  <i className={`bi ${opcion.icono}`}></i>
                </div>

                <h5 className="fw-bold mt-3">{opcion.titulo}</h5>

                <p>{opcion.descripcion}</p>

                <Button
                  as={Link}
                  to={opcion.ruta}
                  className="btn-inicio-card"
                >
                  Abrir
                  <i className="bi bi-arrow-right ms-2"></i>
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Inicio;