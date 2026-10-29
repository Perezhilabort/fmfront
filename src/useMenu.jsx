import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export function useMenu() {
    const { i18n } = useTranslation();
    const lang = (i18n.language || 'ru').slice(0, 2);
    const API_URL = import.meta.env.VITE_API_URL || 'https://fmmenuserver.onrender.com/';
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        axios
            .get(API_URL, {
                params: { lang },
                signal: controller.signal,
            })
            .then((res) => setCategories(res.data.categories))
            .catch((e) => {
                if (e.code !== 'ERR_CANCELED') setError(e);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [lang]);

    return { categories, loading, error };
}