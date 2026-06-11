import React from "react";
import { Container, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "../App.css";

const Pagina404 = () => {
  const navigate = useNavigate();

  return (
    <div className="pagina-404-contenedor">
      <div className="fondo-iconos">
        <i className="bi bi-stars decoracion decoracion1"></i>
        <i className="bi bi-scissors decoracion decoracion2"></i>
        <i className="bi bi-heart-fill decoracion decoracion3"></i>
        <i className="bi bi-flower1 decoracion decoracion4"></i>
        <i className="bi bi-brush decoracion decoracion5"></i>
        <i className="bi bi-droplet-fill decoracion decoracion6"></i>
      </div>

      <Container className="d-flex justify-content-center align-items-center min-vh-100 px-3">
        <Card className="pagina-404-card text-center border-0 shadow-lg">
          <Card.Body className="p-4 p-md-5">
            <img src={logo} alt="Fashion Logo" className="pagina-404-logo" />

            <div className="pagina-404-numero">404</div>

            <h1 className="pagina-404-titulo">
              Página no encontrada
            </h1>

            <p className="pagina-404-texto">
              La dirección que ingresaste no existe o fue movida dentro del sistema Fashion.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 mt-4">
              <Button
                className="pagina-404-btn-principal"
                onClick={() => navigate("/")}
              >
                <i className="bi-house-door me-2"></i>
                Ir al inicio
              </Button>

              <Button
                variant="outline-secondary"
                className="pagina-404-btn-secundario"
                onClick={() => navigate(-1)}
              >
                <i className="bi-arrow-left me-2"></i>
                Regresar
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Pagina404;