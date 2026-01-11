'use strict';

import {createMainPage, isuBox, container} from "./main.js";
import * as strings from "./ui/strings.js";
import {setJwtToken, jwtToken, fetchAuthPLogin} from "./api/api.js";
import {parseJwt, setCookie, getCookie} from "./utils/utils.js";

document.addEventListener('DOMContentLoaded', main);

async function main() {
    createMainPage()
    authenticate()
}

function openForm (_) {
    container.innerHTML = "";
    container.appendChild(createLoginForm());
}

function authenticate() {
    const token = getCookie('access_token');
    if (token) {
        setJwtToken(token)
        const payload = parseJwt(jwtToken);
        if (payload?.isu) {
            isuBox.innerHTML = strings.authStatusText(payload?.isu, payload?.name);
        }
        isuBox.removeEventListener('click', openForm);
    } else {
        isuBox.addEventListener('click', openForm);
    }
}

function createLoginForm() {
    const form = document.createElement("form");
    form.classList.add("login-form");
    form.innerHTML = `
        <p>Это авторизация по id.itmo, <b>не вводите</b> логин и пароль, если не доверяете сайту.</p>
    
        <input type="email" name="email" placeholder="E-mail" required />
        <input type="password" name="password" placeholder="Пароль" required />
    
        <button type="submit">Вход</button>
    `
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        fetchAuthPLogin(form.email.value, form.password.value).then(resp => {
            if (resp?.access_token) setCookie('access_token', resp?.access_token, {secure: true});
            if (resp?.refresh_token) setCookie('refresh_token', resp?.refresh_token, {secure: true});

            container.innerHTML = "";
            authenticate()
        });
    });
    return form;
}
