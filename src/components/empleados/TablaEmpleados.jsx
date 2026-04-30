import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaEmpleados = ({
  empleados,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoEmpleado,
}) => {
  return (
    <Table striped borderless hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Foto</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Teléfono</th>
          <th className="d-none d-lg-table-cell">Especialidad</th>
          <th className="d-none d-lg-table-cell">Comisión</th>
          <th className="d-none d-xl-table-cell">Correo</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {empleados.map((empleado) => (
          <tr key={empleado.id_empleado}>
            <td>{empleado.id_empleado}</td>

            <td>
              {empleado.url_imagen ? (
                <img
                  src={empleado.url_imagen}
                  alt={`${empleado.nombre} ${empleado.apellido}`}
                  style={{
                    width: "45px",
                    height: "45px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <i className="bi bi-person-circle text-muted fs-3"></i>
              )}
            </td>

            <td>
              {empleado.nombre} {empleado.apellido}
            </td>

            <td className="d-none d-md-table-cell">{empleado.telefono}</td>

            <td className="d-none d-lg-table-cell">
              {empleado.especialidad || "Sin especialidad"}
            </td>

            <td className="d-none d-lg-table-cell">
              {Number(empleado.comision).toFixed(2)}%
            </td>

            <td className="d-none d-xl-table-cell">{empleado.correo}</td>

            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(empleado)}
                title="Editar"
              >
                <i className="bi bi-pencil"></i>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
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
                className="m-1"
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
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaEmpleados;