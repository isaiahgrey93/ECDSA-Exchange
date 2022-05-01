const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

let accounts = {
  1: {
    balance: 100,
  },
  2: {
    balance: 50,
  },
  3: {
    balance: 75,
  },
};

for (let i = 1; i <= 3; i += 1) {
  const private = secp.utils.bytesToHex(secp.utils.randomPrivateKey());
  const public = secp.utils.bytesToHex(secp.getPublicKey(private, true));

  accounts[public] = {
    ...accounts[i],
    private,
    public,
  };

  delete accounts[i];
}

console.log({ accounts });

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;

  if (accounts[address]) {
    const balance = accounts[address].balance || 0;

    res.send({ balance });
  } else {
    res.send({ balance: 0 });
  }
});

app.post("/send", (req, res) => {
  const sender = req.body.sender;
  const recipient = req.body.recipient;
  const amount = req.body.amount;
  const signature = Uint8Array.from(Object.values(req.body.signature));
  const message = Uint8Array.from(Object.values(req.body.message));

  const verified = secp.verify(signature, message, accounts[sender].public);

  if (
    accounts[sender] &&
    accounts[recipient] &&
    verified &&
    accounts[sender].balance >= amount
  ) {
    accounts[sender].balance -= amount;
    accounts[recipient].balance = (accounts[recipient].balance || 0) + +amount;
  }

  res.send({ balance: accounts[sender].balance });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
