// import express from 'express';

// const app = express();

// app.get('/', (req, res) => {
//     res.send("hello");
// });

// app.listen(707, () => {
//     console.log("server is running at port 707");
// });
// import express from 'express';

// const app = express();
 
// app.get('/', (req, res) => {
//     res.send("hello");
// });

 
// app.get('/users', (req, res) => {
//     res.json({
//         name: "thub",
//         role: "student",
//         status: "active"
//     });
// });

// app.listen(707, () => {
//     console.log("server is running at port 707");
// });

 
// import http from 'http';

// const server = http.createServer((req, res) => {
//     console.log(req.method);
//     if(req.url=="/users"){
//          res.writeHead(200, { "content-type": "application/json" });
//          res.end(JSON.stringify({name: "thub"}))
//     }else
//     res.writeHead(200, { "content-type": "text/plain" });
//     res.end("hello this is from backend");
// });
// server.listen(7007, () => {
//     console.log(`server running at port ${7007}`);
// });
  import express from 'express';

const app = express();


app.use(express.json());

app.post('/add-user', (req, res) => {
  let mydata = req.body;
  console.log(mydata);
  res.send("data added");
});

app.get('/users', (req, res) => {
  console.log("hello this is");
  res.send("all users");
});
app.listen(7007, () => {
  console.log(`server running at port 7007`);
});


 