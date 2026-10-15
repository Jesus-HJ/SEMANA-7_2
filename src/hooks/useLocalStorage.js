import { useCallback, useEffect, useState } from "react";

const readStoredValue = (key, defaultValue) => {
  if (typeof window === "undefined") return defaultValue;

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue === null ? defaultValue : JSON.parse(storedValue);
  } catch (error) {
    console.error(`No se pudo leer "${key}" desde localStorage.`, error);
    return defaultValue;
  }
};

export const useLocalStorage = (key, defaultValue) => {
  const [storedState, setStoredState] = useState(() => ({
    key,
    value: readStoredValue(key, defaultValue),
  }));
  const value =
    storedState.key === key
      ? storedState.value
      : readStoredValue(key, defaultValue);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`No se pudo guardar "${key}" en localStorage.`, error);
    }
  }, [key, value]);

  useEffect(() => {
    if (storedState.key !== key) {
      setStoredState({ key, value });
    }
  }, [key, storedState.key, value]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key || event.key === null) {
        setStoredState({
          key,
          value:
            event.key === null
              ? defaultValue
              : readStoredValue(key, defaultValue),
        });
      }
    };

    console.log("Listener storage registrado");

    window.addEventListener("storage", handleStorageChange);

    return () => {
      console.log("Cleanup ejecutado: listener eliminado");
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, defaultValue]);

  const updateValue = useCallback(
    (nextValue) => {
      setStoredState((currentState) => {
        const currentValue =
          currentState.key === key
            ? currentState.value
            : readStoredValue(key, defaultValue);
        return {
          key,
          value:
            typeof nextValue === "function"
              ? nextValue(currentValue)
              : nextValue,
        };
      });
    },
    [key, defaultValue],
  );

  return [value, updateValue];
};
