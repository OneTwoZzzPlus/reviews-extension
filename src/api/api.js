import {refreshToken, accessToken, isAccessTokenExpired,
    resetTokensAuto, saveTokensAuto, validateTokenISU} from "./authp.js";

/** Подменяется на этапе компиляции */
/* global API_HOST */

/** Универсальная обёртка для запросов к API
 * @param {string} path
 * @param {Object} options
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} method
 * @param {AbortController} [controller]
 */
async function fetchJSON(method, path, options = {}, controller = null) {
    const url = new URL(path, API_HOST);

    const fetchOptions = {
        method: method.toUpperCase(),
        headers: {
            'Content-Type': 'application/json'
        },
        signal: controller?.signal
    };

    if (refreshToken) {
        try {
            if (!accessToken || isAccessTokenExpired()) {
                const urlRefresh = new URL("/authp/refresh", API_HOST);
                const resp = await fetch(urlRefresh, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({'refresh_token': refreshToken})
                })
                if (resp.ok) {
                    const res = await resp.json()
                    const aToken = res?.access_token;
                    if (aToken && validateTokenISU(aToken)) {
                        saveTokensAuto(refreshToken, aToken);
                    }
                } else {
                    console.error('[API] Refresh status code ' + resp.status);
                    resetTokensAuto();
                }
            }
            if (accessToken) fetchOptions.headers['token'] = accessToken;
        } catch (err) {
            console.error('[API] Unable to refresh the token', err);
        }
    }

    if (fetchOptions.method === 'GET') {
        Object.entries(options).forEach(([key, value]) => {
            url.searchParams.set(key, value.toString());
        });
    } else {
        fetchOptions.body = JSON.stringify(options);
    }

    return new Promise((resolve, reject) => {
        fetch(url, fetchOptions).then(async (res) => {
            if (res.ok) {
                console.log(`[API] fetch resolved`);
                const text = await res.text();
                resolve(text ? JSON.parse(text) : {});
            } else {
                const errorDetail = await res.json().catch(() => ({}));
                if (res.status === 401 || res.status === 404) {
                    console.info('[API] error details:', errorDetail);
                } else {
                    console.error('[API] error details:', errorDetail);
                }
                reject(res.status);
            }
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                console.error('[API] network error:', err);
                reject(0);
            } else {
                console.log(`[API] fetch aborted`);
            }
        });
    });
}

export async function fetchSearch(query, controller, strainer=null) {
    console.log(`[API] send /search for "${query}"`);
    const options = strainer === null ? {"query": query} : {"query": query, "strainer": strainer}
    return await fetchJSON('GET', '/search', options, controller)
}

export async function fetchTeacher(id) {
    console.log(`[API] send /teacher for "${id}"`);
    return await fetchJSON('GET', `/teacher/${id}`, {})
}

export async function fetchSubject(id) {
    console.log(`[API] send /subject for "${id}"`);
    return await fetchJSON('GET', `/subject/${id}`, {})
}

export async function fetchTeacherRate(id, user_rating) {
    console.log(`[API] send /teacher/${id}/rate ${user_rating}`);
    return await fetchJSON('POST', `/teacher/${id}/rate`, {"user_rating": user_rating})
}

export async function fetchCommentVote(id, user_karma) {
    console.log(`[API] send /comment/${id}/vote ${user_karma}`);
    return await fetchJSON('POST', `/comment/${id}/vote`, {"user_karma": user_karma})
}

export async function fetchAuthPLogin(username, password) {
    console.log(`[API] send /authp/login`);
    return await fetchJSON('POST', `/authp/login`, {"username": username, "password": password})
}

export async function fetchIsModerator() {
    console.log(`[API] send GET /moderator`);
    return await fetchJSON('GET', `/moderator`)
}

export async function fetchSendSuggestion(body) {
    console.log(`[API] send POST /suggestion`);
    return await fetchJSON('POST', `/suggestion`, body)
}

export async function fetchGetSuggestionList() {
    console.log(`[API] send GET /suggestion`);
    return await fetchJSON('GET', `/suggestion`)
}

export async function fetchGetSuggestion(id) {
    console.log(`[API] send GET /suggestion/${id}`);
    return await fetchJSON('GET', `/suggestion/${id}`)
}

export async function fetchCommitSuggestion(id, body) {
    console.log(`[API] send POST /suggestion/${id}/commit`);
    return await fetchJSON('POST', `/suggestion/${id}/commit`, body)
}

export async function fetchCancelSuggestion(id, status='rejected') {
    console.log(`[API] send POST /suggestion/${id}/cancel status=${status}`);
    return await fetchJSON('POST', `/suggestion/${id}/cancel`, {'status': status})
}
