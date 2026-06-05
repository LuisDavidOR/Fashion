import React, { useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useAuth } from "../context/AuthContext";
import ChatIA from "../components/ia/ChatIA";

const Inicio = () => {
  const { usuario, rol, perfil } = useAuth();
  const [mostrarChatIA, setMostrarChatIA] = useState(false);
  const esInvitado = !usuario;

  const nombreUsuario =
  perfil?.Clientes?.nombre ||
  perfil?.Empleados?.nombre ||
  "";

  const contenidoHeroPorRol = {
    admin: {
      etiqueta: "Sistema de Gestión",
      titulo:
      nombreUsuario
    ? `Bienvenido ${nombreUsuario}`
    : "Bienvenido a Salón Fashion",
      descripcion:
        "Administra la operación del salón con una experiencia moderna, organizada y elegante.",
      botonPrincipal: "Ver Catálogo",
      rutaPrincipal: "/catalogo",
      botonSecundario: "Gestionar Citas",
      rutaSecundaria: "/citas",
    },
    cliente: {
    etiqueta: "Área de Cliente",
    titulo: nombreUsuario
      ? `Bienvenido ${nombreUsuario}`
      : "Bienvenido a tu espacio fashion",
    descripcion:
      "Explora servicios, agenda tus citas y disfruta una experiencia pensada para ti.",
    botonPrincipal: "Ver Catálogo",
    rutaPrincipal: "/catalogo",
    botonSecundario: "Mis Citas",
    rutaSecundaria: "/citas",
  },
    empleado: {
    etiqueta: "Área de Empleado",
    titulo: nombreUsuario
      ? `Bienvenido ${nombreUsuario}`
      : "Bienvenido a tu panel de trabajo fashion",
    descripcion:
      "Consulta tus citas, revisa servicios y acompaña a cada cliente con atención profesional.",
    botonPrincipal: "Ver Citas",
    rutaPrincipal: "/citas",
    botonSecundario: "Ver Catálogo",
    rutaSecundaria: "/catalogo",
  },
    invitado: {
      etiqueta: "Bienvenido",
      titulo: "Descubre Salón Fashion",
      descripcion:
        "Explora nuestros servicios y conoce una experiencia de belleza moderna, cómoda y personalizada.",
      botonPrincipal: "Ver Catálogo",
      rutaPrincipal: "/catalogo",
      botonSecundario: "Iniciar Sesión",
      rutaSecundaria: "/login",
    },
  };

  const contenidoHero = contenidoHeroPorRol[rol] || contenidoHeroPorRol.invitado;

  const serviciosDestacados = [
    {
      titulo: "Cuidado capilar",
      descripcion: "Servicios enfocados en realzar tu estilo y cuidar la salud de tu cabello.",
      icono: "bi-scissors",
      imagen:
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
    },
    {
      titulo: "Manicure y estética",
      descripcion: "Detalles, color y elegancia para complementar tu imagen personal.",
      icono: "bi-stars",
      imagen:
        "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=900&q=80",
    },
    {
      titulo: "Experiencia personalizada",
      descripcion: "Atención cercana, cómoda y adaptada a las necesidades de cada cliente.",
      icono: "bi-heart-fill",
      imagen:
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80",
    },
  ];

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
            className="btn-hero btn-hero-primary"
          >
            {contenidoHero.botonPrincipal}
          </Button>

          {/* SOLO INVITADO */}
          {esInvitado && (
            <Button
              as={Link}
              to="/citas"
              className="btn-hero btn-hero-secondary"
            >
              Agendar cita
            </Button>
          )}

            <Button
            as={Link}
            to={contenidoHero.rutaSecundaria}
            className="btn-hero btn-hero-secondary"
          >
            {contenidoHero.botonSecundario}
          </Button>
          </div>
        </div>

        <div className="inicio-hero-icono">
          <i className="bi bi-stars"></i>
        </div>
      </section>

      <section className="my-5">
        <Row className="align-items-center g-4">
          <Col lg={6}>
            <div className="inicio-seccion-titulo text-start">
              <span className="inicio-etiqueta">Sobre nosotros</span>
              <h3>Belleza, estilo y bienestar en un solo lugar</h3>
              <p>
                Salón Fashion ofrece una experiencia enfocada en el cuidado
                personal, la comodidad y la atención profesional. Nuestro objetivo
                es que cada cliente se sienta bien atendido desde que explora un
                servicio hasta que finaliza su cita.
              </p>
            </div>

            <Row className="g-3 mt-2">
              <Col sm={6}>
                <Card className="inicio-card h-100">
                  <Card.Body className="p-4">
                    <div className="inicio-card-icono">
                      <i className="bi bi-person-heart"></i>
                    </div>
                    <h5 className="fw-bold mt-3">Atención cercana</h5>
                    <p>Nos enfocamos en brindar un trato amable y personalizado.</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col sm={6}>
                <Card className="inicio-card h-100">
                  <Card.Body className="p-4">
                    <div className="inicio-card-icono">
                      <i className="bi bi-gem"></i>
                    </div>
                    <h5 className="fw-bold mt-3">Calidad y detalle</h5>
                    <p>Cuidamos cada servicio para lograr resultados elegantes.</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col lg={6}>
            <div className="rounded-4 overflow-hidden shadow">
              <img
                src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=1200&q=80"
                alt="Interior de salón de belleza"
                className="img-fluid w-100"
                style={{ height: "420px", objectFit: "cover" }}
              />
            </div>
          </Col>
        </Row>
      </section>

      <section className="my-5">
        <div className="inicio-seccion-titulo">
          <span className="inicio-etiqueta">Nuestra experiencia</span>
          <h3>Servicios pensados para resaltar tu estilo</h3>
          <p>
            Combinamos organización, atención profesional y una presentación
            moderna para que cada visita sea más cómoda y especial.
          </p>
        </div>

        <Row className="g-4">
          {serviciosDestacados.map((servicio, index) => (
            <Col md={4} key={servicio.titulo}>
              <Card
                className="inicio-card h-100 overflow-hidden"
                style={{
                  animationDelay: `${index * 0.07}s`,
                  animationFillMode: "both",
                }}
              >
                <img
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  style={{
                    width: "100%",
                    height: "210px",
                    objectFit: "cover",
                  }}
                />

                <Card.Body className="p-4">
                  <div className="inicio-card-icono">
                    <i className={`bi ${servicio.icono}`}></i>
                  </div>

                  <h5 className="fw-bold mt-3">{servicio.titulo}</h5>
                  <p>{servicio.descripcion}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="inicio-hero my-5">
        <div>
          <span className="inicio-etiqueta">Salón Fashion</span>
          
          <h2>Una forma más moderna de vivir la belleza</h2>
          <p>
            Explora nuestro catálogo, conoce los servicios disponibles y disfruta
            una atención organizada desde el primer momento.
          </p>

          <div className="inicio-acciones">
            <Button as={Link} to="/catalogo" className="btn-hero btn-hero-primary">
            Explorar servicios
          </Button>
          </div>
        </div>

        <div className="inicio-hero-icono">
          <i className="bi bi-flower1"></i>
        </div>
      </section>
       {/* Chat IA */}
      <ChatIA
        mostrar={mostrarChatIA}
        onCerrar={() => setMostrarChatIA(false)}
      />

      {/* Botón flotante */}
      <button
       className="rounded-circle shadow-lg border-0"
        onClick={() => setMostrarChatIA(true)}
        style={{
           position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "65px",
    height: "65px",
    zIndex: 9999,
    backgroundColor: "#B38B6D", // café suave
    color: "#fff",
        }}
      >
        <i className="bi bi-robot fs-3"></i>
      </button>
    </Container>
  );
};

export default Inicio;