import React from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCategoria = ({
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoCategoria,
}) => {
  return (
    <Row className="g-4">
      {categorias.map((categoria, index) => (
        <Col xs={12} sm={6} lg={4} xl={4} key={categoria.id_categoria}>
          <Card
            className="categoria-card h-100"
            style={{
              animationDelay: `${index * 0.08}s`,
              animationFillMode: "both",
            }}
          >
            <div className="categoria-imagen-contenedor">
              {categoria.url_imagen ? (
                <img
                  src={categoria.url_imagen}
                  alt={categoria.nombre}
                  className="categoria-imagen"
                />
              ) : (
                <div className="categoria-imagen-placeholder">
                  <i className="bi bi-bookmark-heart"></i>
                </div>
              )}

              <Badge
                bg={categoria.estado === "activo" ? "success" : "secondary"}
                className="categoria-badge-estado"
              >
                {categoria.estado === "activo" ? "Activa" : "Inactiva"}
              </Badge>
            </div>

            <Card.Body className="p-4">
              <h5 className="fw-bold mb-2 text-truncate">
                {categoria.nombre}
              </h5>

              <p className="categoria-descripcion">
                {categoria.descripcion || "Sin descripción"}
              </p>

              <div className="d-flex justify-content-center gap-2 mt-3">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => abrirModalEdicion(categoria)}
                  title="Editar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(categoria)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>

                <Button
                  variant={
                    categoria.estado === "activo"
                      ? "outline-secondary"
                      : "outline-success"
                  }
                  size="sm"
                  onClick={() => cambiarEstadoCategoria(categoria)}
                  title={
                    categoria.estado === "activo" ? "Inactivar" : "Activar"
                  }
                >
                  <i
                    className={
                      categoria.estado === "activo"
                        ? "bi bi-toggle-off"
                        : "bi bi-toggle-on"
                    }
                  ></i>
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TarjetaCategoria;