'use strict';

import {
    createSearch,
    createTeacher,
    createSubject,
    loadingText,
    brokeSearchText,
    statusSearchText,
    brokeReviewsText, statusReviewsText
} from "./ui.js";
import {fetchSearch, fetchTeacher, fetchSubject} from "./api.js";

document.addEventListener('DOMContentLoaded', main);

let statusBox, container, input;
let timeoutId;
let abortController;

function main() {
    statusBox = document.querySelector('#reviewsStatus');
    container = document.querySelector('#reviewsContainer');
    input = document.querySelector('#reviewsInput');

    input.addEventListener('input', () => {
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
        statusBox.innerHTML = "Введите хотя бы 3 символа =/";
        return;
    }

    statusBox.innerHTML = loadingText;

    abortController?.abort();
    abortController = new AbortController();

    fetchSearch(name, abortController).then(data => {
        const search = createSearch(data, load);
        if (search) {
            statusBox.innerHTML = "";
            container.innerHTML = "";
            container.appendChild(search);
        } else {
            statusBox.innerHTML = brokeSearchText;
        }
    }).catch(status => {
        statusBox.innerHTML = statusSearchText(status);
    })
}

/** Загрузка отзывов по преподу/предмету **/
async function load(id, type) {
    switch (type) {
        case 'teacher':
            fetchTeacher(id).then(data => {
                const teacher = createTeacher(data);
                if (teacher !== null) {
                    container.innerHTML = "";
                    container.appendChild(teacher);
                }
                else statusBox.innerHTML = brokeReviewsText;
            }).catch(status => {
                status.innerHTML = statusReviewsText(status);
            })
            break;
        case 'subject':
            fetchSubject(id).then(data => {
                const subject = createSubject(data);
                if (subject !== null) {
                    container.innerHTML = "";
                    container.appendChild(subject);
                }
                else statusBox.innerHTML = brokeReviewsText;
            }).catch(status => {
                status.innerHTML = statusReviewsText(status);
            })
            break;
        default:
            console.error(`Неизвестный type ${type}`);
            statusBox.innerHTML = `<span class="error">Не понятно, что это такое :|</span>`;
    }
}

