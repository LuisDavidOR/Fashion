import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const Inicio = () => {
  const opciones = [
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
      titulo: "Usuarios",
      descripcion: "Administra accesos y usuarios del sistema.",
      icono: "bi-person-lock",
      ruta: "/usuarios",
    },
    {
      titulo: "Catálogo",
      descripcion: "Vista elegante para mostrar servicios al cliente.",
      icono: "bi-grid-fill",
      ruta: "/catalogo",
    },
  ];

  return (
    <Container className="inicio-container">
      <section className="inicio-hero">
        <div>
          <span className="inicio-etiqueta">Sistema de Gestión</span>
          <h1>Bienvenido a Salón Fashion</h1>
          <p>
            Administra tu salón de belleza de forma moderna, rápida y elegante.
          </p>

          <div className="inicio-acciones">
            <Button as={Link} to="/catalogo" className="btn-inicio-principal">
              Ver Catálogo
            </Button>

            <Button as={Link} to="/citas" className="btn-inicio-secundario">
              Gestionar Citas
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