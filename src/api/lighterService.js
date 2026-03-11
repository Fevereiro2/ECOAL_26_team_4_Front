const API_BASE_URL = "http://127.0.0.1:8000/api";

export const lighterService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des briquets:", error);
      return [];
    }
  },
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Erreur briquet ID ${id}:`, error);
      return null;
    }
  },
  update: async (id, data, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de l'update:", error);
      throw error;
    }
  }
};