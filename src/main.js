import * as strings from "./ui/strings.js";
import {createMenu, createSearch, createTeacher, createSubject} from "./ui/ui.js";
import {fetchSearch, fetchTeacher, fetchSubject} from "./api/api.js";

export let isuBox, container, statusBox;
let content = 'empty';
let input, inputReset, menuBtn;
let timeoutId;
let abortController;


/** Создаём интерфейс */
export function createMainPage() {
    statusBox = document.querySelector('#reviews-status-box');
    isuBox = document.querySelector('#reviews-isu-box');
    container = document.querySelector('#reviews-container');
    input = document.querySelector('#reviews-input');
    inputReset = document.querySelector('#reviews-input-reset');
    menuBtn = document.querySelector('#reviews-menu');

    inputReset.addEventListener('click', () => {
        content = 'empty';
        statusBox.innerHTML = '';
        container.innerHTML = '';
    });
    menuBtn.addEventListener('click', () => {
        content = 'menu';
        statusBox.innerHTML = '';
        container.innerHTML = '';
        container.appendChild(createMenu());
    })
    input.addEventListener('input', () => {
        content = 'reviews';
        // debouncer
        clearTimeout(timeoutId);
        timeoutId = setTimeout(search, 300);
    });
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
        const searchBox = createSearch(data, load);
        if (content !== 'reviews') return;
        if (searchBox) {
            statusBox.innerHTML = "";
            container.innerHTML = "";
            container.appendChild(searchBox);
        } else {
            container.innerHTML = "";
            statusBox.innerHTML = strings.brokeSearchText;
        }
    }).catch(status => {
        if (content !== 'reviews') return;
        container.innerHTML = "";
        statusBox.innerHTML = strings.statusSearchText(status);
    })
}

/** Загрузка отзывов по преподу/предмету **/
async function load(id, type) {
    switch (type) {
        case 'teacher':
            fetchTeacher(id).then(data => {
                const teacher = createTeacher(data);
                if (content !== 'reviews') return;
                if (teacher !== null) {
                    container.innerHTML = "";
                    container.appendChild(teacher);
                }
                else statusBox.innerHTML = strings.brokeReviewsText;
            }).catch(status => {
                statusBox.innerHTML = strings.statusReviewsText(status);
            })
            break;
        case 'subject':
            fetchSubject(id).then(data => {
                const subject = createSubject(data);
                if (content !== 'reviews') return;
                if (subject !== null) {
                    container.innerHTML = "";
                    container.appendChild(subject);
                }
                else statusBox.innerHTML = strings.brokeReviewsText;
            }).catch(status => {
                statusBox.innerHTML = strings.statusReviewsText(status);
            })
            break;
        default:
            console.error(`Неизвестный type ${type}`);
            statusBox.innerHTML = strings.unknownTypeText;
    }
}
