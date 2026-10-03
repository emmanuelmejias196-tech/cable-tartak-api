# NEXFIBER API

Backend SaaS multi-tenant para empresas ISP/FTTH.

## Módulos base
- Autenticación JWT por empresa
- Empresas/tenants
- Usuarios y roles
- Clientes
- Planes
- Facturación y pagos
- Tickets
- Instalaciones
- Auditoría
- Dashboard

## Desarrollo
1. Copia `.env.example` a `.env`.
2. Configura PostgreSQL y las variables de entorno.
3. Ejecuta `npm ci`.
4. Ejecuta `npm test`.
5. Ejecuta `npm start`.

El arranque crea/actualiza las tablas y, si ADMIN_USERNAME y ADMIN_PASSWORD están configurados, crea el usuario owner inicial.

## Seguridad
No coloques contraseñas reales en Git. Usa variables de entorno/secretos de Render.
