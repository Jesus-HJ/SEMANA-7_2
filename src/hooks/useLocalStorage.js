import { useCallback, useEffect, useState } from 'react'

const readStoredValue = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue

  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue === null ? defaultValue : JSON.parse(storedValue)
  } catch (error) {
    console.error(`No se pudo leer "${key}" desde localStorage.`, error)
    return defaultValue
  }
}

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => readStoredValue(key, defaultValue))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`No se pudo guardar "${key}" en localStorage.`, error)
    }
  }, [key, value])

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        setValue(readStoredValue(key, defaultValue))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, defaultValue])

  const updateValue = useCallback((nextValue) => {
    setValue((currentValue) =>
      typeof nextValue === 'function' ? nextValue(currentValue) : nextValue,
    )
  }, [])

  return [value, updateValue]
}
