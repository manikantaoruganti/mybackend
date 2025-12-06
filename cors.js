import express from 'express';

const app = express();
app.use(express.json());
app.get('/get-users',(req,res)=>{
    res.send("api success");
})
app.post('/add-user',(req,res)=> {
let data=req.body;
console.log(data);
res.send("data added");

});
app.listen(7080, () => {
    console.log("server is running at port 707");
});