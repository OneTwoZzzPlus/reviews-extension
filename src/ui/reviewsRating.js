import {fetchTeacherRate} from "../api/api.js";

export function createRating(id, rating, user_rating) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("rating-box")

    wrapper.innerHTML = renderRating(id, rating, user_rating)

    wrapper.addEventListener('change', async (event) => {
        if (event.target.name === `rating-${id}`) {
            const newRate = parseInt(event.target.value);

            const data = await fetchTeacherRate(id, newRate);
            wrapper.innerHTML = renderRating(id, data.rating, data.user_rating);
        }
    });

    return wrapper;
}

function renderRating(id, rating, user_rating) {
    if (user_rating === null || user_rating === undefined) user_rating = 0;
    const stars = [5, 4, 3, 2, 1].map(num => `
        <input type="radio" id="rate-${id}-${num}" name="rating-${id}" value="${num}" ${user_rating === num ? 'checked' : ''}>
        <label for="rate-${id}-${num}">★</label>
    `).join('');

    return `
        <div class="rating-row">
            <span class="rating-title">Средняя оценка:</span>
            <span class="rating-value">${rating}</span>
        </div>
        <div class="rating-row">
            <span class="rating-title">Ваша оценка:</span>
            <div class="rating">${stars}</div>
        </div>
    `
}