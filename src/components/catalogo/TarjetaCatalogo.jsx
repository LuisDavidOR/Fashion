import React from "react";
import { Row, Col, Card, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCatalogo = ({ servicios, abrirModalCalificacion }) => {
  const renderEstrellas = (rating) => {
    const estrellas = [];

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        estrellas.push(<i key={i} className="bi bi-star-fill"></i>);
      } else if (i - rating < 1) {
        estrellas.push(<i key={i} className="bi bi-star-half"></i>);
      } else {
        estrellas.push(<i key={i} className="bi bi-star"></i>);
      }
    }

    return estrellas;
  };

  return (
    <Row className="g-4">
      {servicios.map((servicio, index) => (
        <Col xs={12} sm={6} md={4} lg={3} key={servicio.id_servicio}>
          <Card
            className="catalogo-card h-100"
            style={{
              animationDelay: `${index * 0.07}s`,
              animationFillMode: "both",
            }}
          >
            <div className="catalogo-imagen-contenedor">
              {servicio.url_imagen ? (
                <img
                  src={servicio.url_imagen}
                  alt={servicio.nombre}
                  className="catalogo-imagen"
                />
              ) : (
                <div className="catalogo-placeholder">
                  <i className="bi bi-image"></i>
                </div>
              )}
            </div>

            <Card.Body>
              <Badge className="mb-2 catalogo-categoria">
                {servicio.Categorias?.nombre}
              </Badge>

              <h5 className="fw-bold">{servicio.nombre}</h5>

              <p className="catalogo-descripcion">
                {servicio.descripcion || "Sin descripción"}
              </p>

              {/* ⭐ CALIFICACIÓN */}
              <div className="catalogo-rating mb-2">
                {servicio.totalReviews > 0 ? (
                  <>
                    <div className="estrellas">
                      {renderEstrellas(servicio.rating)}
                    </div>
                    <small>
                      {servicio.rating.toFixed(1)} / 5 ({servicio.totalReviews}{" "}
                      reseñas)
                    </small>
                  </>
                ) : (
                  <small className="text-muted">Sin calificaciones</small>
                )}
              </div>

              <div className="catalogo-detalles">
                <div className="catalogo-detalle-item">
                    <i className="bi bi-cash-coin"></i>
                    <div>
                        
                    <span>Precio</span>

                    <strong>C$ {Number(servicio.precio).toFixed(2)}</strong>
                    </div>
                </div>

                <div className="catalogo-detalle-item">
                    <i className="bi bi-clock"></i>
                    <div>

                    <span>Duración</span>
                    <strong>{servicio.duracion} min</strong>
                    </div>
                </div>
                </div>

                <button
                className="btn-calificar-servicio mt-3"
                onClick={() => abrirModalCalificacion(servicio)}
                >
                <i className="bi bi-star-fill me-2"></i>
                Calificar
                </button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TarjetaCatalogo;