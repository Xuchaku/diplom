const express = require("express");
const app = express();
const fs = require('fs');
const fileUpload = require('express-fileupload');
const bodyParser = require("body-parser");

//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ type: 'text/plain' }))
app.use(express.json());
//app.use(fileUpload({}));
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
app.get("/getsolution", function (request,response) {
    let data = fs.readFileSync("./solutions/allsolutions.json");
    let solutions = JSON.parse(data.toString());
    let randomIndex = Math.floor(Math.random()* solutions["allsolutions"].length);

    response.set("Access-Control-Allow-Origin", "*");
    response.send(JSON.stringify(solutions["allsolutions"][randomIndex]));
});
app.get("/gettask", function(request, response){
    let data = fs.readFileSync("./tasks/alltask.json");
    let dataJson = JSON.parse(data.toString());
    let randomIndex = Math.floor(Math.random()*dataJson["tasks"].length);
    response.set("Access-Control-Allow-Origin", "*");
    response.send(JSON.stringify(dataJson["tasks"][randomIndex]));
});
app.post("/loadsolution", function (request, response) {
    let data = request.body;
    console.log(data);
    let solution = JSON.parse(data);
    let tasksData = fs.readFileSync("./tasks/alltask.json");
    let tasks = JSON.parse(tasksData.toString());

    let answer = true
    let targetTask = null;
    for(let i =0;i<tasks["tasks"].length;i++){
        if(tasks["tasks"][i].id == solution.id){
            targetTask = tasks["tasks"][i];
            break;
        }
    }
    if(targetTask != null){
        for(let key in targetTask['option']){
            if(solution[key] != targetTask['option'][key]){
                answer = false;
            }
        }
    }
    console.log(answer);

    response.set("Access-Control-Allow-Origin", "*");
   if(answer){
        let solutionsData = fs.readFileSync("./solutions/allsolutions.json");
        let solutions = JSON.parse(solutionsData.toString());
        solutions["allsolutions"].push({
            "historyText": solution["historyText"],
            "name": solution["name"],
            "history": solution["history"],
            "id": solution["id"]
        });
        fs.writeFileSync("./solutions/allsolutions.json", JSON.stringify(solutions));

        response.send("success");
        console.log("S");
    }
    else{
        response.send("error");
        console.log("N");
    }






});
app.post("/setmodule", function (request, response) {
    /*
    let textFile =request.files.file["data"].toString();
    let obj = JSON.parse(textFile);

    let data = fs.readFileSync("./uploads/allmodule.json");
    let allmodule = JSON.parse(data.toString());
    allmodule["modules"].push(obj);
    let dataout = JSON.stringify(allmodule);
    fs.writeFileSync("./uploads/allmodule.json", dataout);

     */
    let data = request.body;

    let obj = JSON.parse(data);
    console.log(obj);
    let dataf = fs.readFileSync("./uploads/allmodule.json");
    let allmodule = JSON.parse(dataf.toString());
    allmodule["modules"].push(obj);
    let dataout = JSON.stringify(allmodule);
    fs.writeFileSync("./uploads/allmodule.json", dataout);

    response.set("Access-Control-Allow-Origin", "*");
    response.send("Text");

});
app.post("/settask", function (request, response) {
    let data = request.body;

    let obj = JSON.parse(data);
    let dataTasks = fs.readFileSync("./tasks/alltask.json");
    let allTasks = JSON.parse(dataTasks.toString());
    allTasks['tasks'].push(obj);
    fs.writeFileSync("./tasks/alltask.json", JSON.stringify(allTasks));

    response.set("Access-Control-Allow-Origin", "*");
    response.send("Text");
});

app.listen(8000);
