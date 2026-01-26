import * as strings from "../../strings.js";
import {renderMainPage} from "./creation/renderMainPage.js";

/** Меню */
export function createMainPageFilling(isAuth, isUserModerator,
                                      logoutCallback,
                                      loadReviewsCallback,
                                      openAddReviewCallback,
                                      openModeratorPanelCallback) {
    const wrapper = document.createElement("div");

    wrapper.appendChild(createMenu(
        isAuth, isUserModerator,
        logoutCallback,
        openAddReviewCallback,
        openModeratorPanelCallback
    ));
    wrapper.appendChild(createContent(
        loadReviewsCallback
    ));

    return wrapper;
}

function createMenu(isAuth, isUserModerator,
                    logoutCallback,
                    openAddReviewCallback,
                    openModeratorPanelCallback) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("reviews-menu");

    const addReviewButton = document.createElement("button");
    addReviewButton.classList.add("reviews-menu-item");
    addReviewButton.innerHTML = strings.menuAddReviewBtnLabel;
    addReviewButton.addEventListener("click", openAddReviewCallback)
    // addReviewButton.disabled = true;
    wrapper.appendChild(addReviewButton);

    if (isUserModerator) {
        const myReviewButton = document.createElement("button");
        myReviewButton.classList.add("reviews-menu-item");
        myReviewButton.innerHTML = strings.menuMyReviewBtnLabel;
        myReviewButton.addEventListener("click", openModeratorPanelCallback)
        // myReviewButton.disabled = true;
        wrapper.appendChild(myReviewButton);
    }

    if (isAuth) {
        const logoutButton = document.createElement("button");
        logoutButton.classList.add("reviews-menu-item");
        logoutButton.innerHTML = strings.menuLogoutBtnLabel;
        logoutButton.addEventListener("click", logoutCallback)
        wrapper.appendChild(logoutButton);
    }

    return wrapper;
}

function createContent(loadReviewsCallback) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = renderMainPage();

    wrapper.addEventListener("click", (e) => {
        if (e.target.classList.contains('tile')) {
            const key = e.target.getAttribute('data-id');
            loadReviewsCallback(key, 'subject')
        }
    })
    return wrapper
}