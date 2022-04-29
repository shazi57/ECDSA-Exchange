const express = require('express');
const app = express();
const cors = require('cors');
const secp = require("@noble/secp256k1");
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

const addressCounts = 3
const privateKeys = new Array(addressCounts).fill(null).map(() => (secp.utils.bytesToHex(secp.utils.randomPrivateKey())));
const balances = {
  [secp.utils.bytesToHex(secp.getPublicKey(privateKeys[0]))]: 100,
  [secp.utils.bytesToHex(secp.getPublicKey(privateKeys[1]))]: 50,
  [secp.utils.bytesToHex(secp.getPublicKey(privateKeys[2]))]: 75,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', async (req, res) => {
  const {sender, recipient, amount} = req.body;
  
  const encoded = new TextEncoder().encode(req.body);
  const rawSignature = req.headers.authorization;
  const signature = new Uint8Array(Object.values(JSON.parse(rawSignature)));
  const messageHash =  await secp.utils.sha256(encoded);;


  const verified = secp.verify(signature,messageHash,sender);
  if (verified) {
    balances[sender] -= amount;
    balances[recipient] = (balances[recipient] || 0) + +amount;
    res.send({ balance: balances[sender] });
  } else {
    res.status(400).end();
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
  console.log("Available Accounts");
  console.log("=================")
  let counter = 0;
  for (let address in balances) {
    console.log(`(${counter}) ${address} (${balances[address]} BTC)`);
    counter++;
  }
  
  console.log("Pirvate Keys")
  console.log("================")
  for (let i = 0; i < privateKeys.length; i++) {
    console.log(`(${i}) ${privateKeys[i]}`);
  }
});
