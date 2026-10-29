import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export async function getMenu(lang, signal) {
    const { data } = await api.get('/menu', { params: { lang }, signal });
    return data; // { lang, categories: [...] }
}

export async function getLanguages() {
    const { data } = await api.get('/languages');
    return data; // { languages: [...], default: 'ru' }
}