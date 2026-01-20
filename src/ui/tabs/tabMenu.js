import * as strings from "../../strings.js";

/** Меню */
export function createMenu(isAuth, logoutCallback, openAddReviewCallback) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("reviews-menu");

    const addReviewButton = document.createElement("button");
    addReviewButton.classList.add("reviews-menu-item");
    addReviewButton.innerHTML = strings.menuAddReviewBtnLabel;
    addReviewButton.addEventListener("click", openAddReviewCallback)
    // addReviewButton.disabled = true;
    wrapper.appendChild(addReviewButton);

    if (isAuth) {
        // const myReviewButton = document.createElement("button");
        // myReviewButton.classList.add("reviews-menu-item");
        // myReviewButton.innerHTML = strings.menuMyReviewBtnLabel;
        // myReviewButton.disabled = true; // TODO: onClick
        // wrapper.appendChild(myReviewButton);

        const logoutButton = document.createElement("button");
        logoutButton.classList.add("reviews-menu-item");
        logoutButton.innerHTML = strings.menuLogoutBtnLabel;
        logoutButton.addEventListener("click", logoutCallback)
        wrapper.appendChild(logoutButton);
    }

    return wrapper;
}
