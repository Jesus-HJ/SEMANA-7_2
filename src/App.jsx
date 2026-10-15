import React, { useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import TaskList from './components/TaskList.jsx'
import { ThemeContext, ThemeProvider } from './contexts/ThemeContext.jsx'
import tasksReducer, { initialState, taskActions } from './hooks/useTasksReducer.js'

const TASKS_STORAGE_KEY = 'taskflow-tasks'

const isStoredTask = (task) => (
  task !== null
  && typeof task === 'object'
  && typeof task.id === 'string'
  && typeof task.title === 'string'
  && typeof task.completed === 'boolean'
  && typeof task.createdAt === 'string'
)

const loadInitialState = () => {
  try {
    const storedTasks = window.localStorage.getItem(TASKS_STORAGE_KEY)
    if (storedTasks === null) return initialState

    const items = JSON.parse(storedTasks)
    if (!Array.isArray(items) || !items.every(isStoredTask)) {
      throw new TypeError('Los datos guardados no tienen el formato esperado.')
    }

    return { ...initialState, items }
  } catch (error) {
    console.error('No se pudieron cargar las tareas desde localStorage.', error)
    return initialState
  }
}

const filters = [
  { value: 'all', label: 'Todas' },
  { value: 'active', label: 'Pendientes' },
  { value: 'completed', label: 'Completadas' },
]

function Dashboard() {
  const [state, dispatch] = useReducer(tasksReducer, undefined, loadInitialState)
  const [showHelp, setShowHelp] = useState(false)
  const [saveStatus, setSaveStatus] = useState('saving')
  const { theme, toggleTheme } = useContext(ThemeContext)

  useEffect(() => {
    try {
      window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(state.items))
      setSaveStatus('saved')
    } catch (error) {
      console.error('No se pudieron guardar las tareas en localStorage.', error)
      setSaveStatus('error')
    }
  }, [state.items])

  const visibleTasks = useMemo(() => {
    const filtered = state.items.filter((task) => {
      if (state.filter === 'active') return !task.completed
      if (state.filter === 'completed') return task.completed
      return true
    })

    return [...filtered].sort((left, right) => {
      const comparison = left.title.localeCompare(right.title, 'es', {
        sensitivity: 'base',
      })
      return state.sort === 'asc' ? comparison : -comparison
    })
  }, [state.items, state.filter, state.sort])

  const addTask = useCallback((title) => {
    setSaveStatus('saving')
    dispatch({
      type: taskActions.ADD,
      payload: {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        title,
        completed: false,
        createdAt: new Intl.DateTimeFormat('es', {
          day: '2-digit',
          month: 'short',
        }).format(new Date()),
      },
    })
  }, [])

  const removeTask = useCallback((id) => {
    setSaveStatus('saving')
    dispatch({ type: taskActions.REMOVE, payload: id })
  }, [])

  const toggleTask = useCallback((id) => {
    setSaveStatus('saving')
    dispatch({ type: taskActions.TOGGLE, payload: id })
  }, [])

  const setFilter = useCallback((filter) => {
    dispatch({ type: taskActions.FILTER, payload: filter })
  }, [])

  const toggleSort = useCallback(() => {
    dispatch({
      type: taskActions.SORT,
      payload: state.sort === 'asc' ? 'desc' : 'asc',
    })
  }, [state.sort])

  const pendingCount = state.items.filter((task) => !task.completed).length
  const completedCount = state.items.length - pendingCount

  return (
    <main className={`app-shell theme-${theme}`}>
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Taskflow inicio">
          <span className="brand-mark">t</span>
          <span>taskflow<span className="brand-period">.</span></span>
        </a>

        <div className="sidebar-section-label">ESPACIO DE TRABAJO</div>
        <button className="nav-item active" type="button">
          <span className="nav-icon">▦</span> Mis tareas
          <span className="nav-count">{state.items.length}</span>
        </button>

        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-copy"><strong>Alumno</strong><span>Mi espacio</span></div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Espacio de trabajo <span>/</span> Mis tareas</div>
          <div className="topbar-actions">
            <button
              className="icon-button theme-button"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activar tema oscuro' : 'Activar tema claro'}
              title="Cambiar tema"
            >
              {theme === 'light' ? '☾' : '☀'}
            </button>
            <div className="avatar top-avatar">A</div>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> TU PRODUCTIVIDAD, EN UN SOLO LUGAR</div>
              <h1>Mis tareas<span className="heading-period">.</span></h1>
              <p className="page-subtitle">Organiza tus pendientes y enfócate en lo que importa.</p>
            </div>
            <button
              className="help-button"
              type="button"
              onClick={() => setShowHelp((current) => !current)}
              aria-expanded={showHelp}
            >
              <span>?</span> Guía rápida
            </button>
          </div>

          {showHelp && (
            <div className="help-panel">
              Agrega una tarea, márcala como completada con el círculo y usa los filtros para organizar tu lista.
            </div>
          )}

          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon total-icon">▤</span>
              <span className="stat-label">TOTAL DE TAREAS</span>
              <strong className="stat-value">{state.items.length}</strong>
              <span className="stat-caption">en tu lista</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon pending-icon">◷</span>
              <span className="stat-label">POR COMPLETAR</span>
              <strong className="stat-value">{pendingCount}</strong>
              <span className="stat-caption">un paso a la vez</span>
            </article>
            <article className="stat-card">
              <span className="stat-icon done-icon">✓</span>
              <span className="stat-label">COMPLETADAS</span>
              <strong className="stat-value">{completedCount}</strong>
              <span className="stat-caption">¡buen trabajo!</span>
            </article>
          </div>

          <section className="tasks-card">
            <div className="tasks-card-heading">
              <div>
                <h2>Tu lista</h2>
                <p>Tus tareas, organizadas a tu manera.</p>
              </div>
              <button className="sort-button" type="button" onClick={toggleSort}>
                <span>↕</span> Nombre {state.sort === 'asc' ? 'A–Z' : 'Z–A'}
              </button>
            </div>

            <div className="filter-bar" role="tablist" aria-label="Filtrar tareas">
              {filters.map((filter) => (
                <button
                  className={`filter-tab${state.filter === filter.value ? ' selected' : ''}`}
                  key={filter.value}
                  type="button"
                  role="tab"
                  aria-selected={state.filter === filter.value}
                  onClick={() => setFilter(filter.value)}
                >
                  {filter.label}
                  {filter.value === 'all' && <span className="filter-count">{state.items.length}</span>}
                </button>
              ))}
            </div>

            <div className="task-content">
              <TaskList
                tasks={visibleTasks}
                onAdd={addTask}
                onRemove={removeTask}
                onToggle={toggleTask}
              />
            </div>
            <footer className="tasks-footer">
              <span>Mostrando <strong>{visibleTasks.length}</strong> de <strong>{state.items.length}</strong> tareas</span>
              <span aria-live="polite">
                <span className={`sync-dot${saveStatus === 'error' ? ' sync-error' : ''}`} />
                {saveStatus === 'saving'
                  ? 'Guardando...'
                  : saveStatus === 'error'
                    ? 'No se pudieron guardar las tareas'
                    : 'Guardado automáticamente'}
              </span>
            </footer>
          </section>

          <footer className="page-footer">
            <span>Hecho para enfocarte en lo que sigue.</span>
            <button
              className="footer-theme"
              type="button"
              onClick={toggleTheme}
            >
              <span>{theme === 'light' ? '☾' : '☀'}</span> Tema {theme === 'light' ? 'oscuro' : 'claro'}
            </button>
          </footer>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}
