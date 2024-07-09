import { useState } from "react";

const useLoading = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const setErrorState = (error) => setError(error);
  const resetError = () => setError(null);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setErrorState,
    resetError,
  };
};

export default useLoading;
