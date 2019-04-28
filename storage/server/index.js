const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3010;

app.options('/:id', cors());
app.use(bodyParser.json());
app.use(cors());

app.post('/:id', (req, res) => {
  const filename = path.join('data', req.params.id);
  console.log("BODY", req.body);
  fs.writeFileSync(filename, JSON.stringify(req.body));
  res.send();
});

app.get('/:id', (req, res) => {
  const filename = path.join('data', req.params.id);
  const data = fs.readFileSync(filename);
  res.send(data);
});

app.listen(port, () => console.error(`Listening in port ${port}`));

// curl -XPOST "http://localhost:3010/helloworld" -d '{ "hello": "world" }' -H "Content-Type: application/json"
