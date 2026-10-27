import { useEffect, useState } from "react";

export function useLocalStorageState(initialState, key) {
  const [value, setValue] = useState(function () {
    const storedVal = localStorage.getItem(key);
    return JSON.parse(storedVal) ?? initialState;
  });

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(value));
    },
    [value],
  );

  return [value, setValue];
}
