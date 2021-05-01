const express = require("express");
const app = express();

app.get("/getmodules", function(request, response){
    let myjson = [
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
    ];

    let text = JSON.stringify(myjson);
    setTimeout(function () {
        response.set("Access-Control-Allow-Origin", "*");
        response.send(text);
    },3000);

});

app.listen(8000);
