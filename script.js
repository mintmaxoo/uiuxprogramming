const serviceName = "책들"
let isSubscribed = false;
let submitCount = 0;

function makeSubscribeMessage(email, subscribed) {
    if (subscribed == true) {
        return email + "로 신청이 완료되었습니다. 이제 책을 다 읽으면 기록 묶음이 발송됩니다.";
    }
    return "이메일을 입력한 뒤 신청해 주세요.";
}

const subscribeForm = document.querySelector("#subscribe-form");
const emailInput = document.querySelector("#email");
const subscribeButton = document.querySelector("#subscribeButton");
const subscribeMessage = document.querySelector("#subscribeMessage");

function handleSubscribe(event) {
    event.preventDefault();

    const subscriberEmail = emailInput.value.trim();

    if (subscriberEmail === "") {
        subscribeMessage.textContent = 
            "이메일을 입력한 뒤 신청해 주세요.";
        emailInput.focus();
        return;
    }

    isSubscribed = true;
    submitCount += 1;

    subscribeMessage.textContent 
        = makeSubscribeMessage(subscriberEmail, isSubscribed);

    subscribeMessage.classList.add("is-success");

    subscribeButton.textContent = "신청 완료";
    subscribeButton.disabled = true;
}

function handleEmailInput() {
    if (isSubscribed) {
        isSubscribed = false;
        subscribeButton.disabled = false;
        subscribeButton.textContent = "기록 묶음 신청";
        subscribeMessage.textContent = "이메일을 입력한 뒤 신청해 주세요.";
        subscribeMessage.classList.remove("is-success");
    }
}

subscribeForm.addEventListener("submit", handleSubscribe);
emailInput.addEventListener("input", handleEmailInput);

const themeButton = document.querySelector("#themeButton");
const userNameInput = document.querySelector("#userName");
const userNameCount = document.querySelector("#userNameCount");
const agreeCheck = document.querySelector("#agreeCheck");
const agreeMessage = document.querySelector("#agreeMessage");
const startButton = document.querySelector("#startButton");

function handleThemeClick() {
    const isDark = document.body.classList.toggle("dark");

    themeButton.textContent = isDark
        ? "라이트 테마로 바꾸기"
        : "다크 테마로 바꾸기";
}

themeButton.addEventListener("click", handleThemeClick);

function handleUserNameInput() {
    const maxLength = userNameInput.maxLength;
    const currentLength = Math.min(userNameInput.value.length, maxLength);

    userNameCount.textContent = currentLength + " / " + maxLength;
}

userNameInput.addEventListener("input", handleUserNameInput);

function handleAgreeChange() {
    const agreed = agreeCheck.checked;

    startButton.disabled = !agreed;
    agreeMessage.textContent = agreed
        ? "확인이 완료되었습니다. 책 추가를 시작할 수 있습니다."
        : "이용 방법 확인 후 책 추가를 시작할 수 있습니다.";

    agreeMessage.classList.toggle("is-ready", agreed);
}

agreeCheck.addEventListener("change", handleAgreeChange);

const tabs = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

function resetTabsAndPanels() { 
    tabs.forEach(function (tab) {
        tab.classList.remove("is-active");
        tab.setAttribute("aria-selected", "false");
    });
    panels.forEach(function (panel) {
        panel.classList.remove("is-active");
        panel.hidden = true;
    });
}

function activateTab(clickedTab) { 
    const targetSelector = clickedTab.dataset.target;
    const targetPanel = document.querySelector(targetSelector);

    clickedTab.classList.add("is-active");
    clickedTab.setAttribute("aria-selected", "true");

    targetPanel.classList.add("is-active");
    targetPanel.hidden = false;
}

function handleTabClick(event) { 
    resetTabsAndPanels();
    activateTab(event.currentTarget);
}

tabs.forEach(function (tab) {
    tab.addEventListener("click", handleTabClick);
});

const bookFlow = document.querySelector("#book-flow");
const flowSteps = bookFlow.querySelectorAll(".step");
const progressItems = bookFlow.querySelectorAll(".progress_item");
const titleInput = document.querySelector("#book-title");
const titleError = document.querySelector("#title-error");
const titleNext = document.querySelector("#title-next");
const isReading = document.querySelector("#is-reading");
const readingDetails = document.querySelector("#reading-details");
const startDateInput = document.querySelector("#start-date");
const optionPrev = document.querySelector("#option-prev");
const optionNext = document.querySelector("#option-next");
const summaryPrev = document.querySelector("#summary-prev");
const finishButton = document.querySelector("#finish-button");
const restartButton = document.querySelector("#restart-button");
const summaryTitle = document.querySelector("#summary-title");
const summaryStatus = document.querySelector("#summary-status");
const summaryUnit = document.querySelector("#summary-unit");
const summaryDate = document.querySelector("#summary-date");
const bookForm = document.querySelector("#book-form");
const titleField = document.querySelector("#title-field");
const titleHelp = document.querySelector("#title-help");
const titleHelpText = "읽고 있거나 읽을 책의 제목을 적어 주세요.";
const titleCount = document.querySelector("#title-count");
const dateField = document.querySelector("#date-field");
const dateError = document.querySelector("#date-error");
const submitStatus = document.querySelector("#submit-status");
const completeMessage = document.querySelector("#complete-message");
const forceSaveFailure = new URLSearchParams(location.search).has("save-error");

const bookData = {
    title: "", unit: "page", isReadingNow: false, startDate: ""
};

let currentStep = 0;
let isSaving = false;

function showStep(index) {
    currentStep = index;
    flowSteps.forEach((step, i) => { step.hidden = i !== index; });
    progressItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === index);
    });

    const heading = flowSteps[index].querySelector("h3");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
}

function startAddFlow() {
    bookFlow.hidden = false;
    bookShelf.hidden = false;
    renderBookShelf();
    resetBookForm();
    showStep(0);
    titleInput.focus();
    bookFlow.scrollIntoView({ behavior: "smooth" });
}

startButton.addEventListener("click", startAddFlow);

function setFieldError(field, input, errorElement, message) {
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
    field.classList.remove("is-valid");
    field.classList.add("has-error");

    if (field === titleField) {
        if (message.includes("이미")) {
            titleHelp.textContent = "다른 책이라면 저자나 출판사를 덧붙여 구분해 주세요."; 
        } else {
            titleHelp.textContent = titleHelpText; 
        }
    }
}

function clearFieldError(field, input, errorElement) {
    input.removeAttribute("aria-invalid");
    errorElement.textContent = "";
    field.classList.remove("has-error");
}

function normalizeTitle(text) {
    return text.replace(/\s+/g, "").toLowerCase();
}

function isDuplicateTitle(title) {
    const target = normalizeTitle(title);
    let found = false;

    books.forEach((book) => {
        if (normalizeTitle(book.title) === target) found = true;
    });

    return found;
}

function updateTitleExperience() {
    const trimmed = titleInput.value.trim();
    const isInvalid = titleInput.getAttribute("aria-invalid") === "true";
    const enough = trimmed.length > 0;

    titleCount.textContent = titleInput.value.length + " / 60자";
    titleField.classList.toggle("is-valid", enough && !isInvalid);

    if (!isInvalid) {
        titleHelp.textContent = enough ? "입력 조건을 충족했어요." : titleHelpText;
    }
}

function validateTitle() {
    const rawValue = titleInput.value;
    const title = rawValue.trim();

    if (!title) {
        const message = rawValue.length > 0
            ? "공백이 아닌 글자를 입력해 주세요."
            : "책 제목을 입력해 주세요.";
        setFieldError(titleField, titleInput, titleError, message);
        return false;
    }

    if (isDuplicateTitle(title)) {
        setFieldError(
            titleField, titleInput, titleError,
            "같은 제목의 책이 이미 책장에 있어요."
        );
        return false;
    }

    clearFieldError(titleField, titleInput, titleError);
    updateTitleExperience();
    bookData.title = title;
    return true;
}

titleInput.addEventListener("input", () => {
    updateTitleExperience();

    if (titleInput.getAttribute("aria-invalid") === "true") {
        validateTitle();
    }
});

titleNext.addEventListener("click", () => {
    if (!validateTitle()) {
        titleInput.focus();
        return;
    }
    showStep(1);
});

function getTodayString() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return now.getFullYear() + "-" + month + "-" + day;
}

function syncReadingFields() {
    const open = isReading.checked;

    isReading.setAttribute("aria-expanded", String(open));
    readingDetails.hidden = !open;
    startDateInput.disabled = !open;
    startDateInput.max = getTodayString();

    if (!open) clearFieldError(dateField, startDateInput, dateError);
}

function validateStartDate() {
    if (!isReading.checked) {
        clearFieldError(dateField, startDateInput, dateError);
        document.querySelector("#date-help").textContent = "책을 읽기 시작한 날짜를 입력해 보세요.";
        return true;
    }

    if (startDateInput.validity.badInput) {
        setFieldError(
            dateField, startDateInput, dateError,
            "존재하지 않거나 올바르지 않은 날짜예요."
        );
        document.querySelector("#date-help").textContent = "";
        return false;
    }

    if (!startDateInput.value) {
        clearFieldError(dateField, startDateInput, dateError);
        document.querySelector("#date-help").textContent = "책을 읽기 시작한 날짜를 입력해 보세요.";
        return true;
    }

    if (startDateInput.value > getTodayString()) {
        setFieldError(
            dateField, startDateInput, dateError,
            "오늘 이후의 날짜는 선택할 수 없어요."
        );
        document.querySelector("#date-help").textContent = "";
        return false;
    }

    clearFieldError(dateField, startDateInput, dateError);
    document.querySelector("#date-help").textContent = "선택한 날짜로 기록됩니다.";
    return true;
}

isReading.addEventListener("change", syncReadingFields);
startDateInput.addEventListener("input", validateStartDate);
startDateInput.addEventListener("change", validateStartDate);
startDateInput.addEventListener("blur", validateStartDate);
syncReadingFields();

optionPrev.addEventListener("click", () => showStep(0));

function formatStartDate(date) {
    return date ? date : "입력 안 함";
}

optionNext.addEventListener("click", () => {
    if (!validateStartDate()) {
        startDateInput.focus();
        return;
    }

    const selectedUnitRadio = document.querySelector('input[name="record-unit"]:checked');
    bookData.unit = selectedUnitRadio ? selectedUnitRadio.value : "page";
    bookData.isReadingNow = isReading.checked;
    bookData.startDate = bookData.isReadingNow ? startDateInput.value : "";

    summaryTitle.textContent = bookData.title;
    summaryStatus.textContent = bookData.isReadingNow ? "읽는 중" : "읽을 예정";
    summaryUnit.textContent = (bookData.unit === "page") ? "페이지" : "퍼센트";
    summaryDate.textContent = formatStartDate(bookData.startDate);

    showStep(2);
});

summaryPrev.addEventListener("click", () => showStep(1));

function setSubmitState(loading, message, isError) {
    isSaving = loading;
    bookForm.setAttribute("aria-busy", String(loading));
    finishButton.disabled = loading;
    finishButton.textContent = loading ? "담는 중…" : "책 추가 완료";
    submitStatus.textContent = message;
    submitStatus.classList.toggle("is-error", isError === true);
}

function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function persistBook(book) {
    await wait(600);

    if (forceSaveFailure) {
        throw new Error("저장 실패 시험");
    }

    books.push(book);
    return saveBooks();
}

bookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (currentStep === 0) { titleNext.click(); return; }
    if (currentStep === 1) { optionNext.click(); return; }
    if (currentStep !== 2 || isSaving) return;

    if (!validateTitle()) {
        showStep(0);
        titleInput.focus();
        return;
    }
    if (!validateStartDate()) {
        showStep(1);
        startDateInput.focus();
        return;
    }

    const book = {
        title: bookData.title,
        unit: bookData.unit,
        status: bookData.isReadingNow ? "읽는 중" : "읽을 예정",
        startDate: bookData.startDate
    };

    setSubmitState(true, "책장에 담는 중…", false);

    let savedInBrowser = true;
    try {
        savedInBrowser = await persistBook(book);
    } catch {
        setSubmitState(
            false,
            "책장에 담지 못했어요. 입력한 내용은 그대로 두었으니 다시 시도해 주세요.",
            true
        );
        return;
    }

    renderBookShelf();
    completeMessage.textContent =
        "'" + book.title + "' 책이 아래 내 책장에 담겼습니다. 책장에서 확인하거나 다른 책을 더 추가해 보세요."
        + (savedInBrowser ? "" : " (브라우저 저장 공간을 사용할 수 없어 새로고침하면 사라질 수 있어요.)");
    setSubmitState(false, "", false);
    showStep(3);
});

function resetBookForm() {
    bookForm.reset();

    bookData.title = "";
    bookData.unit = "page";
    bookData.isReadingNow = false;
    bookData.startDate = "";

    clearFieldError(titleField, titleInput, titleError);
    clearFieldError(dateField, startDateInput, dateError);
    updateTitleExperience();
    syncReadingFields();

    summaryTitle.textContent = "";
    summaryStatus.textContent = "";
    summaryUnit.textContent = "";
    summaryDate.textContent = "";
    setSubmitState(false, "", false);
}

restartButton.addEventListener("click", startAddFlow);

const bookShelf = document.querySelector("#book-shelf");
const bookListEmpty = document.querySelector("#bookListEmpty");
const bookCards = document.querySelector("#bookCards");
const bookSummary = document.querySelector("#bookSummary");
const goShelfButton = document.querySelector("#go-shelf-button");
const bookDetailDialog = document.querySelector("#bookDetailDialog");
const detailTitle = document.querySelector("#detailTitle");
const detailStatus = document.querySelector("#detailStatus");
const detailUnit = document.querySelector("#detailUnit");
const detailStartDate = document.querySelector("#detailStartDate");
const detailCloseButton = document.querySelector("#detailCloseButton");
const shelfGuide = document.querySelector("#shelf-guide");

const storageKey = "books-shelf-v1";

function loadBooks() {
    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
        if (!Array.isArray(stored)) return [];

        return stored
            .filter((book) => book && typeof book.title === "string")
            .map((book) => ({
                title: book.title,
                unit: book.unit === "percent" ? "percent" : "page",
                status: book.status === "읽는 중" ? "읽는 중" : "읽을 예정",
                startDate: typeof book.startDate === "string" ? book.startDate : ""
            }));
    } catch {
        return [];
    }
}

function saveBooks() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(books));
        return true;
    } catch {
        return false;
    }
}

const books = loadBooks();

function setStatusPill(element, status) {
    element.textContent = status;
    element.classList.toggle("is-reading", status === "읽는 중");
}

function openBookDetail(book) {
    detailTitle.textContent = book.title;
    setStatusPill(detailStatus, book.status);
    detailUnit.textContent = book.unit === "page" ? "페이지" : "퍼센트";
    detailStartDate.textContent = formatStartDate(book.startDate);
    bookDetailDialog.showModal();
}

detailCloseButton.addEventListener("click", () => bookDetailDialog.close());

goShelfButton.addEventListener("click", () => {
    bookShelf.scrollIntoView({ behavior: "smooth" });
});

function createBookCard(book) {
    const card = document.createElement("li");
    const cardButton = document.createElement("button");
    cardButton.type = "button";
    cardButton.className = "book-card-button";

    const title = document.createElement("h3");
    title.textContent = book.title;
    
    const pill = document.createElement("span");
    pill.className = "status-pill";

    setStatusPill(pill, book.status);

    cardButton.append(title, pill);
    card.append(cardButton);

    cardButton.addEventListener("click", () => openBookDetail(book));

    return card;
}

function renderBookShelf() {
    bookCards.replaceChildren();

    const isEmpty = books.length === 0;
    bookListEmpty.hidden = !isEmpty;
    shelfGuide.hidden = isEmpty;

    let readingCount = 0;
    let plannedCount = 0;

    books.forEach((book) => {
        bookCards.append(createBookCard(book));

        if (book.status === "읽는 중") readingCount += 1;
        else if (book.status === "읽을 예정") plannedCount += 1;
    });

    bookSummary.textContent = "읽는 중 " + readingCount + "권 · 읽을 예정 " + plannedCount + "권";
    bookSummary.hidden = isEmpty;
}

if (books.length > 0) {
    bookShelf.hidden = false;
    renderBookShelf();
}