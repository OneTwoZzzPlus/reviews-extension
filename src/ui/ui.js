import * as strings from "./strings";
import createReviewsContentBox from "./reviewsContentBox.js";

/** Меню */
export function createMenu() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("reviews-menu");
    wrapper.innerHTML = "тут будет менюшка =)";
    return wrapper;
}

/** Блок отзывов для вставки на сайт
 * @param {Teacher} data
 * */
export function createInjector(data) {
    const reviewBox = createReviewsContentBox(data);
    if (reviewBox === null) return null;

    const wrapper = document.createElement('div');
    wrapper.appendChild(reviewBox);

    return wrapper;
}

/** Блок отзывов по учителю для popup
 * @param {Teacher} data
 * */
export function createTeacher(data) {
    const reviewBox = createReviewsContentBox(data);
    if (reviewBox === null) return null;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<h2>${data.name}</h2>`
    wrapper.appendChild(reviewBox);

    return wrapper;
}

/** Блок отзывов по предмету для popup
 * @param {Subject} data
 * */
export function createSubject(data) {
    if (!data || !Array.isArray(data.teachers)) return null;

    data.teachers.sort((a, b) => {
        const rating = b.rating - a.rating
        if (rating === 0) return b.id - a.id;
        return rating
    });

    const reviewBoxes = data.teachers.map(teacher => createReviewsContentBox(teacher));
    if (reviewBoxes.some(box => box === null)) return null;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<h2>${data.title}</h2>`;
    data.teachers.forEach((teacher, i) => {
        const box = document.createElement("details");
        box.innerHTML = `<summary class="reviews-title">${teacher.name}</summary>`;
        box.appendChild(reviewBoxes[i]);
        wrapper.appendChild(box);
    })
    return wrapper;
}

/** Блок результатов поиска для popup
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
            ${strings.symbols[s.type] || ''}
            ${s.title}
            <span class="search-id">${s.id}</span>
        `;
        item.addEventListener('click', async () => callback(s.id, s.type));
        wrapper.appendChild(item);
    });

    return wrapper;
}
