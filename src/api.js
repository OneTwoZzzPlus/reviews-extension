function fetchJSON(path, options, controller=null) {
    const url = new URL(path, API_HOST);
    Object.entries(options).forEach(([key, value]) => {url.searchParams.set(key, value);});
    return new Promise((resolve, reject) => {
        fetch(url, {signal: controller?.signal}).then((res) => {
            if (res.ok) {
                console.log(`[API] fetch resolved`);
                res.json().then(res => resolve(res))
            } else {
                reject(res.status)
            }
        }).catch((err) => {
            if (err.name !== 'AbortError') {
                console.error('[API] network error:', err);
                reject(0)
            } else {
                console.log(`[API] fetch aborted`);
            }
        });
    })
}


export async function fetchSearch(filter) {
    console.log(`[API] send /search for "${filter}"`);
    const controller = new AbortController();
    return await fetchJSON('/search', {"filter": filter}, controller)
}

export async function fetchTeacher(id) {
    console.log(`[API] send /teacher for "${id}"`);
    await fetchJSON('/teacher', {"id": id})
}

export async function fetchSubject(id, resolve, reject) {
    console.log(`[API] send /subject for "${id}"`);
    await fetchJSON('/subject', {"id": id})
}
