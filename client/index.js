import "./index.scss";
const server = "http://localhost:3042";
const walletServer = "http://localhost:3043";
let signature;

function openForm() {
  document.getElementById("popupForm").style.display = "block";
}
function closeForm() {
  document.getElementById("popupForm").style.display = "none";
}

function toggleButtonToDone() {
  const generateButton = document.getElementById("generate-signature");
  generateButton.innerHTML = "SIGNATURE GENERATED";
  generateButton.style.backgroundColor = 'blue';
  generateButton.style.color = "white";
  generateButton.style.pointerEvents = "none";
}

function toggleButtonToDefault() {
  const generateButton = document.getElementById("generate-signature");
  generateButton.innerHTML = "GENERATE SIGNATURE";
  generateButton.style.backgroundColor = '#f58427';
  generateButton.style.color = 'black';
  generateButton.style.pointerEvents = "auto";
}

document.getElementById("cancel-button").addEventListener('click', () => {
  closeForm();
})

document.getElementById("submit-button").addEventListener('click', (e) => {
  e.preventDefault();
  toggleButtonToDone();
  closeForm();
})

document.getElementById("generate-signature").addEventListener('click', async() => {
  openForm();
})

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("submit-button").addEventListener('click', () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  const privateKey = document.getElementById("privateKey").value;

  const body = JSON.stringify({
    sender, amount, recipient
  });
  const sendRequest = new Request(`${walletServer}/generate`, { method: 'POST', body });

  fetch(sendRequest, { headers: { 'Content-Type': 'application/json', authorization: privateKey }}).then(response => {
    return response.json();
  }).then((data) => {
    signature = data.signature;
    console.log(signature);
  }).catch(() => {
    alert('[INVALID PRIVATE KEY] check your private key again!');
  })
})

document.getElementById("transfer-amount").addEventListener('click', async () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  const body = JSON.stringify({
    sender, amount, recipient
  });

  // sign a message
  const sendRequest = new Request(`${server}/send`, { method: 'POST', body });

  fetch(sendRequest, { headers: { 'Content-Type': 'application/json', 'authorization': JSON.stringify(signature) }}).then(response => {
    console.log(response);
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error('invalid token error');
    }
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
    alert(`Successfully validated and sent ${amount} to ${recipient}`);
  }).catch(() => {
    alert('[INVALID SIGNATURE] Please check your private key and try it again');
  }).finally(() => {
    toggleButtonToDefault();
  })
});
