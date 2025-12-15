function parseCommentDate(dateStr) {
    if (!dateStr) return -Infinity;
    // "HH:MM DD.MM.YYYY"
    const match = dateStr.match(
        /(\d{2}):(\d{2})\s+(\d{2})\.(\d{2})\.(\d{4})/
    );
    if (!match) return -Infinity;
    const [, hh, mm, dd, MM, yyyy] = match;
    return new Date(
        Number(yyyy),
        Number(MM) - 1,
        Number(dd),
        Number(hh),
        Number(mm)
    ).getTime();
}

function sortComments(comments, model = 0) {
    return [...comments].sort((a, b) => {
        const timeA = parseCommentDate(a.date);
        const timeB = parseCommentDate(b.date);
        if (Number.isNaN(timeA) || Number.isNaN(timeB)) return 0;
        switch (model) {
            case 0: return timeB - timeA;
            case 1: return timeA - timeB;
            default: return 0
        }
    });
}

function createDropdown(commentsData, commentsBox) {
    const wrapper = document.createElement("select");
    wrapper.name = "sort";
    wrapper.classList.add("comments-dropdown");
    wrapper.addEventListener("change", (event) => {
        const model = parseInt(event.target.value);
        console.log(`[UI] sorting model ${model}`);
        commentsBox.innerHTML = createComments(commentsData, model);
    })
    wrapper.innerHTML = `
        <option value="0">Сначала новые</option>
        <option value="1">Сначала старые</option>`
    return wrapper
}

function createComments(commentsData, model = 0) {
    const sortedComments = sortComments(commentsData, model);
    return sortedComments.map(item => `
        <div class="comment">
            <div class="comment-head">
                Отзыв ${item.date}
                ${item?.subject ? ` по предмету "${item.subject.title}"` : ' '}
                ${item?.source ? ` источник "<a href=" ${item.source.link ?? ''}">${item.source.title}</a>"` : ''}
            </div>
            <div>${item.text}</div>
        </div>
    `).join('');
}

/** @param {TeacherResponse} data **/
export default function createReviewsContentBox(data) {
    if (!data ||
        !Array.isArray(data.summaries) ||
        !Array.isArray(data.comments) ||
        (data.summaries.length === 0 && data.comments.length === 0)
    ) return null;

    const summariesHTML = data.summaries.map(item => `
        <div class="summary">
            <span>${item.title ?? ''}</span>
            <span>${item.value ?? ''}</span>
        </div>
    `).join('');

    const summaries = document.createElement('div');
    summaries.classList.add('summaries');
    summaries.innerHTML = summariesHTML;

    const comments = document.createElement('div');
    comments.classList.add('comments');
    comments.innerHTML = createComments(data.comments);

    const dropdown = createDropdown(data.comments, comments);

    const wrapper = document.createElement('div');
    wrapper.classList.add("reviews-content-box");
    wrapper.appendChild(summaries);
    if (data.comments.length !== 1) wrapper.appendChild(dropdown);
    wrapper.appendChild(comments);

    return wrapper;
}