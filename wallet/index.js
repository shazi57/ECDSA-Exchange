const express = require('express');
const app = express();
const cors = require('cors');
const secp = require("@noble/secp256k1");
const port = 3043;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  console.log(req.body);
  console.log(req.headers.authorization);
  let signature;
  try {

    const encoded = new TextEncoder().encode(req.body);
    const msgHash = await secp.utils.sha256(encoded);
    const privateKey = req.headers.authorization;
    signature = await secp.sign(msgHash, privateKey);
  } catch (err) {
    console.log(err);
  }
  res.send({
    signature,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
