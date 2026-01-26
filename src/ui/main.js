import * as strings from "../strings.js";
import {createMainPageFilling} from "./tabs/tabMenu.js";
import {createSearch} from "./tabs/tabSearch.js";
import {createTeacher} from "./tabs/tabTeacher.js";
import {createSubject} from "./tabs/tabSubject.js";
import {createLoginForm} from "./tabs/tabLogin.js";
import {createAddReviewForm} from "./tabs/tabAddReview.js";
import {
    fetchSearch,
    fetchTeacher,
    fetchSubject,
    fetchIsModerator,
    fetchGetSuggestionList,
    fetchGetSuggestion
} from "../api/api.js";
import {createListReviewsForm} from "./tabs/tabListReviews.js";

let header;
let isuBox, container, statusBox;
let input, inputReset, menuBtn;
let loginCallback = undefined;
let logoutCallback = undefined;
let content = 'dashboard';
let isAuth = false;
let isUserModerator = false;
let timeoutId;
let abortController;


/** Контроллер страницы */
export function createMainPage(logoutCallbackLocal, loginCallbackLocal=undefined) {
    loginCallback = loginCallbackLocal;
    logoutCallback = logoutCallbackLocal;
    statusBox = document.querySelector('#reviews-status-box');
    isuBox = document.querySelector('#reviews-isu-box');
    container = document.querySelector('#reviews-container');
    input = document.querySelector('#reviews-input');
    inputReset = document.querySelector('#reviews-input-reset');
    menuBtn = document.querySelector('#reviews-menu');
    header = document.querySelector('#reviews-header');

    inputReset.addEventListener('click', () => {
        input.value = '';
        input.focus();
        clearMainPage();
    });
    menuBtn.addEventListener('click', clearMainPage)

    input.addEventListener('input', inputEvent);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            inputEvent();
        }
    });
}

/** Чистим страницу */
export function clearMainPage() {
    content = 'dashboard';
    header.innerHTML = strings.mainHeader;
    statusBox.innerHTML = '';
    container.innerHTML = '';
    container.appendChild(createMainPageFilling(
        isAuth, isUserModerator,
        logoutCallback,
        load,
        openAddReview,
        openModeratorPanel
    ));
}

/** Открыть login форму */
export function openLoginForm() {
    content = 'login';
    header.innerHTML = strings.loginHeader;
    container.innerHTML = "";
    container.appendChild(createLoginForm(loginCallback));
}

/** В статус авторизованного */
export function resolveLogin(payload) {
    isAuth = true;
    isuBox.innerHTML = strings.authStatusText(payload?.isu, payload?.name);
    if (loginCallback !== undefined) isuBox.removeEventListener('click', openLoginForm);
    clearMainPage()

    /** @param {ModeratorResponse} data */
    fetchIsModerator().then(data => {
        if (data?.access) {
            isUserModerator = true;
            console.log('You are moderator: ', isUserModerator);
            clearMainPage();
        }
    }).catch(() => {})
}

/** В статус не авторизованного */
export function rejectLogin(isuBoxHTML) {
    isAuth = false;
    isUserModerator = false;
    isuBox.innerHTML = isuBoxHTML;
    if (loginCallback !== undefined) {
        isuBox.removeEventListener('click', openLoginForm);
        isuBox.addEventListener('click', openLoginForm);
    }
    clearMainPage()
}

/** Обработка отправки */
function inputEvent() {
    content = 'search';
    // debouncer
    clearTimeout(timeoutId);
    timeoutId = setTimeout(search, 300);
}

/** Обрабатываем ввод в строку поиска **/
async function search() {
    const name = input.value.trim();
    if (!name) {
        statusBox.innerHTML = "";
        return;
    } else if (name.length < 3) {
        statusBox.innerHTML = strings.fewCharactersText;
        return;
    }

    statusBox.innerHTML = strings.loadingText;

    abortController?.abort();
    abortController = new AbortController();

    fetchSearch(name, abortController).then(data => {
        if (content !== 'search') return;
        header.innerHTML = strings.mainHeader;
        const searchBox = createSearch(data, (id, type) => {
            if (content !== 'search') return;
            load(id, type);
        }, isUserModerator);
        if (searchBox) {
            statusBox.innerHTML = "";
            container.innerHTML = "";
            container.appendChild(searchBox);
        } else {
            container.innerHTML = "";
            statusBox.innerHTML = strings.brokeSearchText;
        }
    }).catch(status => {
        if (content !== 'search') return;
        header.innerHTML = strings.mainHeader;
        container.innerHTML = "";
        statusBox.innerHTML = strings.statusSearchText(status);
    })
}

/** Загрузка отзывов по преподу/предмету **/
async function load(id, type) {
    content = 'reviews'
    statusBox.innerHTML = strings.loadingText;
    switch (type) {
        case 'teacher':
            fetchTeacher(id).then(data => {
                const teacher = createTeacher(data, isAuth);
                if (content !== 'reviews') return;
                if (teacher !== null) {
                    statusBox.innerHTML = "";
                    container.innerHTML = "";
                    container.appendChild(teacher);
                    return;
                }
                statusBox.innerHTML = strings.brokeReviewsText;
                content = 'search';
            }).catch(status => {
                statusBox.innerHTML = strings.statusReviewsText(status);
                content = 'search';
            })
            break;
        case 'subject':
            fetchSubject(id).then(data => {
                const subject = createSubject(data, isAuth);
                if (content !== 'reviews') return;
                if (subject !== null) {
                    statusBox.innerHTML = "";
                    container.innerHTML = "";
                    container.appendChild(subject);
                    return;
                }
                statusBox.innerHTML = strings.brokeReviewsText;
                content = 'search';
            }).catch(status => {
                statusBox.innerHTML = strings.statusReviewsText(status);
                content = 'search';
            })
            break;
        default:
            console.error(`Неизвестный type ${type}`);
            statusBox.innerHTML = strings.unknownTypeText;
            content = 'search';
    }
}

function openAddReview() {
    content = 'add-review';
    header.innerHTML = strings.addHeader;
    statusBox.innerHTML = '';
    container.innerHTML = '';
    container.appendChild(createAddReviewForm(clearMainPage));
}

function openModeratorPanel() {
    if (!isUserModerator) return;
    content = 'moderator';
    header.innerHTML = strings.moderationHeader;
    statusBox.innerHTML = 'Загрузка предложки...';
    container.innerHTML = '';

    /** @param {SuggestionListResponse} data */
    fetchGetSuggestionList().then(data => {
        if (content !== 'moderator') return;
        statusBox.innerHTML = '';
        if (data.items.length === 0) {
            statusBox.innerHTML = 'Предложка пуста =)';
        }
        container.innerHTML = '';
        container.appendChild(createListReviewsForm(openModerationReview, data));
    }).catch(status => {
        statusBox.innerHTML = `Сервер ответил ${status}`;
    })

}

function openModerationReview(id) {
    if (!isUserModerator) return;
    content = 'moderator-review';
    header.innerHTML = strings.moderationHeader;
    statusBox.innerHTML = 'Загрузка отзыва...';

    fetchGetSuggestion(id).then(data => {
        statusBox.innerHTML = '';
        container.innerHTML = '';
        container.appendChild(createAddReviewForm(
            openModeratorPanel, data, true
        ));
    }).catch(status => {
        openModeratorPanel()
        if (status === 404) statusBox.innerHTML = 'Нет такого отзыва в предложке =(';
        statusBox.innerHTML = `Сервер ответил ${status}`;
    })
}