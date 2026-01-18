export function parseJwt(token) {
    try {
        const base64 = token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        const json = new TextDecoder('utf-8').decode(bytes);

        return JSON.parse(json);
    } catch (e) {
        console.error('Ошибка парсинга JWT', e);
        return null;
    }
}

export function parseCommentDate(dateStr) {
    if (!dateStr) return -Infinity;

    // "до YYYY"
    const untilMatch = dateStr.toLowerCase().match(/^до\s+(\d{4})$/);
    if (untilMatch) {
        const [, year] = untilMatch;
        // Return "00:00 01.01.YYYY"
        return new Date(
            Number(year),
            0,
            1,
            0,
            0
        ).getTime();
    }

    // "HH:MM DD.MM.YYYY"
    const match = dateStr.match(
        /(\d{2}):(\d{2})\s+(\d{2})\.(\d{2})\.(\d{4})/
    );
    if (!match) {
        return -Infinity;
    }

    const [, hh, mm, dd, MM, yyyy] = match;
    return new Date(
        Number(yyyy),
        Number(MM) - 1,
        Number(dd),
        Number(hh),
        Number(mm)
    ).getTime();
}

export function setCookie(key, value, options = {}) {
    const {
        days = 1,
        path = '/',
        sameSite = 'Lax',
        secure = false
    } = options;

    let cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    if (days) {
        cookie += `; max-age=${days * 86400}`;
    }

    cookie += `; path=${path}`;
    cookie += `; SameSite=${sameSite}`;

    if (secure) {
        cookie += '; Secure';
    }

    document.cookie = cookie;
}

export function getCookie(key) {
    const match = document.cookie
        .split('; ')
        .find(row => row.startsWith(encodeURIComponent(key) + '='));

    return match
        ? decodeURIComponent(match.split('=')[1])
        : null;
}
