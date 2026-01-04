import {parseCommentDate} from "../utils/utils.js";
import {fetchCommentVote, fetchTeacherRate} from "../api/api.js";

/** Создаём блок отзывов
 * @param {Array<Comment>} commentsData - Данные списка отзывов
 */
export function createComments(commentsData) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('comments-wrap');

    let commentsList = createCommentsList(commentsData);

    if (commentsData.length > 1) {
        const dropdown = createDropdown(commentsData);
        dropdown.addEventListener("change", (event) => {
            const model = parseInt(event.target.value);
            console.log(`[UI] sorting model ${model}`);
            const newCL = createCommentsList(commentsData, model);
            wrapper.replaceChild(newCL, commentsList);
            commentsList = newCL;
        });
        wrapper.appendChild(dropdown);
    }
    wrapper.appendChild(commentsList);

    return wrapper;
}

/** Создаём отсортированный список отзывов
 * @param {Array<Comment>} commentsData - Данные списка отзывов
 * @param {number} model - Режим сортировки
 */
function createCommentsList(commentsData, model = 0) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('comments');
    const sortedCommentsData = sortComments(commentsData, model);
    sortedCommentsData.map(cData => wrapper.append(createComment(cData)));
    return wrapper;
}

/** Создание отзыва
 * @param {Comment} comment
 */
function createComment(comment) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("comment");
    wrapper.innerHTML = `
        <div class="comment-head">
            Отзыв ${comment.date}
            ${comment?.subject ? ` по предмету "${comment.subject.title}"` : ' '}
            ${comment?.source ? ` источник "<a href="${comment.source.link ?? ''}">${comment.source.title}</a>"` : ''}
        </div>
        <div>${comment.text}</div>
    `
    wrapper.appendChild(createKarma(comment.id, comment.karma, comment.user_karma));
    return wrapper
}

/** Создание панельки кармы ▲▼△▽*/
function createKarma(id, karma, user_karma) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("karma");
    const karmaSpan = document.createElement("span");
    karmaSpan.classList.add("karma-value");
    const upBtn = document.createElement("button");
    upBtn.classList.add("karma-btn");
    const downBtn = document.createElement("button");
    downBtn.classList.add("karma-btn");

    upBtn.addEventListener("click", async (event) => {
        const data = await fetchCommentVote(id, user_karma === 1 ? 0 : 1);
        user_karma = data.user_karma;
        karma = data.karma;
        updateKarma(karmaSpan, upBtn, downBtn, karma, user_karma);
    })
    downBtn.addEventListener("click", async (event) => {
        const data = await fetchCommentVote(id, user_karma === -1 ? 0 : -1 );
        user_karma = data.user_karma;
        karma = data.karma;
        updateKarma(karmaSpan, upBtn, downBtn, karma, user_karma);
    })

    updateKarma(karmaSpan, upBtn, downBtn, karma, user_karma)

    wrapper.appendChild(upBtn);
    wrapper.appendChild(karmaSpan);
    wrapper.appendChild(downBtn);
    return wrapper
}

/** Обновляем состояние панели кармы */
function updateKarma(karmaSpan, upBtn, downBtn, karma, user_karma) {
    if (user_karma === null || user_karma === undefined) user_karma = 0;
    karmaSpan.innerHTML = karma;
    upBtn.innerHTML = user_karma === 1 ? "▲" : "△"
    downBtn.innerHTML = user_karma === -1 ? "▼" : "▽"
}

/** Выпадающий список моделей сортировки */
function createDropdown() {
    const wrapper = document.createElement("select");
    wrapper.name = "sort";
    wrapper.classList.add("comments-dropdown");
    wrapper.innerHTML = `
        <option value="0">C высокой кармы</option>
        <option value="1">С низкой кармы</option>
        <option value="2">Сначала новые</option>
        <option value="3">Сначала старые</option>`
    return wrapper;
}

/** Сортировка массива комментариев согласно модели */
function sortComments(comments, model = 0) {
    return [...comments].sort((a, b) => {
        const timeA = parseCommentDate(a.date);
        const timeB = parseCommentDate(b.date);
        let diff;
        switch (model) {
            case 0:
                diff = b.karma - a.karma;
                if (diff === 0) {
                    if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
                    else return timeB - timeA;
                }
                return diff;
            case 1:
                diff = a.karma - b.karma;
                if (diff === 0) {
                    if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
                    else return timeB - timeA;
                }
                return diff;
            case 2:
                if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
                else return timeB - timeA;
            case 3:
                if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
                else return timeA - timeB;
            default: return 0;
        }
    });
}


