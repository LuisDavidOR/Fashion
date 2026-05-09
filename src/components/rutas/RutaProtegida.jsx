import React from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const RutaProtegida = ({ children, rolesPermitidos = [] }) => {
  const { usuario, perfil, rol, cargando } = useAuth();

  if (cargando) {
    return <h3>Cargando...</h3>;
  }

  // Si no hay sesión
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si hay sesión, pero NO existe en tabla Usuarios
  if (!perfil) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles y el rol no coincide
  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(rol)
  ) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;