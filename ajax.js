var express = require("express");
var urlLib = require("url");
var mysql = require("mysql");
var expressStatic = require("express-static");
var qs = require("querystring");

var server = express();
const db = mysql.createConnection({
    user: "root",
    database: "ajax",
    host: "localhost",
    password: "113647",
    port: "3306"
});

server.get("/search", function (req, res) {
    var urlParseObj = urlLib.parse(req.url, true);
    var query = urlParseObj.query;
    var number = query.number;
    if (!number || number === "") {
        res.status(404).send("查询参数出错");
        return;
    }
    var result = "没有找到员工";
    db.query(`SELECT * FROM staff WHERE number=${number};`, (err, data) => {
        if (err) {
            result = "数据库出错请稍后再试！";
        } else if (data.length !== 0) {
            result = `
            员工编号: ${data[0].number},
            员工姓名: ${data[0].name},
            员工性别: ${data[0].sex},
            员工职位: ${data[0].job}`
        }
        res.status(200).send(result);
    });
});

server.post("/create", function (req, res) {
    var str = "";
    var result = "新建员工失败";
    req.on("data", function (data) {
        str += data;
    });
    req.on("end", function () {
        // 返回的是一个post数据对象
        var urlParseObj = qs.parse(str);
        var name = urlParseObj.name;
        var job = urlParseObj.job;
        var number = Number(urlParseObj.number);
        var sex = urlParseObj.sex;
        console.log(urlParseObj);
        if (urlParseObj.name === "" || urlParseObj.sex === "" || urlParseObj.job === "" || urlParseObj.number === "") {
            res.status(404).send("员工信息不全请重新填写");
        } else {
            db.query(`INSERT INTO staff(name,job,number,sex) VALUES('${name}','${job}', '${number}','${sex}');`, function (err, data) {
                if (err) {
                    result = "数据库出错请稍后再试" + err;
                } else {
                    result = "新建员工成功！";
                }
                res.status(200).send(result);
            });
        }
    });
});
server.use(expressStatic(__dirname + "/www"));

server.listen(8080);