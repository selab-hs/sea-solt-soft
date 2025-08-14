// === 환경설정(필요시 한 줄만 수정) ===
const API_BASE = '/api/v1';
const TOKEN_HEADER_NAME = 'Authorization';
const TOKEN_PREFIX = 'Bearer ';

// 토큰 저장
const TOKEN_STORAGE_KEY = 'accessToken';
function getToken() { return localStorage.getItem(TOKEN_STORAGE_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_STORAGE_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_STORAGE_KEY); }

// fetch 래퍼: JWT 자동 첨부 + 401 처리
async function apiFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const token = getToken();
    if (token) headers.set(TOKEN_HEADER_NAME, `${TOKEN_PREFIX}${token}`);

    const resp = await fetch(url, { ...options, headers });

    if (resp.status === 401) {
        clearToken();
        location.href = '/sign-in';
    }
    return resp;
}

// 전역 네임스페이스로 노출
window.API = {
    API_BASE, TOKEN_HEADER_NAME, TOKEN_PREFIX,
    getToken, setToken, clearToken, apiFetch
};
