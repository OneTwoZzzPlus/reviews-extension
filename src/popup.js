'use strict';

import * as strings from "./ui/strings.js";
import {createSearch, createTeacher, createSubject} from "./ui/ui.js";
import {fetchSearch, fetchTeacher, fetchSubject} from "./api.js";

document.addEventListener('DOMContentLoaded', main);

/** Добавляем переходы по ссылкам в другую вкладку **/
document.body.addEventListener('click', function (e) {
    if (e.target.matches('a[href]')) {
        chrome.tabs.create({url: e.target.href});
    }
});

let statusBox, container, input;
let timeoutId;
let abortController;

function main() {
    statusBox = document.querySelector('#reviews-status-box');
    container = document.querySelector('#reviews-container');
    input = document.querySelector('#reviews-input');

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
        statusBox.innerHTML = strings.fewCharactersText;
        return;
    }

    statusBox.innerHTML = strings.loadingText;

    abortController?.abort();
    abortController = new AbortController();

    fetchSearch(name, abortController).then(data => {
        const search = createSearch(data, load);
        if (search) {
            statusBox.innerHTML = "";
            container.innerHTML = "";
            container.appendChild(search);
        } else {
            statusBox.innerHTML = strings.brokeSearchText;
        }
    }).catch(status => {
        statusBox.innerHTML = strings.statusSearchText(status);
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
                else statusBox.innerHTML = strings.brokeReviewsText;
            }).catch(status => {
                statusBox.innerHTML = strings.statusReviewsText(status);
            })
            break;
        case 'subject':
            fetchSubject(id).then(data => {
                const subject = createSubject(data);
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

