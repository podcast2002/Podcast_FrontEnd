export const API_BASE_URL = process.env.BACK_END_URL || 'http://localhost:6002';

export const API_ROUTES = {
    AUTH : `${API_BASE_URL}/api/auth`,
    PODCASTS: `${API_BASE_URL}/api/podcast`,
    EPISODES: `${API_BASE_URL}/api/episode`,
}