import "./index.scss";
import * as secp from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";

const server = "http://localhost:3042";

document
  .getElementById("exchange-address")
  .addEventListener("input", ({ target: { value } }) => {
    if (value === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    fetch(`${server}/balance/${value}`)
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      });
  });

document.getElementById("transfer-amount").addEventListener("click", transfer);

async function transfer() {
  const amount = document.getElementById("send-amount").value || 1;
  const sender = document.getElementById("exchange-address").value;
  const recipient = document.getElementById("recipient").value;
  const key = document.getElementById("private-key").value;

  const message = utf8ToBytes(JSON.stringify(amount));
  const signature = await secp.sign(message, key);

  const body = JSON.stringify({
    sender,
    amount,
    recipient,
    message,
    signature,
  });

  const request = new Request(`${server}/send`, { method: "POST", body });

  fetch(request, { headers: { "Content-Type": "application/json" } })
    .then((response) => response.json())
    .then(({ balance }) => {
      document.getElementById("balance").innerHTML = balance;
    });
}
