// import express from 'express';

// const app = express();
// app.use(express.json());
// app.get('/get-users',(req,res)=>{
//     res.send("api success");
// })
// app.post('/add-user',(req,res)=> {
// let data=req.body;
// console.log(data);
// res.send("data added");

// });
// app.listen(7080, () => {
//     console.log("server is running at port 707");
// });
import express from 'express';
const app = express();
app.use(express.json());
let users = ['ram','ram@gmail.com'];
app.get('/get-users', (req, res) => {
    res.json(users);
});
app.post('/add-user', (req, res) => {
    const { name, email } = req.body;

    const newUser = {
        name,
        email
    };
    users.push(newUser);
    res.status(201).json({ message: "User added successfully", user: newUser });
});
app.listen(7080, () => {
    console.log("server is running at port 7080");
});
