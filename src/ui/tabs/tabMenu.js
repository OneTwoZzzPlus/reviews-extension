import * as strings from "../../strings.js";

/** Меню */
export function createMenu(isAuth, isUserModerator,
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
