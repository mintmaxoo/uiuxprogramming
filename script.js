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