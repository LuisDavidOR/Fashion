import React from "react";
import { Card } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCatalogo = ({
  servicios,
  abrirModalCalificacion,
  abrirModalDetalle,
  rol,
  perfil,
}) => {
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
    <>
      {servicios.map((servicio, index) => {
        const miCalificacion =
          rol === "cliente" &&
          servicio.calificaciones?.find(
            (calificacion) =>
              Number(calificacion.id_cliente) === Number(perfil?.id_cliente)
          );

        return (
          <Card
            key={servicio.id_servicio}
            className="catalogo-card h-100"
            onClick={() => abrirModalDetalle(servicio)}
            style={{
              animationDelay: `${index * 0.07}s`,
              animationFillMode: "both",
              cursor: "pointer",
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
              <h5 className="fw-bold">{servicio.nombre}</h5>

              <p className="catalogo-descripcion">
                {servicio.descripcion || "Sin descripción"}
              </p>

              <div className="catalogo-rating mb-2">
                {servicio.totalReviews > 0 ? (
                  <>
                    <div className="estrellas">
                      {renderEstrellas(servicio.rating)}
                    </div>
                    <small>
                      {servicio.rating.toFixed(1)} / 5 (
                      {servicio.totalReviews} reseñas)
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

              {rol !== "admin" && rol !== "empleado" && (
                <button
                  className="btn-calificar-servicio mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    abrirModalCalificacion(servicio);
                  }}
                >
                  <i className="bi bi-star-fill me-2"></i>
                  {miCalificacion ? "Editar mi calificación" : "Calificar"}
                </button>
              )}
            </Card.Body>
          </Card>
        );
      })}
    </>
  );
};

export default TarjetaCatalogo;