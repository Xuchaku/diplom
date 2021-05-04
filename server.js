const express = require("express");
const app = express();
const fs = require('fs');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileUpload({}));
app.use(express.static(__dirname));
app.get("/getmodules", function(request, response){
    let data = fs.readFileSync("./uploads/allmodule.json");
    let myjson = JSON.parse(data.toString())["modules"];

    /*let myjson = [
        {
            name: "Name",
            desc: "Bla bla bla bla",
            type: "boolean",
            script: "(function m(){return graph.getCountPath() > 7})"
        },
        {
            name: "Name",
            desc: "Bla bla bla bla",
            type: "boolean",
            script: "(function a(){return graph.getCountPath() > 3})"
        }
    ];*/

    let text = JSON.stringify(myjson);
    setTimeout(function () {
        response.set("Access-Control-Allow-Origin", "*");
        response.send(text);
    },3000);

});
app.get("/gettask", function(request, response){
    let data = fs.readFileSync("./tasks/alltask.json");
    let dataJson = JSON.parse(data.toString());
    let randomIndex = Math.floor(Math.random()*dataJson["tasks"].length);
    response.set("Access-Control-Allow-Origin", "*");
    response.send(JSON.stringify(dataJson["tasks"][randomIndex]));
});
app.post("/setmodule", function (request, response) {
    let textFile =request.files.file["data"].toString();
    let obj = JSON.parse(textFile);

    let data = fs.readFileSync("./uploads/allmodule.json");
    let allmodule = JSON.parse(data.toString());
    allmodule["modules"].push(obj);
    let dataout = JSON.stringify(allmodule);
    fs.writeFileSync("./uploads/allmodule.json", dataout);
    response.set("Access-Control-Allow-Origin", "*");
    response.send("Text");

});
app.post("/settask", function (request, response) {
    let body = '';
    request.on('data',function(data) { body += data; });
    request.on('end', function(data) {
        request.body = JSON.parse(body);
        let dataTasks = fs.readFileSync("./tasks/alltask.json");
        let allTasks = JSON.parse(dataTasks.toString());
        allTasks['tasks'].push(request.body);
        fs.writeFileSync("./tasks/alltask.json", JSON.stringify(allTasks));
    });
    response.set("Access-Control-Allow-Origin", "*");
    response.send("Text");
});

app.listen(8000);
