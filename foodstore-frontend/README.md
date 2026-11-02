# Food Store — Frontend (administración del catálogo)

Aplicación **React + TypeScript** creada con **Vite** y estilada con **Tailwind CSS 4** para administrar los productos del catálogo de Food Store: alta, edición, cambio de disponibilidad y anulación.

## Requisitos

- Node.js 20.19 o superior (o 22.12+)
- Backend `foodstore-backend` en ejecución en `http://localhost:8000` (ver su README)

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abrir http://localhost:5173

> El puerto 5173 está fijado en `vite.config.ts` porque es el origen habilitado en el CORS del backend. Si el puerto está ocupado, Vite muestra un error en lugar de cambiar de puerto.

Otros comandos:

```bash
npm run build     # verificación de tipos (strict) + build de producción en dist/
npm run preview   # sirve el build de producción
```

## Configuración

La URL de la API se toma de la variable `VITE_API_URL`; si no está definida, se usa `http://localhost:8000/api/v1`. Para cambiarla, copiar `.env.example` a `.env` y editarla (hay que reiniciar `npm run dev`):

```ts
const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
```

Sin `.env` la aplicación funciona igual con el backend local.

El listado pide hasta 50 productos (`limit=50`, el máximo que admite la API).

## Funcionalidades

- Listado de productos traído desde la API, con precio y stock acompañados del símbolo de la unidad (`$ 12,50 / kg`, `stock: 3,5 kg`) e indicadores de **disponible** y **hay_stock**.
- **Nuevo producto**: modal con el formulario vacío y el selector de unidad de venta cargado desde `GET /api/v1/unidades-medida`.
- **Editar**: el mismo modal con los datos del producto. Un error de la API (por ejemplo, 409 por nombre repetido) se muestra dentro del modal sin cerrarlo.
- **Disponibilidad**: pausa o reanuda la venta (`PUT` con `disponible` invertido).
- **Anular**: baja lógica (`DELETE`) previa confirmación en un diálogo.
- Estados de carga, de error (con reintento) y de lista vacía.

## Estructura

```
src/
├── components/
│   ├── Navbar.tsx          # barra de navegación con el botón de alta
│   ├── ProductoList.tsx    # recibe Producto[] por props y lo renderiza con .map()
│   ├── ProductoCard.tsx    # tarjeta: precio, stock, indicadores y acciones
│   ├── ProductoModal.tsx   # modal de alta / edición (estado del formulario con useState)
│   ├── ConfirmDialog.tsx   # diálogo de confirmación de la anulación
│   ├── Button.tsx          # botón reutilizable con variantes y tamaños
│   ├── Modal.tsx           # ventana modal accesible (título, Escape, role dialog / alertdialog)
│   ├── Alert.tsx           # aviso de error con role="alert" y botón Cerrar opcional
│   └── Field.tsx           # etiqueta + control + ayuda, vinculados por id y aria-describedby
├── types/
│   ├── producto.ts         # Producto y ProductoPayload
│   ├── unidadMedida.ts     # UnidadMedida
│   └── categoria.ts        # Categoria y CategoriaDeProducto
├── vite-env.d.ts           # tipo de VITE_API_URL
├── App.tsx                 # estado del catálogo (useState/useEffect) y llamadas fetch
├── main.tsx
└── index.css               # @import "tailwindcss"
```

## Decisiones de diseño

- **Estado elevado**: todo el estado del catálogo y todas las llamadas a la API viven en `App.tsx`. Los componentes hijos reciben los datos por props tipadas y comunican las acciones mediante funciones recibidas por props; ninguno consulta la API por su cuenta.
- **Componentes reutilizables** (`Button`, `Modal`, `Alert`, `Field`): solo reciben props tipadas y no consultan la API.
- **Solo `fetch` nativo**, `useState` y `useEffect`: sin Axios, TanStack Query, Zustand ni librerías de formularios o de componentes.
- **TypeScript estricto** (`"strict": true` en `tsconfig.app.json`) y sin `any`. Las interfaces de `src/types/` usan los mismos nombres de campo que la API.
