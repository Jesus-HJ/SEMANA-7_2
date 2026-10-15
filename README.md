# Dashboard de gestión — Semana 07

Aplicación de tareas construida con React y Vite para practicar `useReducer`, `useState`, `useContext`, `useEffect`, `useMemo`, `useCallback`, `useRef` y un hook personalizado. Interfaz en español, adaptable a móvil y con tema claro/oscuro.

## Requisitos

- Node.js 18 o superior
- npm

## Instalación y ejecución

```bash
npm install
npm run dev
```

Comprobaciones incluidas:

```bash
npm run lint
npm run build
```

## Funcionalidad

- Agregar tareas; marcarlas como completadas o pendientes y eliminarlas.
- Filtrar por todas, pendientes o completadas, y ordenar por nombre A–Z / Z–A.
- Las tareas se guardan en `localStorage` bajo `taskflow-tasks` y se recuperan al recargar. El indicador cambia a “Guardado automáticamente” solo después de completar la escritura; los errores se muestran y registran en consola.
- Cambiar el tema claro/oscuro. La preferencia se conserva en `localStorage` y se sincroniza con otras pestañas.
- El hook `useLocalStorage` carga el nuevo valor cuando cambia dinámicamente la clave y limpia el listener de `storage` al desmontarse o cambiar la clave.
- La entrada recibe el foco al abrir la aplicación y después de agregar una tarea.
- Resumen de tareas totales, pendientes y completadas.

## Diagrama de flujo de estado y ciclo de render

```text
Interacción (formulario / filtros / botones)
                  │
                  ▼
          dispatch(action)
                  │
                  ▼
     tasksReducer(state, action)
      ┌───────────┴────────────┐
      │ retorna nuevo estado   │ inmutabilidad
      └───────────┬────────────┘
                  ▼
          render de Dashboard
            ┌─────┴──────┐
            │            │
       useMemo        useContext
 filtra y ordena     tema compartido
            │            │
            ▼            ▼
      TaskList / TaskRow  estilos
            │
  useCallback mantiene estables
  las acciones hacia filas memoizadas

ThemeProvider ── useLocalStorage ── localStorage
                       │
                       ├─ inicializa el tema desde almacenamiento
                       ├─ persiste cambios con useEffect
                       └─ escucha `storage`; cleanup quita el listener

Dashboard ── useReducer(items) ── useEffect ── localStorage
    ▲                                      │
    └────────── carga inicial al montar ────┘

TaskList ── useRef ── input DOM (focus sin render adicional)
         └─ useState ── borrador local del formulario
```

## Justificación técnica de los hooks

- **`useReducer`:** la lista requiere varias transiciones relacionadas (agregar, eliminar, completar, filtrar y ordenar). Centraliza esas reglas en un reducer puro y mantiene las actualizaciones inmutables. `useState` para cada dato y operación repartiría la lógica y sería más difícil de mantener.
- **`useState`:** conserva el borrador del formulario y el estado local de mostrar/ocultar la guía. Son estados de interfaz pequeños e independientes, por lo que no necesitan acciones de reducer global.
- **`useContext`:** el tema se ofrece desde `ThemeProvider` a los controles sin pasar props por todos los niveles. Es adecuado porque esta preferencia cambia ocasionalmente, no en cada pulsación.
- **`useEffect`:** el hook de almacenamiento persiste cambios y registra un listener `storage` para sincronizar pestañas. El cleanup elimina ese listener al desmontar el provider o cambiar la clave, evitando listeners obsoletos.
- **`useMemo`:** calcula la lista filtrada y ordenada a partir de `items`, `filter` y `sort`; evita repetir el procesamiento cuando solo cambia otro estado de UI. La lista se copia antes de ordenar para no mutar el estado del reducer.
- **`useCallback`:** estabiliza handlers que pasan a `TaskList` y sus filas `React.memo`, evitando renders por cambios de identidad de funciones cuando las dependencias no cambian. No se aplica indiscriminadamente a cada función.
- **`useRef`:** apunta al input para devolverle el foco después de agregar una tarea. Cambiar esta referencia no genera un render.
- **Hook personalizado `useLocalStorage`:** encapsula lectura inicial, persistencia, sincronización entre pestañas y actualización funcional del valor. Se reutiliza en el contexto del tema.

## Validación técnica y evidencia solicitada

1. Ejecuta `npm run lint`: la configuración activa `react-hooks` y aplica la regla `exhaustive-deps` para revisar dependencias de efectos y callbacks.
2. Ejecuta `npm run dev`, abre la aplicación y prueba agregar, completar, eliminar, filtrar, ordenar y cambiar tema. Recarga para confirmar la persistencia.
3. Para probar el cleanup: abre la aplicación en una pestaña y cambia `taskflow-theme` desde otra pestaña o desde las herramientas de desarrollo; al cerrar o desmontar la pestaña, el listener `storage` se retira en el cleanup del efecto.
4. En React DevTools, abre **Profiler**, inicia una grabación, agrega una tarea y completa una fila. Revisa los commits y qué componentes renderizaron. `TaskList` y `TaskRow` están memoizados; las callbacks estables evitan renders de filas que no recibieron props nuevas. El cambio de lista sí debe actualizar la fila afectada.
5. Guarda capturas propias de la ejecución, la salida de lint y la grabación de Profiler. Las capturas y la explicación personal son evidencia que debe obtener el alumno en su entorno; no se generan automáticamente desde el código.

## Estructura principal

```text
src/
├── App.jsx
├── components/TaskList.jsx
├── contexts/ThemeContext.jsx
├── hooks/useLocalStorage.js
├── hooks/useTasksReducer.js
├── main.jsx
└── styles.css
```
