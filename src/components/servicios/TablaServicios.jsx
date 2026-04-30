import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaServicios = ({
  servicios,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoServicio,
}) => {
  return (
    <Table striped borderless hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Duración</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {servicios.map((servicio) => (
          <tr key={servicio.id_servicio}>
            <td>{servicio.id_servicio}</td>

            <td>
              {servicio.url_imagen ? (
                <img
                  src={servicio.url_imagen}
                  alt={servicio.nombre}
                  style={{
                    width: "55px",
                    height: "55px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              ) : (
                <i className="bi bi-image text-muted fs-3"></i>
              )}
            </td>

            <td>{servicio.nombre}</td>

            <td>{servicio.Categorias?.nombre || "Sin categoría"}</td>

            <td>C$ {Number(servicio.precio).toFixed(2)}</td>

            <td>{servicio.duracion} min</td>

            <td className="d-none d-md-table-cell">
              {servicio.descripcion || "Sin descripción"}
            </td>

            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(servicio)}
                title="Editar"
              >
                <i className="bi bi-pencil"></i>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
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
                className="m-1"
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
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaServicios;