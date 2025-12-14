'use strict';
import {fetchTeacher} from "./api";
import {brokeReviewsText, createReviewContentBox, statusReviewsText} from "./ui.js";

const INJECTED_ELEMENT_SELECTOR = 'reviews';
const STATUS_BOX_SELECTOR = 'reviewsStatusBox';

/** Подражание инфицируемому интерфейсу **/
const REVIEW_TITLE_HTML = `<div class="border-top mt-3"></div>
<div class="person-info-label mt-3 mt-xl-2"><div class="text-gray-60 mb-2">
    Оценки и отзывы:
</div></div>
<div id="${STATUS_BOX_SELECTOR}">
    Загружаем...
</div>`

/** Создаёт пустой блок reviews на сайте **/
function createReviewBlock(id) {
    const box = document.createElement('div');
    box.id = INJECTED_ELEMENT_SELECTOR;
    box.innerHTML = REVIEW_TITLE_HTML;
    fetchTeacher(id).then(resolveReviewBlock, rejectReviewBlock)
    return box;
}

/** Заполняет блок отзывов в случае удачного запроса **/
async function resolveReviewBlock(data) {
    const status_box = document.querySelector("#" + STATUS_BOX_SELECTOR);
    const injected = document.querySelector("#" + INJECTED_ELEMENT_SELECTOR);

    const content = createReviewContentBox(data);
    if (content !== null) {
        injected.append(content);
        status_box.remove();
    } else {
        console.log(data);
        status_box.innerHTML = brokeReviewsText;
    }
}

/** Заполняет status в случае неудачного запроса **/
async function rejectReviewBlock(status) {
    const status_box = document.querySelector("#" + STATUS_BOX_SELECTOR);
    status_box.innerHTML = statusReviewsText(status);
}


/** Реагирует на изменения в DOM **/
function observeChangeDOM(create) {
    console.log("[INJECTOR] injector started");
    const observer = new MutationObserver(() => {
        // Проверяем корректность URL
        const match = location.pathname.match(/^\/persons\/(\d+)/);
        if (!match) {
            // console.log("[INJECTOR] unsuitable URL");
            return;
        }
        // Проверяем отсутствие вставляемого элемента
        const injected = document.querySelector("#" + INJECTED_ELEMENT_SELECTOR);
        if (injected) {
            // console.log("[INJECTOR] element already injected");
            return;
        }
        // Находим элемент для вставки
        const injectable = document
            .querySelector('div.flex-grow-1.w-100.col-lg.col-12')
            ?.querySelector('div.card-body.p-3');
        if (!injectable) {
            // console.log("[INJECTOR] injectable element is not exists");
            return;
        }
        // Вставляем элемент
        injectable.appendChild(create(match[1]));
        console.log("[INJECTOR] element injected");
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

observeChangeDOM(createReviewBlock)
