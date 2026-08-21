import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// Avant chaque requête : ajouter le jeton + empêcher le cache
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Anti-cache : forcer le navigateur à toujours redemander les données fraîches
  if (config.method === "get") {
    config.params = {
      ...config.params,
      _t: Date.now(),  // paramètre unique à chaque requête
    };
  }

  return config;
});

export default api;