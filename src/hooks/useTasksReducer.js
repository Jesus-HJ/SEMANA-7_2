export const initialState = {
  items: [],
  filter: 'all',
  sort: 'asc',
}

export const taskActions = {
  ADD: 'ADD',
  REMOVE: 'REMOVE',
  TOGGLE: 'TOGGLE',
  FILTER: 'FILTER',
  SORT: 'SORT',
}

function tasksReducer(state, action) {
  switch (action.type) {
    case taskActions.ADD:
      return { ...state, items: [action.payload, ...state.items] }
    case taskActions.REMOVE:
      return {
        ...state,
        items: state.items.filter((task) => task.id !== action.payload),
      }
    case taskActions.TOGGLE:
      return {
        ...state,
        items: state.items.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task,
        ),
      }
    case taskActions.FILTER:
      return ['all', 'active', 'completed'].includes(action.payload)
        ? { ...state, filter: action.payload }
        : state
    case taskActions.SORT:
      return ['asc', 'desc'].includes(action.payload)
        ? { ...state, sort: action.payload }
        : state
    default:
      return state
  }
}

export default tasksReducer
