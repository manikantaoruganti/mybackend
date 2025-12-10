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
// import express from 'express';
// const app = express();
// app.use(express.json());
// let users = ['ram','ram@gmail.com'];
// app.get('/get-users', (req, res) => {
//     res.json(users);
// });
// app.post('/add-user', (req, res) => {
//     const { name, email } = req.body;

//     const newUser = {
//         name,
//         email
//     };
//     users.push(newUser);
//     res.status(201).json({ message: "User added successfully", user: newUser });
// });
// app.listen(7080, () => {
//     console.log("server is running at port 7080");
// });
import express from 'express';
const app = express();
app.use(express.json());

let users = [
    { id: 1, name: 'ram', email: 'ram@gmail.com' }
];
app.get('/get-users', (req, res) => {
    res.json(users);
});
app.post('/add-user', (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email
    };
    users.push(newUser);
    res.status(201).json({ message: "User added successfully", user: newUser });
});
app.put('/edit-user/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    const user = users.find(u => u.id === parseInt(id));

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    res.json({ message: "User updated successfully", user });
});
app.delete('/delete-user/:id', (req, res) => {
    const { id } = req.params;
    const index = users.findIndex(u => u.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    const deletedUser = users.splice(index, 1);
    res.json({ message: "User deleted successfully", user: deletedUser[0] });
});
app.listen(7080, () => {
    console.log("server is running at port 7080");
});
   