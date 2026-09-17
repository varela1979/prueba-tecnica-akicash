# AkiCash — Solicitudes de crédito

Prueba técnica con una API en NestJS, acceso a MySQL mediante Knex Query Builder y una aplicación React con Vite. Permite consultar solicitudes, filtrarlas, paginar resultados y crear solicitudes de crédito. Cuando una solicitud se crea como aprobada, se genera su plan de cuotas dentro de la misma transacción.

## Tecnologías y versiones

Versiones resueltas en los `package-lock.json` de la entrega:

| Tecnología | Versión |
| --- | --- |
| NestJS (`@nestjs/core`) | 11.2.5 |
| Nest CLI | 11.0.24 |
| Knex | 3.3.0 |
| mysql2 | 3.24.4 |
| React / React DOM | 19.3.0 |
| Vite | 8.3.0 |
| TypeScript backend / frontend | 5.9.3 / 6.0.3 |

Entorno de desarrollo utilizado: Node.js 24.14.0, npm 11.9.0 y MySQL Community Server 8.4.11. La interfaz utiliza Tailwind CSS, Radix UI y Motion.

Se mantuvo NestJS en la rama 11 para evitar introducir una migración de versión mayor durante el ejercicio. La versión del CLI es distinta de la del framework. Los archivos de bloqueo permiten reproducir las versiones con `npm ci`.

## Estructura

```text
akicash-backend/
  src/database/           # Conexión Knex, migraciones y seed
  src/loan-applications/  # Controller, service y DTOs
  src/common/             # Validación y utilidades
  test/                   # Pruebas HTTP
  knexfile.ts             # Configuración de migraciones
  queries.sql             # Las tres consultas de la parte 2
akicash-frontend/
  src/api/                # Peticiones y adaptación de respuestas
  src/hooks/              # Consulta y estados de carga/error
  src/components/         # Tabla, filtros, paginación y formulario
  src/types/              # Tipos del dominio
```

No se utiliza ORM. Las consultas de la aplicación y la creación del esquema se realizan con Knex.

## Requisitos previos

- Node.js y npm, preferiblemente las versiones del entorno indicado.
- MySQL Server 8.4 instalado y en ejecución; puerto de desarrollo: `3306`.
- Git para clonar el repositorio, o descargar y descomprimir el ZIP.
- Dos terminales: una para el backend y otra para el frontend.

Los comandos siguientes parten de la carpeta raíz que contiene ambos proyectos. En PowerShell, si la política de ejecución bloquea `npm` o `npx`, utilizar `npm.cmd` o `npx.cmd` respectivamente. No hace falta instalar Nest CLI globalmente.

## 1. Preparar MySQL

Entrar al cliente de MySQL con una cuenta administradora:

```sh
mysql -u root -p
```

En Windows, si `mysql` no está en el PATH, la ruta habitual se puede ejecutar desde PowerShell así:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
```

Dentro de MySQL, ejecutar lo siguiente. Sustituir la contraseña de ejemplo por una propia:

```sql
CREATE DATABASE akicash CHARACTER SET utf8mb4;

CREATE USER 'akicash_app'@'localhost'
IDENTIFIED BY 'REEMPLAZA_CON_TU_CONTRASENA';

GRANT ALL PRIVILEGES ON akicash.* TO 'akicash_app'@'localhost';
EXIT;
```

Los permisos están limitados a la base del ejercicio e incluyen los necesarios para ejecutar migraciones. Si la base o el usuario ya existen, reutilizarlos en lugar de repetir su creación.

## 2. Instalar y configurar el backend

```sh
cd akicash-backend
npm ci
```

Copiar `.env.example` a `.env`. En PowerShell:

```powershell
Copy-Item .env.example .env
```

En macOS/Linux: `cp .env.example .env`. Ajustar el archivo con las credenciales del paso anterior:

```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=akicash_app
DB_PASSWORD="REEMPLAZA_CON_TU_CONTRASENA"
DB_NAME=akicash
PORT=3000
```

El archivo `.env` no se publica. El repositorio incluye únicamente ejemplos sin credenciales reales.

### Crear las tablas y cargar el cliente inicial

Desde `akicash-backend`:

```sh
npx knex --knexfile knexfile.ts migrate:latest
npx knex --knexfile knexfile.ts seed:run
```

Las migraciones crean `client`, `loan_application` e `installment`, con sus claves foráneas. El seed agrega un cliente de demostración; en una base nueva recibe el identificador `1`.

**Ejecutar el seed solo en la base nueva de demostración:** su implementación elimina clientes antes de insertar. Si ya existen solicitudes, las claves foráneas pueden impedir esa eliminación. No es un proceso de actualización de datos ni es necesario repetirlo en cada arranque.

Para consultar el estado de las migraciones:

```sh
npx knex --knexfile knexfile.ts migrate:list
```

### Iniciar la API

```sh
npm run start:dev
```

API: `http://localhost:3000`. La terminal debe permanecer abierta. La ruta del listado es `GET /loan-applications`; no se necesita una página en `/`.

## 3. Instalar e iniciar el frontend

En otra terminal, desde la raíz:

```sh
cd akicash-frontend
npm ci
```

Copiar `.env.example` a `.env` (`Copy-Item .env.example .env` en PowerShell o `cp .env.example .env` en macOS/Linux). Su contenido es:

```dotenv
VITE_API_URL=http://localhost:3000
```

Iniciar la aplicación:

```sh
npm run dev
```

Abrir la dirección que indique Vite, normalmente `http://localhost:5173`. Si cambia el puerto de la API, actualizar `VITE_API_URL` y reiniciar Vite. Las variables `VITE_*` se exponen al navegador: no deben contener secretos.

## Uso

1. Abrir la tabla de solicitudes. Una base recién creada mostrará el estado vacío.
2. Pulsar **Nueva solicitud** y elegir el cliente inicial existente.
3. Introducir un monto positivo, elegir plazo y estado, y enviar.
4. La tabla se vuelve a consultar después de crear la solicitud.
5. Probar los filtros por estado, nombre y fechas, y navegar entre páginas cuando haya más de diez resultados.

El selector de clientes utiliza opciones estáticas de demostración. El seed solo crea el primer cliente; la segunda opción requiere un registro correspondiente en MySQL. Seleccionar un identificador inexistente produce un `404` visible en el formulario. No se implementó un endpoint de listado o gestión de clientes.

## API

### GET /loan-applications

| Parámetro | Uso |
| --- | --- |
| `page` | Página, desde 1. Predeterminado: 1. |
| `limit` | Tamaño de página, entre 1 y 100. Predeterminado: 10. |
| `status` | Opcional: `pending`, `approved` o `rejected`. |
| `from` / `until` | Filtros opcionales sobre `created_at`; la fecha final no puede ser anterior a la inicial. |
| `search` | Búsqueda opcional por nombre del cliente. |

Ejemplo: `http://localhost:3000/loan-applications?page=1&limit=10&status=approved`.

Devuelve `{ data, meta: { page, limit, total } }`, con el nombre del cliente en cada fila. Ordena por `created_at DESC, id DESC` para mostrar primero lo más reciente y desempatar fechas iguales.

### POST /loan-applications

Enviar JSON con encabezado `Content-Type: application/json`:

```json
{
  "client_id": 1,
  "requested_amount": 1000,
  "term_months": 6,
  "status": "approved"
}
```

- `client_id`: entero positivo de un cliente existente.
- `requested_amount`: positivo, con hasta dos decimales y máximo `9999999999.99`, compatible con `DECIMAL(12,2)`.
- `term_months`: uno de `6, 12, 24, 36, 48, 60, 72` (decisión del ejercicio).
- `status`: opcional; se utiliza `pending` si se omite.

Respuesta correcta: `201`, con la solicitud y sus cuotas. Para `pending` y `rejected`, las cuotas están vacías. Entradas inválidas reciben `400`; un cliente inexistente recibe `404` con mensaje claro. Los números del JSON deben enviarse como números, no como texto o booleanos.

## Decisiones de implementación

- **Transacción:** insertar solicitud y cuotas aprobadas utiliza el mismo `trx`; si una inserción falla, Knex revierte la operación.
- **Cuotas:** se distribuye el principal sin intereses, ya que no se especificó una tasa. La última cuota ajusta el residuo del reparto a dos decimales.
- **Vencimientos:** la primera cuota vence el mes siguiente. Se conserva el día de origen y, si no existe en el mes destino, se usa su último día; por ejemplo, enero 31 pasa a febrero 28 o 29, y después a marzo 31.
- **Relaciones:** claves foráneas con `RESTRICT` evitan eliminar clientes con solicitudes y solicitudes con cuotas. No hay desactivación de clientes implementada.
- **Separación:** controller para HTTP, DTOs para validación, servicio para coordinar la operación y método `buildInstallments` para calcular cuotas. En React se separan API, hook de consulta y componentes.
- **Interfaz:** debounce de 400 ms para búsqueda por nombre; al cambiar filtros se vuelve a la primera página. El hook descarta respuestas antiguas para impedir que reemplacen los resultados actuales.
- **Dependencias:** se conserva el override `multer: 2.3.0` utilizado durante el desarrollo. `npm ci` reproduce el árbol fijado sin requerir ejecutar `npm audit fix --force`.

## Parte 2 — Consultas MySQL

Las tres consultas están en [akicash-backend/queries.sql](akicash-backend/queries.sql):

1. Total aprobado por cliente en un rango; incluye un ejemplo para todo 2026 con límite superior exclusivo.
2. Cinco clientes con mayor monto aprobado desde el inicio del año hasta el instante actual.
3. Cuotas vencidas antes de hoy y no pagadas, con cliente y monto.

Para ejecutarlo, abrir MySQL con `mysql -u akicash_app -p akicash` y usar `SOURCE` con la ruta del archivo:
```sql
SOURCE C:/ruta/al/proyecto/akicash-backend/queries.sql;
```

También se pueden ejecutar las tres consultas desde un editor SQL con la base `akicash` seleccionada. No modifican registros.

## Pruebas y comprobaciones

Desde `akicash-backend`:

```sh
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

Hay 4 pruebas unitarias del servicio y 18 pruebas HTTP. Estas últimas utilizan el controller, servicio y validación reales, pero simulan el acceso a datos: cubren creación pendiente y aprobada, cliente inexistente, entradas inválidas y conversión de paginación. **No prueban persistencia ni rollback contra MySQL real.**

Desde `akicash-frontend`:

```sh
npm run build
npm run lint
```


En la revisión de esta entrega, ambas compilaciones y las 22 pruebas del backend pasan. El frontend conserva una advertencia de lint por reiniciar el formulario en un efecto y una advertencia de Vite sobre `__dirname` en su configuración; no bloquean la compilación.

## Preguntas de criterio

### ¿Cuándo usarías una transacción con Knex y dónde la aplicarías?

Usaría una transacción de Knex para guardar la solicitud de crédito y, cuando su estado sea aprobado, sus cuotas en una misma operación. La aplicaría en el servicio, alrededor de ambas inserciones. Si alguna falla, se revierten todos los cambios para evitar una solicitud aprobada con un plan de cuotas incompleto.

### ¿Qué diferencia práctica hay entre un Guard y un Interceptor en NestJS?

Un Guard controla si una petición puede acceder a un endpoint, por ejemplo mediante autenticación o permisos. Un Interceptor permite ejecutar lógica antes y después del controlador, como medir tiempos de respuesta o transformar los datos devueltos. Cumplen responsabilidades distintas; no se implementó autenticación en este ejercicio.

### ¿Qué harías para evitar renders innecesarios de la tabla al escribir en el buscador?

Usé debounce de 400 ms para evitar una petición por cada tecla y React.memo para evitar que la tabla se renderice cuando sus propiedades no cambian. Lo comprobé con un contador: mientras escribía cinco caracteres, antes de ejecutarse la nueva consulta, la tabla no volvió a renderizarse.

## Archivos para GitHub

Versionar ambos proyectos, sus `package.json`, `package-lock.json`, migraciones, consultas, tests y `.env.example`. Los `.gitignore` excluyen `.env`, dependencias, compilaciones y archivos locales de herramientas.

La carpeta raíz debe contener ambos proyectos para que los enlaces relativos de este README funcionen. Antes de publicar, comprobar que ningún `.env` esté versionado; ignorar un archivo no lo elimina del historial si ya fue confirmado anteriormente.
