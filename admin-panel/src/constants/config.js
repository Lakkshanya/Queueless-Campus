const getDynamicApiUrl = () => {
    const savedUrl = localStorage.getItem('serverUrl');
    if (savedUrl) return savedUrl;
    return 'https://queueless-campus-default.trycloudflare.com/api';
};

const getDynamicBaseUrl = () => {
    const savedUrl = localStorage.getItem('portalUrl');
    if (savedUrl) return savedUrl;
    return 'https://queueless-campus-default.trycloudflare.com';
};

export const API_URL = getDynamicApiUrl();
export const SOCKET_URL = getDynamicBaseUrl();
