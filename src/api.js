async function fetchJSON(path, options, controller=null) {
    const url = new URL(path, API_HOST);
    Object.entries(options).forEach(([key, value]) => {url.searchParams.set(key, value.toString());});
    return new Promise( (resolve, reject) => {
        fetch(url, {signal: controller?.signal}).then(async (res) => {
            if (res.ok) {
                console.log(`[API] fetch resolved`);
                resolve(await res.json());
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

export async function fetchSearch(filter, controller) {
    console.log(`[API] send /search for "${filter}"`);
    return await fetchJSON('/search', {"filter": filter}, controller)
}

export async function fetchTeacher(id) {
    console.log(`[API] send /teacher for "${id}"`);
    return await fetchJSON('/teacher', {"id": id})
}

export async function fetchSubject(id) {
    console.log(`[API] send /subject for "${id}"`);
    return await fetchJSON('/subject', {"id": id})
}
