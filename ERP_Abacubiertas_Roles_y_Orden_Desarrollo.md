# Roles, Flujos de Trabajo y Orden de Desarrollo — ERP Abacubiertas S.A.

> Este documento parte del manual de módulos ya definido y responde a la pregunta práctica: **¿por dónde empiezo a programar?** Para eso, primero se describe el flujo de trabajo completo de cada rol (qué hace, en qué orden, con qué pantallas), y al final se propone una secuencia de desarrollo basada en dependencias técnicas reales, no solo en el orden "bonito" de los módulos.

---

## 1. Los roles del sistema

| Rol | Quién es en Abacubiertas | Uso del sistema |
|---|---|---|
| **Administrador** | Gerencia / TI | Configura el sistema, crea usuarios, ve todo |
| **Gerencia general** | Judith Herrera (o quien delegue) | Consulta, aprueba, decide con reportes |
| **Ventas** | Encargados de atención al cliente | Uso diario, alto volumen |
| **Bodega / Inventario** | Encargados de almacén | Uso diario, alto volumen |
| **Compras** | Encargados de abastecimiento | Uso frecuente, no diario |

No se incluye un rol "Cliente" ni "Proveedor" con acceso al sistema — son externos que reciben información (cotización en PDF, orden de compra) pero no entran a la plataforma, según el documento.

---

## 2. Flujo de trabajo completo por rol

### 🔧 Rol: Administrador

1. Inicia sesión con su usuario.
2. Entra al panel de **Administración de usuarios**.
3. Crea un nuevo usuario: nombre, correo, contraseña temporal, **rol asignado** (Ventas, Bodega, Compras, Gerencia).
4. Define parámetros generales del sistema: stock mínimo por defecto, margen de utilidad por defecto para cotizaciones, catálogo inicial de productos y proveedores.
5. Consulta el **log de auditoría** cuando necesita revisar quién hizo un cambio.
6. Desactiva usuarios que ya no trabajan en la empresa.

*Este flujo es el primero que debe existir, porque sin usuarios y roles ningún otro flujo puede probarse de forma realista.*

---

### 📦 Rol: Bodega / Inventario

1. Inicia sesión → ve su **panel de inventario** (no ve cotizaciones ni compras).
2. Consulta el **catálogo de productos** para ver stock actual.
3. Cuando llega mercancía física (por una compra ya aprobada):
   - Busca la orden de compra correspondiente.
   - Registra la **entrada** de inventario (cantidad recibida, fecha, observaciones).
   - El sistema actualiza el stock automáticamente.
4. Cuando se despacha un pedido (por una venta confirmada):
   - El sistema genera la **salida** automáticamente al confirmarse el pedido en Ventas.
   - Bodega puede confirmar que el despacho físico coincide con lo que dice el sistema.
5. Si detecta una diferencia (merma, error de conteo):
   - Hace un **ajuste manual** de inventario, con motivo obligatorio.
6. Revisa la lista de **alertas de stock bajo** y, si es necesario, genera una **solicitud de abastecimiento** hacia Compras.
7. Consulta el **kardex** de un producto si necesita ver su historial.

*Este es el flujo más autosuficiente: no depende de que otros módulos existan para poder probarse (salvo la parte de "salida automática por venta").*

---

### 💬 Rol: Ventas

1. Inicia sesión → ve su **panel de cotizaciones**.
2. Un cliente pide un domo/marquesina. El vendedor:
   - Busca al cliente en el sistema o lo crea si es nuevo.
   - Crea una **nueva cotización**: selecciona producto, ingresa medidas.
   - El sistema calcula materiales necesarios y **consulta el inventario** para saber si hay stock.
   - El sistema calcula el precio automáticamente (materiales + mano de obra + margen).
   - El sistema estima el tiempo de entrega.
   - El vendedor genera el PDF de la cotización y se la envía al cliente.
3. Da seguimiento a la cotización: la marca como Enviada, y luego como Aceptada o Rechazada según la respuesta del cliente.
4. Si el cliente acepta:
   - Convierte la cotización en **pedido/orden de venta**.
   - El sistema **descuenta el inventario** automáticamente.
5. Consulta el **historial del cliente** para dar seguimiento o resolver dudas.
6. Al final del mes, revisa su propio reporte de cotizaciones (cuántas cerró, tasa de conversión).

*Este flujo depende directamente de que Inventarios ya exista (para consultar disponibilidad y descontar stock).*

---

### 📥 Rol: Compras

1. Inicia sesión → ve su **panel de compras**.
2. Revisa las **solicitudes de abastecimiento** generadas por Bodega (automáticas por stock bajo o manuales).
3. Para cada solicitud:
   - Busca proveedores que ofrezcan ese insumo.
   - Registra **cotizaciones de dos o más proveedores** (precio, tiempo de entrega, condiciones).
   - Compara y elige el mejor proveedor.
4. Genera la **orden de compra** con el proveedor elegido.
5. Da seguimiento al estado de la orden (Enviada → en tránsito → recibida parcial/total).
6. Cuando la mercancía llega, coordina con Bodega para que se registre la **entrada** (o la registra él mismo, según cómo se defina el permiso).
7. Consulta su reporte de gasto por proveedor y tiempos de entrega.

*Este flujo depende de que existan Inventarios (para recibir las alertas de stock bajo) y, parcialmente, de Ventas (porque el consumo de material que dispara la necesidad de comprar viene de ahí).*

---

### 📊 Rol: Gerencia general

1. Inicia sesión → ve el **dashboard general** (no un panel de captura de datos).
2. Revisa los KPIs del día: ventas del mes, cotizaciones pendientes, stock crítico, compras pendientes de recibir.
3. Entra al **centro de reportes** cuando necesita tomar una decisión concreta: ver ventas por vendedor, valorización de inventario, gasto por proveedor.
4. Usa la **trazabilidad** para seguir un caso puntual (ej. "¿por qué se retrasó este pedido?").
5. Aprueba órdenes de compra grandes, si esa regla queda activada.
6. Exporta reportes a PDF/Excel para reuniones o para el banco/contador.

*Este flujo es el que menos urge programar primero: depende de que los otros tres módulos ya estén generando datos reales para consolidar algo útil.*

---

## 3. Orden de desarrollo recomendado

La lógica no es "el módulo más importante para el negocio primero", sino **qué módulo puede sostenerse solo y de qué depende cada uno**. Este orden también calza con lo que ya definieron en el Gantt del proyecto (Bloque 1 = base + inventario, Bloque 2 = ventas/compras/admin).

```
Etapa 0 → Autenticación y usuarios (Administrador)
Etapa 1 → Catálogo + Inventarios (Bodega)
Etapa 2 → Clientes + Cotizaciones + Ventas (Ventas)
Etapa 3 → Proveedores + Compras (Compras)
Etapa 4 → Dashboard y Reportes (Gerencia)
Etapa 5 → Pulido: alertas automáticas, trazabilidad cruzada, permisos finos
```

### Por qué en ese orden:

1. **Etapa 0 — Usuarios y login.** Todo lo demás necesita saber "quién está usando el sistema" para aplicar permisos. Es rápido de construir y desbloquea poder probar los siguientes módulos con roles reales.

2. **Etapa 1 — Inventarios.** Es el módulo más independiente: catálogo de productos, entradas/salidas manuales, kardex, alertas de stock. No necesita que Ventas o Compras existan todavía (los movimientos se pueden registrar manualmente mientras tanto). Una vez esté sólido, se convierte en la base que los otros dos módulos van a consultar.

3. **Etapa 2 — Ventas y Cotizaciones.** Ya puede consultar disponibilidad real en Inventarios y descontar stock al confirmar un pedido. Es el módulo con más impacto visible para el cliente (Abacubiertas), así que conviene tenerlo funcionando pronto para mostrar avances.

4. **Etapa 3 — Compras y Proveedores.** Se apoya en las alertas de stock bajo que ya genera Inventarios, y cierra el ciclo (compra → entrada de inventario). Tiene sentido dejarlo para después de Ventas porque, en la práctica, la necesidad de comprar surge del consumo generado por las ventas.

5. **Etapa 4 — Administración y Reportes.** Es el módulo que **consolida** información de los tres anteriores. Construirlo antes no tendría sentido porque no habría datos reales que mostrar; construirlo al final permite probarlo con datos ya generados por el uso normal del sistema.

6. **Etapa 5 — Pulido y automatizaciones.** Alertas automáticas cruzadas (ej. que una venta dispare directamente una solicitud de compra sin pasar por Bodega), afinar permisos por rol, trazabilidad completa punta a punta. Esto es más fácil de hacer bien cuando los cuatro módulos base ya existen y se entiende cómo se comportan juntos.

---

## 4. Checklist de arranque para la Etapa 0 (por dónde literalmente picar código primero)

1. Modelo de datos: tabla `usuarios` (nombre, correo, contraseña encriptada, rol).
2. Endpoint/login con autenticación y manejo de sesión.
3. Middleware de permisos por rol (para poder bloquear pantallas más adelante).
4. Pantalla de login + pantalla vacía de "bienvenida" según el rol que entra.
5. CRUD básico de usuarios (crear, editar, desactivar) solo visible para Administrador.

Una vez esto funcione de punta a punta (crear usuario → loguearse → ver una pantalla distinta según el rol), ya tienes la base para empezar la Etapa 1 (Inventarios) sin reescribir nada.
