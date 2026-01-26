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
    const hasOptions = Object.keys(options).length > 0;
    console.log(`[API] send ${method} ${path} ${hasOptions ? `with options = ${JSON.stringify(options)}` : ''}`);

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
                console.log('[API] Refreshing token...');
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
                        console.log('[API] Token refreshed successfully');
                    } else {
                        console.error('[API] Invalid token in refresh response');
                        resetTokensAuto();
                    }
                } else {
                    console.error('[API] Refresh failed with status:', resp.status);
                    resetTokensAuto();
                }
            }
            if (accessToken) {
                fetchOptions.headers['token'] = accessToken;
            }
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
                console.log(`[API] fetch resolved ${method} ${path}`);
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
                console.log(`[API] fetch aborted ${method} ${path}`);
            }
        });
    });
}

export async function fetchSearch(query, controller, strainer=null) {
    const options = strainer === null ? {"query": query} : {"query": query, "strainer": strainer}
    return await fetchJSON('GET', '/search', options, controller)
}

export async function fetchTeacher(id) {
    return await fetchJSON('GET', `/teacher/${id}`, {})
}

export async function fetchSubject(id) {
    return await fetchJSON('GET', `/subject/${id}`, {})
}

export async function fetchTeacherRate(id, user_rating) {
    return await fetchJSON('POST', `/teacher/${id}/rate`, {"user_rating": user_rating})
}

export async function fetchCommentVote(id, user_karma) {
    return await fetchJSON('POST', `/comment/${id}/vote`, {"user_karma": user_karma})
}

export async function fetchSendSuggestion(body) {
    return await fetchJSON('POST', `/suggestion`, body)
}

export async function fetchAuthPLogin(username, password) {
    return await fetchJSON('POST', `/authp/login`, {"username": username, "password": password})
}

export async function fetchIsModerator() {
    return await fetchJSON('GET', `/mod`)
}

export async function fetchGetSuggestionList() {
    return await fetchJSON('GET', `/mod/suggestion`)
}

export async function fetchGetSuggestion(id) {
    return await fetchJSON('GET', `/mod/suggestion/${id}`)
}

export async function fetchCommitSuggestion(id, body) {
    return await fetchJSON('POST', `/mod/suggestion/${id}/commit`, body)
}

export async function fetchCancelSuggestion(id, status='rejected') {
    return await fetchJSON('POST', `/mod/suggestion/${id}/cancel`, {'status': status})
}
