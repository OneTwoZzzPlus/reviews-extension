import * as strings from "../../strings.js";
import {fetchSearch} from "../../api/api.js";
import {createSearch} from "./tabSearch.js";

const MAX_INPUT = 64;
const MAX_TEXTAREA = 10000;

let isModerator = false;
const emptyState = {
    teacher: {
        id: null,
        title: null,
    },
    subject: {
        id: null,
        title: null,
    },
    subs: new Map(),
    comment: null,
}
let state = structuredClone(emptyState);

/** Форма добавления отзыва */
export function createAddReviewForm(newState=null, isUserModerator=false) {
    isModerator = isUserModerator;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderAddReviewForm();

    const root = getElements(wrapper);

    bindEvents(wrapper, root)

    if (newState !== null) state = newState;

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
        if (e.target === root.cancel) {
            if (!isModerator) {
                clearForm(root);
            }
        }
        if (e.target === root.submit) {
            alert("Упс, добавление отзыва и его модерация пока не реализовано. А пока тестируем форму и не осуждаем =)")
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

function search(rootEl, is, s, load) {
    if (!is.value || is.value.length < 3) return;

    is.controller?.abort();
    is.controller = new AbortController();

    fetchSearch(is.value, is.controller, is.type).then(data => {
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
        s.id = null;
        s.title = is.value;
    } else {
        s.id = id;
        s.title = title;
    }

    refreshSingle(rootEl, s)
}

function refreshSingle(rootEl, s) {
    if (s.title === null) {
        rootEl.status.innerHTML = `Никого не выбрано`;
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

function getElements(root) {
    return {
        teacher: {
            input: root.querySelector("#addrev-teacher-input"),
            reset: root.querySelector("#addrev-teacher-input-reset"),
            container: root.querySelector("#addrev-teacher-container"),
            status: root.querySelector("#addrev-teacher-status"),
        },
        subject: {
            input: root.querySelector("#addrev-subject-input"),
            reset: root.querySelector("#addrev-subject-input-reset"),
            container: root.querySelector("#addrev-subject-container"),
            status: root.querySelector("#addrev-subject-status"),
        },
        subs: {
            input: root.querySelector("#addrev-sub-input"),
            reset: root.querySelector("#addrev-sub-input-reset"),
            container: root.querySelector("#addrev-sub-container"),
            status: root.querySelector("#addrev-sub-status"),
        },
        comment: {
            input: root.querySelector("#addrev-comment-input"),
            counter: root.querySelector("#addrev-comment-char-count"),
        },
        submit: root.querySelector("#addrev-commit"),
        cancel: root.querySelector("#addrev-cancel"),
    };
}

function renderAddReviewForm() {
    return `
        <p class="add-rev-label">* Добавление нового отзыва, для преподавателя...</p>
        <div id="addrev-teacher-input-wrapper" class="rev-input-wrapper">
            <label for="addrev-teacher-input">ФИО преподавателя</label>
            <input type="text" id="addrev-teacher-input" class="rev-input" 
                placeholder="Иванов Иван Иванович" 
                maxlength="${MAX_INPUT}"/>
            <button type="reset" id="addrev-teacher-input-reset" class="rev-input-reset">&times;</button>
        </div>
        <div id="addrev-teacher-container"></div>
        <p id="addrev-teacher-status" class="add-rev-status">Никого не выбрано</p>
        
        <p class="add-rev-label">* По какому предмету вы его знаете? <i>(Выберите основной)</i></p>
        <div id="addrev-subject-input-wrapper" class="rev-input-wrapper">
            <label for="addrev-subject-input">Название предмета</label>
            <input type="text" id="addrev-subject-input" class="rev-input" 
            placeholder="Математический анализ" 
            maxlength="${MAX_INPUT}"/>
            <button type="reset" id="addrev-subject-input-reset" class="rev-input-reset">&times;</button>
        </div>
        <div id="addrev-subject-container"></div>
        <p id="addrev-subject-status" class="add-rev-status">Ничего не выбрано</p>
        
        <p class="add-rev-label">Какие еще предметы ведет? <i>(Отметьте, если знаете)</i></p>
        <div id="addrev-sub-input-wrapper" class="rev-input-wrapper">
            <label for="addrev-sub-input">Название предмета</label>
            <input type="text" id="addrev-sub-input" class="rev-input" 
                placeholder="Алгебра" 
                maxlength="${MAX_INPUT}"/>
            <button type="reset" id="addrev-sub-input-reset" class="rev-input-reset">&times;</button>
        </div>
        <div id="addrev-sub-container"></div>
        <div id="addrev-sub-status">
            <p class="add-rev-status">Ничего не выбрано</p>
        </div>
                
        <p class="add-rev-label">
            * Что можете о нём сказать? <br/>
            <i>Как относиться к студентам? Как преподаёт? Трудно ли закрыться? Укажите уровень, если это английский.</i>
        </p>
        <div class="comment-textarea-wrapper">
            <label for="addrev-comment-input">Комментарий</label>
            <textarea
                    id="addrev-comment-input"
                    class="comment-input"
                    placeholder="Можно писать кратко (обычно пишут 3–5 предложений)..."
                    maxlength="${MAX_TEXTAREA}"
            ></textarea>
            <div class="comment-char-counter">
                <span id="addrev-comment-char-count">0</span>/${MAX_TEXTAREA}
            </div>
        </div>
        <button id="addrev-commit" class="rev-button">
            ${isModerator ? "Добавить отзыв" : "Отправить анонимный отзыв"}
        </button>
        <button id="addrev-cancel" class="rev-button-s">
            ${isModerator ? "Отклонить отзыв" : "Очистить"}
        </button>
    `
}
