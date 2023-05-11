const express = require('express');
const mysql = require('mysql');
const md5 = require('md5');
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const TokenM = require('./token_manager');
const path = require("path");
const app = express();
app.use(express.json());

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "backend_rudy_test"
})

// conn.connect((err) => {
//     if (err) {
//         console.log('error');
//         return;
//     }
//     console.log('conn');
// })

/// ผมใช้ JWT แทน laravel access token api นะครับ
app.post('/getToken/:user_id', (req, res) => {
    res.send(TokenM.GenerateToken({ "user_id": req.params.user_id }));
})

app.post('/check_auth', (req, res) => {
    console.log(req.headers);
    let status = TokenM.checkAuth(req);
    if (status != false) {
        console.log(status);
    } else {
        console.log("Error");
    }
})

app.post('/login', (req, res) => {
    let { username, password } = req.body;
    let sql = "SELECT * FROM tb_user WHERE username=? AND password=?"
    try {
        conn.query(sql, [username, password], (result, err) => {
            if (err) {
                console.log(err);
                return res.send();
            }
            res.send(result);
        })
    } catch (error) {
        console.log(error);
    }
});

app.post('/register', (req, res, next) => {
    let { username, password, firstname, lastname } = req.body;
    let insertdata = "INSERT INTO tb_user (username,password,firstname,lastname) VALUES(?,?,?,?)";
    try {
        if (!(username && password && firstname && lastname)) {
            res.status(400).send('Please Fill Your Data ')
        }
        newpassword = md5(password);
        conn.query(insertdata, [username, newpassword, firstname, lastname], (err) => {

            if (err) {
                console.log("cant register" + err);
                return res.send();
            }
            console.log("complete");
        })
    } catch (error) {
        console.log(error);
    }
})

app.use(
    bodyParser.json({
        limit: "50mb",
    })
);
app.use(
    bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
    })
);
app.use(
    fileUpload({
        createParentPath: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.post('/uploadimg', (req, res) => {
    // console.log(req.files.files.name);
    let fileName = path.extname(req.files.files.name);
    let NewName = Math.random().toString(10).substring(2, 20);
    NewName = NewName + fileName;
    let sql = "INSERT INTO tb_user (image) VALUES(?)";
    let sql2 = "UPDATE tb_user SET image=? WHERE id=1";
    try {
        conn.query(sql2, [NewName], (result) => {
            const pathmove = path.join('public/' + 'image/' + NewName);
            req.files.files.mv(pathmove, (err) => {
                if (err) {
                    console.log(err);
                }
                console.log(pathmove);
            })
        })
    } catch (error) {
        console.log(error);
    }
})

app.listen(3000, () => { console.log("RUN"); })
