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

    // Handle 204 No Content
    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export const api = {
    async get(endpoint) {
        const headers = {
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers,
                credentials: 'include',
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },

    async post(endpoint, data) {
        const headers = {
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },

    async postForm(endpoint, data) {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };

        const formData = new URLSearchParams();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers,
                credentials: 'include',
                body: formData,
            });
            return handleResponse(response);
        } catch (error) {
            if (error instanceof APIError) throw error;
            throw new APIError('Network error', 0, { detail: error.message });
        }
    },

    async put(endpoint, data) {
        const headers = {
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers,
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
        const headers = {
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers,
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
