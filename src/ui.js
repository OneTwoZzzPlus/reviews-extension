/** JSON responses
 * @typedef {{
 *   id: number,
 *   name: string,
 *   summaries: Array<any>,
 *   comments: Array<{
 *     date: string,
 *     text: string,
 *     source?: { title: string, link: string },
 *     subject?: { title: string }
 *   }>
 * }} TeacherResponse
 *
 * @typedef {{
 *   title: string,
 *   teachers: Array<TeacherResponse>
 * }} SubjectResponse
 *
 * @typedef {{
 *   results: Array<{
 *     id: number,
 *     name: string,
 *     type: string
 *   }>
 * }} SearchResponse
 */

/** @param {TeacherResponse} data **/
export function createReviewContentBox(data) {
    if (!data ||
        !Array.isArray(data.summaries) ||
        !Array.isArray(data.comments) ||
        (data.summaries.length === 0 && data.comments.length === 0)
    ) return null;

    const wrapper = document.createElement('div');
    wrapper.id = "reviewsContentBox";

    const summariesHTML = data.summaries.map(item => `
        <div class="summary">
            <span>${item.title ?? ''}</span>
            <span>${item.value ?? ''}</span>
        </div>
    `).join('')

    const commentsHTML = data.comments.map(item => `
        <div class="comment">
            <div class="comment-head">
                Отзыв ${item.date}
                ${item?.subject ? ' по предмету ' + `"${item.subject.title}"` : ' '}
                ${item?.source ? ' источник ' + `"<a href=" ${item.source.link ?? ''}">${item.source.title}</a>"` : ''}
            </div>
            <div>${item.text}</div>
        </div>
    `).join('');

    wrapper.innerHTML = summariesHTML + commentsHTML;
    return wrapper;
}

/** @param {TeacherResponse} data */
export function createTeacher(data) {
    const reviewBox = createReviewContentBox(data);
    if (reviewBox === null) return null;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <h2>${data.name}</h2>
        ${reviewBox.innerHTML}
        <div class="note">Отзывы не имеют отношения к администрации ИТМО.</div>
    `;

    return wrapper;
}

/** @param {SubjectResponse} data */
export function createSubject(data) {
    if (!data || !Array.isArray(data.teachers)) return null;

    const reviewBoxes = data.teachers.map(teacher => createReviewContentBox(teacher));
    if (reviewBoxes.some(box => box === null)) return null;

    const wrapper = document.createElement('div');

    const teachersHTML = data.teachers.map((teacher, i) => `
        <div>
            <h3>${teacher.name}</h3>
            ${reviewBoxes[i].innerHTML}
        </div>
    `).join('');

    wrapper.innerHTML = `
        <h2>${data.title}</h2>
        ${teachersHTML}
        <div class="note">Отзывы не имеют отношения к администрации ИТМО.</div>
    `;

    return wrapper;
}

/**
 * @param {SearchResponse} data
 * @param {function} callback
 * */
export function createSearch(data, callback) {
    const wrapper = document.createElement('div');
    wrapper.className = 'search-list';

    data.results.forEach(s => {
        const item = document.createElement('div');
        item.className = 'search-item';
        item.innerHTML = `
            ${s.name}
            <span class="search-id">${s.id}</span>
        `;
        item.addEventListener('click', async () => callback(s.id, s.type));
        wrapper.appendChild(item);
    });

    return wrapper;
}

/** Ошибки при загрузке отзывов **/
export const brokeReviewsText = "Отзывы пришли сломанные =(";
export function statusReviewsText(status) {
    let answer;
    switch (status) {
        case 0: answer = `<span class="error">Сервер с отзывами недоступен =(</span>`; break;
        case 404: answer = "Отзывы отсутствуют"; break;
        default: answer = `Сервер прислал "${status}" вместо отзывов =(`
    }
    return answer;
}

/** Ошибки при загрузке поиска **/
export const brokeSearchText = "Результаты пришли сломанные =(";
export function statusSearchText(status) {
    let answer;
    switch (status) {
        case 0: answer = `<span class="error">Сервер с отзывами недоступен =(</span>`; break;
        case 400: answer = "Сервер говорит, что ему мало буков для поиска"; break;
        case 404: answer = "Ничего не найдено"; break;
        default: answer = `Сервер прислал "${status}" вместо отзывов =(`
    }
    return answer;
}

export const loadingText = "Загружаем...";