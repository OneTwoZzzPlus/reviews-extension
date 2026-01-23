import * as strings from "../../strings.js";

/** Список отзывов в предложке
 * @param callback
 * @param {SuggestionListResponse} data
 * */
export function createListReviewsForm(callback, data) {

    const wrapper = document.createElement("div");
    wrapper.classList.add("suggestions-list");

    data.items.forEach(s => {
        const item = document.createElement('div');
        item.className = 'suggestions-list-item';
        item.innerHTML = `
            Отзыв <b>№${s.id}</b> в статусе <b>${strings.suggestionStatus[s.status] ?? 'непонятном'}</b> </br>
            <span class="muted-text">${s.title}</span>
        `;
        item.addEventListener('click', async () => callback(s.id));
        wrapper.appendChild(item);
    });

    return wrapper;
}