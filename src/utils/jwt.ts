import type { User } from '../types/auth';

export function getCurrentUserFromToken(accessToken: string): User | null {
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    if (!payload.sub || !payload.rol) return null;
    return {
      id_usuario: parseInt(payload.sub, 10),
      email: payload.email || payload.sub + '@temp.com',
      nombre: payload.nombre || payload.rol || 'Usuario',
      rol: payload.rol,
      activo: true,
    };
  } catch {
    return null;
  }
}
