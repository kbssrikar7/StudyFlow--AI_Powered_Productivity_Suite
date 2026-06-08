const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class APIError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

async function handleResponse(response) {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { detail: 'An error occurred' };
        }
        throw new APIError(
            errorData.detail || `HTTP Error ${response.status}`,
            response.status,
            errorData
        );
    }
    if (response.status === 204) return null;
    return response.json();
}

export const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },

    async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },

    async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },
};

export { APIError };
