const express=require('express')
const app=express();
const port=8000;
const cors=require('cors')
const path=require('path');
const router=require('./route/router');
const mongoose=require('mongoose');
require("dotenv").config();
const jwt = require("jsonwebtoken");
mongoose.connect('mongodb+srv://msmrutiranjan35:Mallick123@cluster0.ixm9mkf.mongodb.net/Trisha')
.then(()=>console.log('MongoDB Connected Successfully'))
.catch((err)=>console.log(err))
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cors({
    origin:'http://localhost:5173',
    methods:['GET','POST','PUT','DELETE']
}))
app.use('/api',router);
app.use('/uploads',express.static(path.join(__dirname,"uploads")));
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})