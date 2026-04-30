import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCliente = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoCliente,
}) => {
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
  };

  return (
    <>
      <div>
        {clientes.map((cliente) => {
          const tarjetaActiva = idTarjetaActiva === cliente.id_cliente;

          return (
            <Card
              key={cliente.id_cliente}
              className="mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-categoria-contenedor"
              onClick={() => alternarTarjetaActiva(cliente.id_cliente)}
              tabIndex={0}
              onKeyDown={(evento) => {
                if (evento.key === "Enter" || evento.key === " ") {
                  evento.preventDefault();
                  alternarTarjetaActiva(cliente.id_cliente);
                }
              }}
              aria-label={`Cliente ${cliente.nombre} ${cliente.apellido}`}
            >
              <Card.Body
                className={`p-2 tarjeta-categoria-cuerpo ${
                  tarjetaActiva
                    ? "tarjeta-categoria-cuerpo-activo"
                    : "tarjeta-categoria-cuerpo-inactivo"
                }`}
              >
                <Row className="align-items-center gx-3">
                  <Col xs={2} className="px-2">
                    <div className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-categoria-placeholder-imagen">
                      <i className="bi bi-person text-muted fs-3"></i>
                    </div>
                  </Col>

                  <Col xs={8} className="text-start">
                    <div className="fw-semibold text-truncate">
                      {cliente.nombre} {cliente.apellido}
                    </div>

                    <div className="small text-muted text-truncate">
                      {cliente.telefono}
                    </div>

                    <div className="small text-muted text-truncate">
                      {cliente.correo}
                    </div>
                  </Col>
                </Row>
              </Card.Body>

              {tarjetaActiva && (
                <div
                  role="dialog"
                  aria-modal="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdTarjetaActiva(null);
                  }}
                  className="tarjeta-categoria-capa"
                >
                  <div
                    className="d-flex gap-2 tarjeta-categoria-botones-capa"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => {
                        abrirModalEdicion(cliente);
                        setIdTarjetaActiva(null);
                      }}
                      aria-label={`Editar ${cliente.nombre}`}
                    >
                      <i className="bi bi-pencil"></i>
                    </Button>

                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        abrirModalEliminacion(cliente);
                        setIdTarjetaActiva(null);
                      }}
                      aria-label={`Eliminar ${cliente.nombre}`}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>

                    <Button
                      variant={
                        cliente.estado === "activo"
                          ? "outline-secondary"
                          : "outline-success"
                      }
                      size="sm"
                      onClick={() => {
                        cambiarEstadoCliente(cliente);
                        setIdTarjetaActiva(null);
                      }}
                      aria-label={
                        cliente.estado === "activo"
                          ? `Inactivar ${cliente.nombre}`
                          : `Activar ${cliente.nombre}`
                      }
                    >
                      <i
                        className={
                          cliente.estado === "activo"
                            ? "bi bi-toggle-off"
                            : "bi bi-toggle-on"
                        }
                      ></i>
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default TarjetaCliente;