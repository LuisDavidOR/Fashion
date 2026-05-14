import React from "react";
import { Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCitasResponsive = ({
  citas,
  esEmpleado = false,
  aceptarCita,
  aceptandoCita,
  completarCita,
  completandoCita,
  vistaEmpleado = "disponibles",
  abrirDetalle,
}) => {
  const obtenerColorEstado = (estado) => {
    if (estado === "pendiente") return "warning";
    if (estado === "aceptado") return "primary";
    if (estado === "completada") return "success";
    if (estado === "cancelada") return "danger";
    return "secondary";
  };

  const calcularTotal = (detalles) => {
    return detalles?.reduce((total, item) => total + Number(item.subtotal || 0), 0) || 0;
  };

  const formatearHora = (hora) => {
    if (!hora) return "Sin hora";

    const [h, m] = hora.split(":");
    const fecha = new Date();
    fecha.setHours(Number(h), Number(m));

    return fecha.toLocaleTimeString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const [year, month, day] = fecha.split("-");
    const fechaLocal = new Date(year, month - 1, day);

    return fechaLocal.toLocaleDateString("es-NI", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="tarjetas-citas-responsive">
      {citas.map((cita) => {
        const total = calcularTotal(cita.Detalle_cita);

        return (
          <div className="tarjeta-cita-responsive" key={cita.id_cita}>
            <div className="tarjeta-cita-responsive-header">
              <div>
                <span className="tarjeta-cita-responsive-label">
                  Cita #{cita.id_cita}
                </span>

                <h6>{formatearFecha(cita.fecha)}</h6>

                <p>
                  <i className="bi bi-clock me-1"></i>
                  {formatearHora(cita.hora)}
                </p>
              </div>

              <Badge bg={obtenerColorEstado(cita.estado_cita)}>
                {cita.estado_cita}
              </Badge>
            </div>

            <div className="tarjeta-cita-responsive-info">
              <div>
                <span>Cliente</span>
                <strong>
                  {cita.Clientes?.nombre} {cita.Clientes?.apellido}
                </strong>
              </div>

              <div>
                <span>Empleado</span>
                <strong>
                  {cita.Empleados?.nombre
                    ? `${cita.Empleados.nombre} ${cita.Empleados.apellido}`
                    : "Pendiente"}
                </strong>
              </div>

              <div>
                <span>Total</span>
                <strong>C$ {total.toFixed(2)}</strong>
              </div>
            </div>

            <div className="tarjeta-cita-responsive-servicios">
              {cita.Detalle_cita?.slice(0, 3).map((detalle) => (
                <span key={detalle.id_detalle_cita}>
                  <i className="bi bi-stars me-1"></i>
                  {detalle.Servicios?.nombre || "Servicio"}
                </span>
              ))}

              {cita.Detalle_cita?.length > 3 && (
                <span>+{cita.Detalle_cita.length - 3} más</span>
              )}
            </div>

            <div className="tarjeta-cita-responsive-footer">
              <Button
                size="sm"
                className="btn-ver-detalle-cita"
                onClick={() => abrirDetalle(cita)}
              >
                <i className="bi bi-eye me-1"></i>
                Ver
              </Button>

              {esEmpleado &&
                vistaEmpleado === "disponibles" &&
                cita.estado_cita === "pendiente" &&
                !cita.id_empleado && (
                  <Button
                    size="sm"
                    variant="success"
                    disabled={aceptandoCita === cita.id_cita}
                    onClick={() => aceptarCita(cita)}
                  >
                    {aceptandoCita === cita.id_cita ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Aceptando
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        Aceptar
                      </>
                    )}
                  </Button>
                )}

              {esEmpleado &&
                vistaEmpleado === "asignadas" &&
                cita.estado_cita === "aceptado" && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={completandoCita === cita.id_cita}
                    onClick={() => completarCita(cita)}
                  >
                    {completandoCita === cita.id_cita ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Completando
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check2-circle me-1"></i>
                        Completar
                      </>
                    )}
                  </Button>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TarjetaCitasResponsive;