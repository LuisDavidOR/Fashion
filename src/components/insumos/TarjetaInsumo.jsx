import React from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaInsumo = ({
  insumos,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoInsumo,
}) => {
  const obtenerEstadoStock = (stock, restante, total) => {
    if (stock === null || stock === undefined) return "Sin stock";

    if (Number(stock) <= 0) return "Agotado";

    const porcentajeRestante =
      total > 0 ? (Number(restante) / Number(total)) * 100 : 0;

    if (porcentajeRestante <= 20) return "Por agotarse";

    if (Number(stock) <= 5) return "Stock bajo";

    return "Disponible";
  };

  const obtenerColorStock = (stock, restante, total) => {
    if (stock === null || stock === undefined) return "secondary";

    if (Number(stock) <= 0) return "danger";

    const porcentajeRestante =
      total > 0 ? (Number(restante) / Number(total)) * 100 : 0;

    if (porcentajeRestante <= 20) return "warning";

    if (Number(stock) <= 5) return "warning";

    return "success";
  };

  return (
    <Row className="g-4">
      {insumos.map((insumo, index) => (
        <Col xs={12} sm={6} lg={4} xl={4} key={insumo.id_insumo}>
          <Card
            className="insumo-card h-100"
            style={{
              animationDelay: `${index * 0.08}s`,
              animationFillMode: "both",
            }}
          >
            <div className="insumo-imagen-contenedor">
              {insumo.url_imagen ? (
                <img
                  src={insumo.url_imagen}
                  alt={insumo.nombre}
                  className="insumo-imagen"
                />
              ) : (
                <div className="insumo-imagen-placeholder">
                  <i className="bi bi-image"></i>
                </div>
              )}

              <Badge
                bg={insumo.estado === "activo" ? "success" : "secondary"}
                className="insumo-badge-estado"
              >
                {insumo.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h5 className="fw-bold mb-0 text-truncate">{insumo.nombre}</h5>

                <Badge
                  bg={obtenerColorStock(
                    insumo.stock,
                    insumo.contenido_restante,
                    insumo.contenido_total
                  )}
                >
                  {obtenerEstadoStock(
                    insumo.stock,
                    insumo.contenido_restante,
                    insumo.contenido_total
                  )}
                </Badge>
              </div>

              <p className="insumo-descripcion">
                {insumo.descripcion || "Sin descripción"}
              </p>

              <div className="insumo-info mb-3">
                <div>
                  <i className="bi bi-cash-coin me-2"></i>
                  Costo: C$ {Number(insumo.costo_producto).toFixed(2)}
                </div>

                <div>
                  <i className="bi bi-calculator me-2"></i>
                  Costo por {insumo.unidad_medida}: C${" "}
                  {(
                    Number(insumo.costo_producto) / Number(insumo.contenido_total)
                  ).toFixed(2)}
                </div>

                <div>
                  <i className="bi bi-box-seam me-2"></i>
                  Contenido total: {insumo.contenido_total} {insumo.unidad_medida}
                </div>

                <div>
                  <i className="bi bi-droplet-half me-2"></i>
                  Restante actual:{" "}
                  {insumo.contenido_restante ?? insumo.contenido_total} {insumo.unidad_medida}
                </div>

                <div>
                  <i className="bi bi-archive me-2"></i>
                  Stock: {insumo.stock ?? "No definido"}
                </div>

                <div className="mt-2">
                  <small className="text-muted d-block mb-1">
                    Uso del envase actual:{" "}
                    {(
                      (Number(insumo.contenido_restante ?? 0) /
                        Number(insumo.contenido_total || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </small>

                  <div
                    style={{
                      height: "8px",
                      backgroundColor: "#e9ecef",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(
                          (
                            (Number(insumo.contenido_restante ?? 0) /
                              Number(insumo.contenido_total || 1)) *
                            100
                          ),
                          100
                        )}%`,
                        height: "100%",
                        backgroundColor:
                          Number(insumo.contenido_restante) /
                            Number(insumo.contenido_total) <=
                          0.2
                            ? "#dc3545"
                            : "#198754",
                        transition: "width 0.3s ease",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => abrirModalEdicion(insumo)}
                  title="Editar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(insumo)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>

                <Button
                  variant={
                    insumo.estado === "activo"
                      ? "outline-secondary"
                      : "outline-success"
                  }
                  size="sm"
                  onClick={() => cambiarEstadoInsumo(insumo)}
                  title={insumo.estado === "activo" ? "Inactivar" : "Activar"}
                >
                  <i
                    className={
                      insumo.estado === "activo"
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

export default TarjetaInsumo;