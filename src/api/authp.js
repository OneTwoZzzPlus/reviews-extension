import {parseJwt, setCookie, getCookie} from "../utils/utils.js";

let isExtension = false;
export let refreshToken = null;
export let accessToken = null;
let accessTokenExpiration = 0;
const TIMEOUT = 300;

export function isAuth() {
    return refreshToken !== null
}

function setTokens(rToken, aToken) {
    refreshToken = rToken;
    accessToken = aToken;

    /** @type {JWTPayload} */
    const payload = parseJwt(accessToken);
    if (payload?.exp) accessTokenExpiration = payload.exp || 0;
}

export function isAccessTokenExpired() {
    return Date.now() >= (accessTokenExpiration * 1000 - TIMEOUT * 1000);
}

export function validateTokenISU(aToken) {
    /** @type {JWTPayload} */
    const payload = parseJwt(aToken);
    if (!payload?.isu) {
        console.error('[AUTHP] isu not found');
        return false;
    }
    return true;
}

export function saveTokensExtension(rToken, aToken) {
    isExtension = true;
    if (!chrome.runtime?.id) return;
    chrome.storage.local.set({ refresh_token: rToken, access_token: aToken }, () => {
        const err = chrome.runtime.lastError;
        if (err && !err.message.includes('Extension context invalidated')) {
            console.error(err);
        } else {
            setTokens(rToken, aToken);
            console.log('[AUTHP] tokens saved successfully');
        }
    });
}

export function loadTokensExtension() {
    isExtension = true;
    return new Promise((resolve, reject) => {
        chrome.storage.local.get((data) => {
            const rToken = data.refresh_token;
            const aToken = data.access_token;
            if (rToken && aToken) {
                setTokens(rToken, aToken);
                const payloadAT = parseJwt(aToken);
                if (payloadAT) resolve(payloadAT);
                else reject();
            } else reject();
        })
    })
}

export function resetTokensExtension() {
    isExtension = true;
    chrome.storage.local.remove(["refresh_token", "access_token"]);
    refreshToken = null;
    accessToken = null;
    accessTokenExpiration = 0;
}

export function saveTokensPage(rToken, aToken) {
    isExtension = false;
    setCookie('refresh_token', rToken, {secure: false});
    setCookie('access_token', aToken, {secure: false});
    setTokens(rToken, aToken)
}

export function loadTokensPage() {
    isExtension = false;
    return new Promise((resolve, reject) => {
        const rToken = getCookie('refresh_token');
        const aToken = getCookie('access_token');
        if (rToken && aToken) {
            setTokens(rToken, aToken);
            const payloadAT = parseJwt(aToken);
            if (payloadAT) resolve(payloadAT);
            else reject();
        } else reject();
    })
}

export function resetTokensPage() {
    isExtension = false;
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    refreshToken = null;
    accessToken = null;
    accessTokenExpiration = 0;
}

export function saveTokensAuto(rToken, aToken) {
    if (isExtension) saveTokensExtension(rToken, aToken);
    else saveTokensPage(rToken, aToken);
}

export function loadTokensAuto() {
    if (isExtension) return loadTokensExtension();
    else return loadTokensPage();
}

export function resetTokensAuto() {
    if (isExtension) resetTokensExtension();
    else resetTokensPage();
}
