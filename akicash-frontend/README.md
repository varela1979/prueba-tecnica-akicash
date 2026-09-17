# AkiCash — Frontend

Aplicación React con Vite para consultar, filtrar y crear solicitudes de crédito.

La guía completa de instalación y las respuestas de criterio están en el [README principal](../README.md).

## Inicio local

Desde esta carpeta:

```sh
npm ci
```

Copiar `.env.example` a `.env` y configurar `VITE_API_URL=http://localhost:3000`. Iniciar primero la API siguiendo la guía principal y luego ejecutar:

```sh
npm run dev
```

Abrir la URL indicada por Vite, normalmente `http://localhost:5173`.

## Verificación

```sh
npm run build
npm run lint
```

El selector de clientes contiene opciones estáticas de demostración; usar un identificador existente en MySQL. No hay una suite automatizada de pruebas del frontend.
