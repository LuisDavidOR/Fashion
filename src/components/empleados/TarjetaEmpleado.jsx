import React from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaEmpleado = ({
  empleados,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoEmpleado,
}) => {
  return (
    <Row className="g-4">
      {empleados.map((empleado, index) => (
        <Col xs={12} sm={6} lg={4} xl={3} key={empleado.id_empleado}>
          <Card key={empleado.id_empleado}
                    className="empleado-card h-100"
                    style={{
                        animationDelay: `${index * 0.08}s`,
                        animationFillMode: "both"}}>
            <Card.Body className="text-center p-4">
              <div className="empleado-foto-contenedor mx-auto mb-3">
                {empleado.url_imagen ? (
                  <img
                    src={empleado.url_imagen}
                    alt={`${empleado.nombre} ${empleado.apellido}`}
                    className="empleado-foto"
                  />
                ) : (
                  <div className="empleado-foto-placeholder">
                    <i className="bi bi-person-fill"></i>
                  </div>
                )}
              </div>

              <h5 className="fw-bold mb-1">
                {empleado.nombre} {empleado.apellido}
              </h5>

              <div className="text-muted small mb-2">
                {empleado.especialidad || "Sin especialidad"}
              </div>

              <Badge
                bg={empleado.estado === "activo" ? "success" : "secondary"}
                className="mb-3"
              >
                {empleado.estado === "activo" ? "Activo" : "Inactivo"}
              </Badge>

              <div className="empleado-info text-start mb-3">
                <div>
                  <i className="bi bi-telephone me-2"></i>
                  {empleado.telefono}
                </div>

                <div className="text-truncate">
                  <i className="bi bi-envelope me-2"></i>
                  {empleado.correo}
                </div>

                <div>
                  <i className="bi bi-percent me-2"></i>
                  Comisión: {Number(empleado.comision).toFixed(2)}%
                </div>
              </div>

              <div className="d-flex justify-content-center gap-2">
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => abrirModalEdicion(empleado)}
                  title="Editar"
                >
                  <i className="bi bi-pencil"></i>
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(empleado)}
                  title="Eliminar"
                >
                  <i className="bi bi-trash"></i>
                </Button>

                <Button
                  variant={
                    empleado.estado === "activo"
                      ? "outline-secondary"
                      : "outline-success"
                  }
                  size="sm"
                  onClick={() => cambiarEstadoEmpleado(empleado)}
                  title={empleado.estado === "activo" ? "Inactivar" : "Activar"}
                >
                  <i
                    className={
                      empleado.estado === "activo"
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

export default TarjetaEmpleado;