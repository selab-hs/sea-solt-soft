// === 공통 API 클라이언트 ===
// - JWT 자동 첨부
// - 401 응답 시 토큰 폐기 + 로그인으로 이동(현재 위치를 redirect 파라미터로 전달)
// - 토큰 유효성(만료) 검사 유틸 제공

const API_BASE = '/api/v1';
const TOKEN_HEADER_NAME = 'Authorization';
const TOKEN_PREFIX = 'Bearer ';
const TOKEN_STORAGE_KEY = 'accessToken';

// ----- 토큰 저장소 -----
function getToken() { return localStorage.getItem(TOKEN_STORAGE_KEY); }
function setToken(t) { localStorage.setItem(TOKEN_STORAGE_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_STORAGE_KEY); }

// ----- JWT 유틸 -----
function parseJwt(token) {
    if (!token) return null;
    const p = token.split('.');
    if (p.length < 2) return null;
    try {
        const b64 = p[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(escape(atob(b64)));
        return JSON.parse(json);
    } catch {
        try { return JSON.parse(atob(p[1])); } catch { return null; }
    }
}

// 만료(exp) 기반 유효성 검사
function isTokenValid(token) {
    const payload = parseJwt(token);
    if (!payload) return false;
    if (typeof payload.exp !== 'number') return false;     // exp 없으면 보수적으로 false
    return Date.now() < payload.exp * 1000;
}

function isLoggedIn() {
    return isTokenValid(getToken());
}

// 토큰 → 로그인ID(sub) 추출
function getLoginIdFromToken(token) {
    const p = parseJwt(token);
    if (!p) return null;
    return p.sub || p.loginId || p.userId || p.username || null;
}
function getCurrentLoginId() {
    return getLoginIdFromToken(getToken());
}

// ----- fetch 래퍼 -----
async function apiFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const token = getToken();
    if (token) headers.set(TOKEN_HEADER_NAME, `${TOKEN_PREFIX}${token}`);

    const resp = await fetch(url, { ...options, headers });

    // 401이면 토큰 폐기 + 로그인으로 이동(현재 페이지로 돌아오도록 redirect 포함)
    if (resp.status === 401) {
        clearToken();
        const back = encodeURIComponent(location.pathname + location.search);
        location.href = `/sign-in?redirect=${back}`;
    }
    return resp;
}

// 전역 노출
window.API = {
    API_BASE, TOKEN_HEADER_NAME, TOKEN_PREFIX,
    getToken, setToken, clearToken,
    parseJwt, isTokenValid, isLoggedIn,
    getLoginIdFromToken, getCurrentLoginId,
    apiFetch
};
