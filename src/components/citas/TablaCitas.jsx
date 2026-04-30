import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCitas = ({ citas, citaExpandida, setCitaExpandida }) => {
  const obtenerColorEstado = (estado) => {
    if (estado === "pendiente") return "warning";
    if (estado === "completada") return "success";
    if (estado === "cancelada") return "danger";
    return "secondary";
  };

  const calcularTotal = (detalles) => {
    return detalles?.reduce((total, item) => total + Number(item.subtotal || 0), 0) || 0;
  };

  return (
    <div className="tabla-citas-contenedor">
      <Table responsive borderless className="tabla-citas align-middle">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Cliente</th>
            <th>Empleado</th>
            <th>Estado</th>
            <th>Total</th>
            <th className="text-center">Detalles</th>
          </tr>
        </thead>

        <tbody>
          {citas.map((cita) => {
            const estaExpandida = citaExpandida === cita.id_cita;
            const total = calcularTotal(cita.Detalle_cita);

            return (
              <React.Fragment key={cita.id_cita}>
                <tr className="fila-cita">
                  <td>
                    <strong>{cita.fecha}</strong>
                  </td>

                  <td>{cita.hora}</td>

                  <td>
                    {cita.Clientes?.nombre} {cita.Clientes?.apellido}
                  </td>

                  <td>
                    {cita.Empleados?.nombre} {cita.Empleados?.apellido}
                  </td>

                  <td>
                    <Badge bg={obtenerColorEstado(cita.estado_cita)}>
                      {cita.estado_cita}
                    </Badge>
                  </td>

                  <td>
                    <strong>C$ {total.toFixed(2)}</strong>
                  </td>

                  <td className="text-center">
                    <Button
                      size="sm"
                      className="btn-ver-detalle-cita"
                      onClick={() =>
                        setCitaExpandida(estaExpandida ? null : cita.id_cita)
                      }
                    >
                      <i
                        className={
                          estaExpandida
                            ? "bi bi-chevron-up me-1"
                            : "bi bi-chevron-down me-1"
                        }
                      ></i>
                      {estaExpandida ? "Ocultar" : "Ver"}
                    </Button>
                  </td>
                </tr>

                {estaExpandida && (
                  <tr className="fila-detalle-cita">
                    <td colSpan="7">
                      <div className="detalle-cita-box">
                        <h6 className="fw-bold mb-3">
                          <i className="bi bi-receipt-cutoff me-2"></i>
                          Detalle de servicios
                        </h6>

                        {cita.Detalle_cita?.length > 0 ? (
                          <div className="detalle-cita-grid">
                            {cita.Detalle_cita.map((detalle) => (
                              <div
                                className="detalle-servicio-card"
                                key={detalle.id_detalle_cita}
                              >
                                <div>
                                  <strong>
                                    {detalle.Servicios?.nombre || "Servicio"}
                                  </strong>
                                  <p className="mb-0 text-muted small">
                                    Precio base: C${" "}
                                    {Number(detalle.Servicios?.precio || 0).toFixed(2)}
                                  </p>
                                </div>

                                <div className="text-end">
                                  <span>Subtotal</span>
                                  <strong>
                                    C$ {Number(detalle.subtotal || 0).toFixed(2)}
                                  </strong>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted mb-0">
                            Esta cita no tiene servicios registrados.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaCitas;