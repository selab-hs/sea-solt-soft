// === 공통 API 클라이언트 ===
// - JWT 자동 첨부
// - 401 응답 시 토큰 폐기 + 로그인으로 이동(redirect 유지)
// - 토큰 유효성(만료) 검사 유틸 제공

const API_BASE = '/api/v1';
const TOKEN_HEADER_NAME = 'Authorization';
const TOKEN_PREFIX = 'Bearer ';
const TOKEN_STORAGE_KEY = 'Authorization';

// ----- 과거 키 자동 마이그레이션(accessToken → Authorization) -----
// 혹시모를 accessToken 남아있는거 방지
(() => {
    const old = localStorage.getItem('accessToken');
    const cur = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (old && !cur) {
        const val = old.startsWith(TOKEN_PREFIX) ? old : (TOKEN_PREFIX + old);
        localStorage.setItem(TOKEN_STORAGE_KEY, val);
        localStorage.removeItem('accessToken');
    }
})();

// ----- 토큰 저장소 -----
function getToken() { return localStorage.getItem(TOKEN_STORAGE_KEY); }
function setToken(t) { if (t) localStorage.setItem(TOKEN_STORAGE_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_STORAGE_KEY); }

// 내부 유틸: "Bearer " 제거
function stripBearer(t) {
    if (!t) return t;
    return t.startsWith(TOKEN_PREFIX) ? t.slice(TOKEN_PREFIX.length) : t;
}

// ----- JWT 유틸 -----
function parseJwt(tokenLike) {
    const token = stripBearer(tokenLike);
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

function isTokenValid(tokenLike) {
    const payload = parseJwt(tokenLike);
    if (!payload) return false;
    if (typeof payload.exp !== 'number') return false;
    return Date.now() < payload.exp * 1000;
}

function isLoggedIn() { return isTokenValid(getToken()); }

function getLoginIdFromToken(tokenLike) {
    const p = parseJwt(tokenLike);
    if (!p) return null;
    return p.sub || p.loginId || p.userId || p.username || null;
}
function getCurrentLoginId() { return getLoginIdFromToken(getToken()); }

// ----- fetch 래퍼 -----
async function apiFetch(path, options = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    const token = getToken(); // "Bearer xxx" 또는 "xxx"
    if (token) {
        headers.set(
            TOKEN_HEADER_NAME,
            token.startsWith(TOKEN_PREFIX) ? token : (TOKEN_PREFIX + token)
        );
    }

    const resp = await fetch(url, { ...options, headers });

    if (resp.status === 401) {
        clearToken();
        const back = encodeURIComponent(location.pathname + location.search);
        location.href = `/sign-in?redirect=${back}`;
    }
    return resp;
}

window.API = {
    API_BASE, TOKEN_HEADER_NAME, TOKEN_PREFIX,
    getToken, setToken, clearToken,
    parseJwt, isTokenValid, isLoggedIn,
    getLoginIdFromToken, getCurrentLoginId,
    apiFetch
};
