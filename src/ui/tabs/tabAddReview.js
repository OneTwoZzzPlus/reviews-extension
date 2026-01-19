import * as strings from "../../strings.js";

/** Форма добавления отзыва */
export function createAddReviewForm(teacher_id=null) {
    const wrapper = document.createElement("div");
    wrapper.classList.add();
    wrapper.innerHTML = renderAddReviewForm();

    const root = getElements(wrapper);

    return wrapper;
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
        sub: {
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
    };
}

function renderAddReviewForm() {
    return `
        <p class="add-rev-label">* Добавление нового отзыва, для преподавателя...</p>
        <div id="addrev-teacher-input-wrapper" class="rev-input-wrapper">
            <label for="addrev-teacher-input">ФИО преподавателя</label>
            <input type="text" id="addrev-teacher-input" class="rev-input" placeholder="Иванов Иван Иванович" />
            <button type="reset" id="addrev-teacher-input-reset" class="rev-input-reset">&times;</button>
        </div>
        <div id="addrev-teacher-container"></div>
        <p id="addrev-teacher-status" class="add-rev-status">Никого не выбрано</p>
        
        <p class="add-rev-label">* По какому предмету вы его знаете? <i>(Выберите основной)</i></p>
        <div id="addrev-subject-input-wrapper" class="rev-input-wrapper">
            <label for="addrev-subject-input">Название предмета</label>
            <input type="text" id="addrev-subject-input" class="rev-input" placeholder="Математический анализ" />
            <button type="reset" id="addrev-subject-input-reset" class="rev-input-reset">&times;</button>
        </div>
        <div id="addrev-subject-container"></div>
        <p id="addrev-subject-status" class="add-rev-status">Ничего не выбрано</p>
        
        <p class="add-rev-label">Какие еще предметы ведет? <i>(Отметьте, если знаете)</i></p>
        <div id="addrev-sub-input-wrapper" class="rev-input-wrapper">
            <label for="addrev-sub-input">Название предмета</label>
            <input type="text" id="addrev-sub-input" class="rev-input" placeholder="Математический анализ" />
            <button type="reset" id="addrev-sub-input-reset" class="rev-input-reset">&times;</button>
        </div>
        <div id="addrev-sub-container"></div>
        <div id="addrev-sub-status">
            <p id="addrev-sub-status" class="add-rev-status">Ничего не выбрано</p>
        </div>
                
        <p class="add-rev-label">
            * Что можете о нём сказать? <br/>
            <i>Что он за человек? Как он преподаёт? Трудно ли закрыться?</i>
        </p>
        <div class="comment-textarea-wrapper">
            <label for="addrev-comment-input">Комментарий</label>
            <textarea
                    id="addrev-comment-input"
                    class="comment-input"
                    placeholder="Можно писать кратко (обычно пишут 3–5 предложений)..."
                    maxlength="32768"
            ></textarea>
            <div class="comment-char-counter">
                <span id="addrev-comment-char-count">0</span>/32768
            </div>
        </div>
        <button id="addrev-commit" class="rev-button">Отправить анонимный отзыв</button>
    `
}
