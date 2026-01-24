import * as strings from "../../strings.js";
import {normalizeString} from "../../utils/utils.js"
import {renderAddReviewForm, getElements, MAX_TEXTAREA} from "./creation/addReviewForm.js";
import {fetchCancelSuggestion, fetchCommitSuggestion, fetchSearch, fetchSendSuggestion} from "../../api/api.js";
import {createSearch} from "./tabSearch.js";

let isUserModerator = false;
let clearFormCallback = undefined;
const emptyState = {
    id: null,
    teacher: {
        id: null,
        title: null,
    },
    subject: {
        id: null,
        title: null,
    },
    subs: new Map(),
    comment: "",
}
let state = structuredClone(emptyState);

/** Форма добавления отзыва
 * @param clearFormCallbackLocal
 * @param {SuggestionGetResponse|null} data
 * @param {boolean} modeModerator
 * */
export function createAddReviewForm(clearFormCallbackLocal, data=null, modeModerator=false) {
    isUserModerator = modeModerator;
    clearFormCallback = clearFormCallbackLocal;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderAddReviewForm(isUserModerator);

    const root = getElements(wrapper);

    bindEvents(wrapper, root)

    if (data) {
        state.id = data.id;
        state.teacher = data.teacher;
        state.subject = data.subject;
        state.comment = data.text;
        state.subs = new Map(data.subs.map(item => [item.title, item]));
    }

    refreshForm(root);

    return wrapper;
}

const inputState = {
    teacher: {
        type: "teacher",
        controller: undefined,
        timeout: undefined,
        value: "",
    },
    subject: {
        type: "subject",
        controller: undefined,
        timeout: undefined,
        value: "",
    },
    subs: {
        type: "subject",
        controller: undefined,
        timeout: undefined,
        value: "",
    },
};

function bindEvents(wrapper, root) {
    wrapper.addEventListener("click", (e) => {
        if (e.target === root.teacher.reset) {
            root.teacher.input.value = "";
            root.teacher.container.innerHTML = "";
        }
        if (e.target === root.subject.reset) {
            root.subject.input.value = "";
            root.subject.container.innerHTML = "";
        }
        if (e.target === root.subs.reset) {
            root.subs.input.value = "";
            root.subs.container.innerHTML = "";
        }
        if (e.target.classList.contains('rev-list-item-reset')) {
            const key = e.target.getAttribute('data-id');
            state.subs.delete(key)
            refreshList(root.subs, state.subs);
        }
        if (isUserModerator) {
            if (e.target === root.submit) {
                commitSuggestion()
            }
            if (e.target === root.cancel) {
                rejectSuggestion('rejected')
            }
            if (e.target === root.spam) {
                rejectSuggestion('spam')
            }
            if (e.target === root.exit) {
                state = structuredClone(emptyState);
                clearFormCallback();
            }
        } else {
            if (e.target === root.submit) {
                sendSuggestion()
            }
            if (e.target === root.cancel) {
                clearForm(root);
            }
        }
    });
    function inputEvent (e)  {
        if (e.target === root.comment.input) {
            state.comment = root.comment.input.value;

            const length = root.comment.input.value.length;
            root.comment.counter.textContent = length.toString()

            const exceeded = length >= MAX_TEXTAREA;
            root.comment.input.classList.toggle('limit-exceeded', exceeded);
            root.comment.counter.parentElement.classList.toggle('limit-exceeded', exceeded);

            const scrollY = window.scrollY;
            root.comment.input.style.height = 'auto';
            root.comment.input.style.height = root.comment.input.scrollHeight + 'px';
            window.scrollTo(window.scrollX, scrollY + 1000);
        }
        if (e.target === root.teacher.input) {
            inputState.teacher.value = root.teacher.input.value;
            clearTimeout(inputState.teacher.timeout);
            inputState.teacher.timeout = setTimeout(() => {
                search(
                    root.teacher,
                    inputState.teacher,
                    state.teacher,
                    loadSingle
                );}, 300
            );
        }
        if (e.target === root.subject.input) {
            inputState.subject.value = root.subject.input.value;
            clearTimeout(inputState.subject.timeout);
            inputState.subject.timeout = setTimeout(() => {
                search(
                    root.subject,
                    inputState.subject,
                    state.subject,
                    loadSingle
                );}, 300
            );
        }
        if (e.target === root.subs.input) {
            inputState.subs.value = root.subs.input.value;
            clearTimeout(inputState.subs.timeout);
            inputState.subs.timeout = setTimeout(() => {
                search(
                    root.subs,
                    inputState.subs,
                    state.subs,
                    loadList
                );}, 300
            );
        }
    }
    wrapper.addEventListener("input", inputEvent)
    wrapper.addEventListener("keydown", (event) => {
        if (event.key === 'Enter') {
            inputEvent(event)
        }
    })
}

function sendSuggestion() {
    if (state.teacher.title === null) {
        alert("Пожалуйста, выберите преподавателя =]");
        return;
    }
    if (state.subject.title === null) {
        alert("Пожалуйста, выберите основной предмет =]");
        return;
    }
    if (normalizeString(state.comment).length === 0) {
        alert("Не слишком ли мало вы написали?)");
        return;
    }
    const requestBody = {
        teacher: state.teacher,
        subject: state.subject,
        subs: Array.from(state.subs.values()),
        text: state.comment,
    }
    // console.info(JSON.stringify(requestBody));
    fetchSendSuggestion(requestBody).then(_ => {
        alert("Спасибо! Отзыв будет опубликован как только пройдёт модерацию =)")
        state = structuredClone(emptyState);
        clearFormCallback();
    }).catch(status => {
        alert(`Сервер ответил ${status}`)
    })
}

function commitSuggestion() {
    if (state.id === null) alert('Suggestion id пустой!')

    if (state.teacher.id === null) {
        alert("Выберите существующего преподавателя");
        return;
    }
    if (state.subject.id === null) {
        alert("Выберите существующий основной предмет");
        return;
    }
    for (let s in state.subs) {
        if (s.id === null) {
            alert("Выберите существующие предметы");
            return;
        }
    }
    if (normalizeString(state.comment).length === 0) {
        alert("Перепроверьте текст отзыва, он пустой");
        return;
    }
    const requestBody = {
        teacher: state.teacher,
        subject: state.subject,
        subs: Array.from(state.subs.values()),
        text: state.comment,
    }
    // console.info(JSON.stringify(requestBody));
    fetchCommitSuggestion(state.id, requestBody).then(_ => {
        state = structuredClone(emptyState);
        clearFormCallback();
    }).catch(status => {
        alert(`Сервер ответил ${status}`)
    })
}

function rejectSuggestion(status) {
    if (state.id === null) alert('Suggestion id пустой!')

    const confirmation = confirm(`Отклонить отзыв (${status})?`);
    if (!confirmation) return;

    /** @param {SuggestionCancelResponse} data */
    fetchCancelSuggestion(state.id, status).then(data => {
        if (data.status !== status) {
            alert('Статус не сохранён')
        }
        clearFormCallback();
    }).catch(status => {
        alert(`Сервер ответил ${status}`);
    })
}

function search(rootEl, is, s, load) {
    if (!is.value || is.value.length < 3) return;

    is.controller?.abort();
    is.controller = new AbortController();

    fetchSearch(normalizeString(is.value), is.controller, is.type).then(data => {
        rootEl.container.innerHTML = "";
        data.results.push({
            id: -1,
            title: "Добавить новый",
            type: "add"
        })
        const searchBox = createSearch(data, (id, type, title) => {load(rootEl, is, s, id, type, title)});
        if (searchBox) rootEl.container.appendChild(searchBox);
        else rootEl.container.innerHTML = strings.brokeSearchText;
    }).catch(status => {
        rootEl.container.innerHTML = strings.statusSearchText(status);
        if (status === 404) {
            const dt = {
                results: [{
                    id: -1,
                    title: "Добавить новый",
                    type: "add"
                }],
            }
            const searchBox = createSearch(dt, (id, type, title) => {
                load(rootEl, is, s, id, type, title)
            });
            if (searchBox) rootEl.container.appendChild(searchBox);
        }
    })
}

function loadSingle(rootEl, is, s, id, type, title) {
    rootEl.container.innerHTML = "";
    if (type !== is.type && type !== "add") return;

    if (type === "add") {
        const newTitle = normalizeString(is.value)
        if (newTitle.length === 0) return;
        s.id = null;
        s.title = newTitle;
    } else {
        s.id = id;
        s.title = title;
    }

    refreshSingle(rootEl, s)
}

function refreshSingle(rootEl, s) {
    if (s.title === null) {
        rootEl.status.innerHTML = `Ничего не выбрано`;
        return;
    }
    if (s.id === null) {
        rootEl.status.innerHTML = `Добавлен новый: <span class="normal-text">${s.title}</span>`;
    }
    rootEl.status.innerHTML = `Выбран: <span class="normal-text">${s.title}</span>`;

    rootEl.input.value = "";
    rootEl.input.placeholder = s.title;
}

function loadList(rootEl, is, s, id, type, title) {
    rootEl.container.innerHTML = "";
    if (type !== is.type && type !== "add") return;

    if (type === "add") {
        id = null;
        title = is.value;
    }

    s.set(title, {
        id: id,
        title: title
    })
    refreshList(rootEl, s)
}

function refreshList(rootEl, s) {
    if (s.size === 0) {
        rootEl.status.innerHTML = `<p class="add-rev-status">Ничего не выбрано</p>`;
        return;
    }

    const revList = document.createElement("div");
    revList.classList.add("rev-list");

    revList.innerHTML = `
        <div class="rev-list">
            <p class="rev-list-title">Выбрано: </p>
            ${Array.from(s, ([title, item]) => `
                <div class="rev-list-item">
                    ${item.id === null ? `<span class="muted-text">(новый)</span>` : ''}
                    ${item.title}
                    <button class="rev-list-item-reset" data-id="${title}">&times;</button>
                </div>
            `).join('')}
        </div>
    `;

    rootEl.status.innerHTML = "";
    rootEl.status.appendChild(revList);
}

function refreshComment(rootEl, s) {
    rootEl.input.value = s;
}

function clearForm(root) {
    state = structuredClone(emptyState);
    refreshForm(root);
}

function refreshForm(root) {
    refreshSingle(root.teacher, state.teacher);
    refreshSingle(root.subject, state.subject);
    refreshList(root.subs, state.subs);
    refreshComment(root.comment, state.comment);
}
