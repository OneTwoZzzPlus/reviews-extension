import * as strings from "../../strings.js";

/** Блок результатов поиска
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
        item.addEventListener('click', async () => callback(s.id, s.type, s.title));
        wrapper.appendChild(item);
    });

    return wrapper;
}
