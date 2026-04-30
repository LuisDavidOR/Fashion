import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaClientes = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion,
  cambiarEstadoCliente,
}) => {
  return (
    <Table striped borderless hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Teléfono</th>
          <th className="d-none d-lg-table-cell">Correo</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id_cliente}>
            <td>{cliente.id_cliente}</td>
            <td>
              {cliente.nombre} {cliente.apellido}
            </td>
            <td className="d-none d-md-table-cell">{cliente.telefono}</td>
            <td className="d-none d-lg-table-cell">{cliente.correo}</td>

            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(cliente)}
                title="Editar"
              >
                <i className="bi bi-pencil"></i>
              </Button>

              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEliminacion(cliente)}
                title="Eliminar"
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
                className="m-1"
                onClick={() => cambiarEstadoCliente(cliente)}
                title={cliente.estado === "activo" ? "Inactivar" : "Activar"}
              >
                <i
                  className={
                    cliente.estado === "activo"
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

export default TablaClientes;