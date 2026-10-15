import React, { memo, useCallback, useEffect, useRef, useState } from 'react'

const TaskRow = memo(function TaskRow({ task, onRemove, onToggle }) {
  const handleToggle = useCallback(() => onToggle(task.id), [onToggle, task.id])
  const handleRemove = useCallback(() => onRemove(task.id), [onRemove, task.id])

  return (
    <li className={`task-row${task.completed ? ' is-complete' : ''}`}>
      <button
        className="task-check"
        type="button"
        aria-label={task.completed ? `Reabrir ${task.title}` : `Completar ${task.title}`}
        aria-pressed={task.completed}
        onClick={handleToggle}
      >
        {task.completed ? '✓' : ''}
      </button>
      <span className="task-title">{task.title}</span>
      <span className="task-date">{task.createdAt}</span>
      <button
        className="icon-button remove-button"
        type="button"
        aria-label={`Eliminar ${task.title}`}
        onClick={handleRemove}
      >
        ×
      </button>
    </li>
  )
})

const TaskList = memo(function TaskList({ tasks, onAdd, onRemove, onToggle }) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    const title = draft.trim()
    if (!title) {
      inputRef.current?.focus()
      return
    }

    onAdd(title)
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <>
      <form className="add-task-form" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="new-task">Nueva tarea</label>
        <span className="input-plus" aria-hidden="true">+</span>
        <input
          id="new-task"
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="¿Qué necesitas hacer?"
          autoComplete="off"
        />
        <button className="primary-button" type="submit">Agregar tarea</button>
      </form>

      {tasks.length > 0 ? (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onRemove={onRemove}
              onToggle={onToggle}
            />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="empty-icon" aria-hidden="true">✓</span>
          <strong>Todo está al día</strong>
          <p>No hay tareas en esta vista. Agrega una nueva para comenzar.</p>
        </div>
      )}
    </>
  )
})

export default TaskList
