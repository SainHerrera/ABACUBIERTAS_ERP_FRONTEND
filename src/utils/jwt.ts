import type { User, UserRole } from '../types/auth';

export function getCurrentUserFromToken(accessToken: string): User | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    const email = payload.email || (typeof payload.sub === 'string' && payload.sub.includes('@') ? payload.sub : '');
    const rol: UserRole = payload.rol || payload.role || 'admin';
    const id =
      typeof payload.id === 'number'
        ? payload.id
        : typeof payload.id_usuario === 'number'
          ? payload.id_usuario
          : typeof payload.sub === 'number'
            ? payload.sub
            : Number(payload.id || payload.id_usuario) || 1;

    if (!email || !rol) return null;

    return {
      id_usuario: id,
      email: email,
      nombre: payload.nombre || (email.includes('@') ? email.split('@')[0] : 'Administrador'),
      rol: rol,
      activo: payload.activo !== undefined ? Boolean(payload.activo) : true,
    };
  } catch {
    return null;
  }
}

