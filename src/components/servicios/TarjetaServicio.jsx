import React from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaServicio = ({
  servicios,
  abrirModalEdicion,
  abrirModalEliminacion,
  abrirModalInsumos,
  cambiarEstadoServicio,
  generarPDFServicio,
}) => {
  return (
    <Row className="g-4">
      {servicios.map((servicio, index) => {
        const costoTotalInsumos =
          servicio.Servicio_Insumo?.reduce((total, relacion) => {

            const insumo = relacion.Insumos;

            if (!insumo || !insumo.contenido_total) return total;

            const costoPorUnidad =
              Number(insumo.costo_producto) /
              Number(insumo.contenido_total);

            const costoUsado =
              costoPorUnidad *
              Number(relacion.cantidad_usada);

            return total + costoUsado;

          }, 0) || 0;

        return (
          <Col xs={12} sm={6} lg={4} xl={4} key={servicio.id_servicio}>
            <Card
              className="servicio-card h-100"
              style={{
                animationDelay: `${index * 0.08}s`,
                animationFillMode: "both",
              }}
            >
              <div className="servicio-imagen-contenedor">
                {servicio.url_imagen ? (
                  <img
                    src={servicio.url_imagen}
                    alt={servicio.nombre}
                    className="servicio-imagen"
                  />
                ) : (
                  <div className="servicio-imagen-placeholder">
                    <i className="bi bi-image"></i>
                  </div>
                )}

                <Badge
                  bg={servicio.estado === "activo" ? "success" : "secondary"}
                  className="servicio-badge-estado"
                >
                  {servicio.estado === "activo" ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <Card.Body className="p-4">
                <div className="mb-2">
                  <span className="servicio-categoria">
                    {servicio.Categorias?.nombre || "Sin categoría"}
                  </span>
                </div>

                <h5 className="fw-bold mb-2 text-truncate">
                  {servicio.nombre}
                </h5>

                <p className="servicio-descripcion">
                  {servicio.descripcion || "Sin descripción"}
                </p>

                <div className="servicio-info mb-3">
                  <div>
                    <i className="bi bi-cash-coin me-2"></i>
                    C$ {Number(servicio.precio).toFixed(2)}
                  </div>

                  <div>
                    <i className="bi bi-clock me-2"></i>
                    {servicio.duracion} minutos
                  </div>
                  <div>
                    <i className="bi bi-box-seam me-2"></i>
                    {servicio.Servicio_Insumo?.length || 0} insumo
                    {(servicio.Servicio_Insumo?.length || 0) !== 1 ? "s" : ""} asignado
                    {(servicio.Servicio_Insumo?.length || 0) !== 1 ? "s" : ""}
                  </div>
                  <div>
                    <i className="bi bi-calculator me-2"></i>
                    Costo insumos: C$ {costoTotalInsumos.toFixed(2)}
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-2">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    onClick={() => abrirModalEdicion(servicio)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(servicio)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>

                  <Button
                    variant={
                      servicio.estado === "activo"
                        ? "outline-secondary"
                        : "outline-success"
                    }
                    size="sm"
                    onClick={() => cambiarEstadoServicio(servicio)}
                    title={servicio.estado === "activo" ? "Inactivar" : "Activar"}
                  >
                    <i
                      className={
                        servicio.estado === "activo"
                          ? "bi bi-toggle-off"
                          : "bi bi-toggle-on"
                      }
                    ></i>
                  </Button>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => abrirModalInsumos(servicio)}
                    title="Insumos"
                  >
                    <i className="bi bi-box-seam"></i>
                  </Button>
                  <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => generarPDFServicio(servicio)}
                  title="Generar PDF"
                >
                  <i className="bi bi-file-earmark-pdf"></i>
                </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default TarjetaServicio;