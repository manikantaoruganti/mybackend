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
//   import express from 'express';

// const app = express();


// app.use(express.json());

// app.post('/add-user', (req, res) => {
//   let mydata = req.body;
//   console.log(mydata);
//   res.send("data added");
// });

// app.get('/users', (req, res) => {
//   console.log("hello this is");
//   res.send("all users");
// });
// app.listen(7007, () => {
//   console.log(`server running at port 7007`);
// });

// import express from 'express';
// const  app = express();
// app.use(express.json());

// app.post('/add-user', (req, res) => {
//   let mydata = req.body;
//   console.log("POST /add-user:", mydata);
//   res.send("data added");
// });
// app.get('/users', (req, res) => {
//   console.log("GET /users");
//   res.send("all users");
// });
// app.get('/users/:id', (req, res) => {
//   let id = req.params.id;
//   console.log("GET /users/" + id);
//   res.send("single user " + id);
// });
 
// app.put('/users/:id', (req, res) => {
//   let id = req.params.id;
//   let data = req.body;
//   console.log("PUT /users/" + id, data);
//   res.send("user " + id + " updated");
// });
 
// app.patch('/users/:id', (req, res) => {
//   let id = req.params.id;
//   let data = req.body;
//   console.log("PATCH /users/" + id, data);
//   res.send("user " + id + " partially updated");
// });


// app.delete('/users/:id', (req, res) => {
//   let id = req.params.id;
//   console.log("DELETE /users/" + id);
//   res.send("user " + id + " deleted");
// });
// app.listen(7007, () => {
//   console.log(`server running at port 7007`);
// });
import express from "express";
import router from "./routes/studentroutes.js";

const app = express();
app.use(express.json());

app.use("/", router);

app.listen(7007, () => {
  console.log("server running at port 7007");
});
