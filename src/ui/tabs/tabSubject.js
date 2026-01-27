import createReviewsContentBox from "./reviews/reviewsContentBox.js";
import {getNonNegativeInt, parseCommentDate} from "../../utils/utils.js";

/** Блок отзывов по предмету для popup
 * @param {Subject} data
 * @param {boolean} isAuth
 * */
export function createSubject(data, isAuth) {
    if (!data || !Array.isArray(data.teachers)) return null;

    data.teachers.sort((a, b) => {
        const getLatestTime = (item) => {
            if (!item.comments || item.comments.length === 0) return 0;
            return item.comments.reduce((max, c) => {
                const current = getNonNegativeInt(parseCommentDate(c.date));
                return current > max ? current : max;
            }, 0);
        };

        const timeA = getLatestTime(a);
        const timeB = getLatestTime(b);

        if (timeB !== timeA) {
            return timeB - timeA;
        }

        const rating = b.rating - a.rating;
        if (rating !== 0) return rating;

        return b.id - a.id;
    });

    const reviewBoxes = data.teachers.map(teacher => createReviewsContentBox(teacher, isAuth));
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