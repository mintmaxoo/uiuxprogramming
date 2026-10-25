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

const bookData = {
    title: "", unit: "page", isReadingNow: false, startDate: ""
};

function showStep(index) {
    flowSteps.forEach((step, i) => { step.hidden = i !== index; });
    progressItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === index);
    });
}

startButton.addEventListener("click", () => {
    bookFlow.hidden = false;
    showStep(0);
    bookFlow.scrollIntoView({ behavior: "smooth" });
    titleInput.focus();
});

function validateTitle() {
    const value = titleInput.value.trim();
    if (!value) {
        titleError.textContent = "책 제목을 입력해 주세요.";
        titleInput.classList.add("has-error");
        titleInput.focus();
        return false;
    }
    titleError.textContent = "";
    titleInput.classList.remove("has-error");
    bookData.title = value;
    return true;
}

titleNext.addEventListener("click", () => {
    if (!validateTitle()) return;
    showStep(1);
});

isReading.addEventListener("change", () => {
    readingDetails.hidden = !isReading.checked;
});

optionPrev.addEventListener("click", () => showStep(0));

optionNext.addEventListener("click", () => {
    const selectedUnitRadio = document.querySelector('input[name="record-unit"]:checked');
    bookData.unit = selectedUnitRadio ? selectedUnitRadio.value : "page";
    
    bookData.isReadingNow = isReading.checked;

    if (bookData.isReadingNow) {
        bookData.startDate = startDateInput.value ? startDateInput.value : "-";
    } else {
        bookData.startDate = "-";
    }

    summaryTitle.textContent = bookData.title;
    summaryStatus.textContent = bookData.isReadingNow ? "읽는 중" : "읽을 예정";
    summaryUnit.textContent = (bookData.unit === "page") ? "페이지" : "퍼센트";
    summaryDate.textContent = bookData.startDate;

    showStep(2);
});

summaryPrev.addEventListener("click", () => showStep(1));
finishButton.addEventListener("click", () => showStep(3));

restartButton.addEventListener("click", () => {
    bookData.title = "";
    bookData.unit = "page";
    bookData.isReadingNow = false;
    bookData.startDate = "";

    titleInput.value = "";
    titleError.textContent = "";
    titleInput.classList.remove("has-error");
    
    document.querySelector('input[name="record-unit"][value="page"]').checked = true;
    isReading.checked = false;
    readingDetails.hidden = true;
    startDateInput.value = "";

    summaryTitle.textContent = "";
    summaryStatus.textContent = "";
    summaryUnit.textContent = "";
    summaryDate.textContent = "";

    showStep(0);
});