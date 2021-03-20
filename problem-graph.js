const WIDTH_CNV = 640;
const HEIGHT_CNV = 480;
const DEFAULT_COLOR_CNV = "rgb(36,37,43)";

let graph;
let cnv;
let menu;

let colors = ["black", "blue", "red", "yellow", "purple"];
function updateStatistic(props){
}
function isClickOnRoad(x,y) {
}
class DataInput{
    constructor() {
        this.x = 0;
        this.y = 0;
        this.targetPoint = null;
        this.blocked = false;
        this.mode = 0;
        this.elem = document.querySelector("#data");

        this.setname = document.querySelector("#setname");
        this.elemsColor = [];
        this.initColor();

        this.setcolor = document.querySelector(".form_radio_group");
        this.init();
    }
    initColor(){
        let elems = document.querySelectorAll(".form_radio_group-item");
        for(let i=0;i<elems.length;i++){
            elems[i].children[1].style.backgroundColor = colors[i];
            this.elemsColor.push(elems[i].children[0]);
        }
    }
    init(){
        for(let i =0;i<this.elemsColor.length;i++){
            this.elemsColor[i].addEventListener("change", ()=>{
                this.blocked = false;
                this.setcolor.style.display = "none";
                this.targetPoint.isSelected = false;
                this.targetPoint.color = colors[i];
            })
        }
        //поле ввода имени
        this.setname.addEventListener("keydown", (e)=>{
            if(e.code == "Enter"){
                if(this.setname.value == "")
                    return;
                else{
                    for(let key in graph.nodeHash){
                        if(graph.nodeHash[key].name == this.setname.value)
                            return;
                    }
                    this.targetPoint.name = this.setname.value;
                    this.setname.style.display = "none";
                    this.targetPoint.isSelected = false;
                    this.blocked = false;
                }
            }
        });
        this.elem.addEventListener("change", ()=>{
            let select = this.elem.value;

            if(select == "1"){
                console.log("HERE");
                this.setname.value = "";
                this.targetPoint.isSelected = true;
                this.mode = 1;
                this.setname.style.display = "block";
                this.setname.style.left = this.x + "px";
                this.setname.style.top = this.y + "px";
                this.blocked = true;
                this.elem.style.display = "none";
            }
            if(select == "2"){
                this.setcolor.style.display = "block";
                this.targetPoint.isSelected = true;
                this.mode = 2;
                this.setcolor.style.left = this.x + "px";
                this.setcolor.style.top = this.y + "px";
                this.blocked = true;
                this.elem.style.display = "none";
            }
            if(select == "3"){
                let keyDelete = null;
                for(let key in graph.nodeHash){
                    if(this.targetPoint == graph.nodeHash[key]){
                        keyDelete = key;
                        delete graph.nodeHash[key];
                    }
                }
                //удаление путей
                for(let key in graph.nodeHash){
                    for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
                        if(graph.nodeHash[key].roads[i].to == keyDelete){
                            graph.nodeHash[key].roads.splice(i, 1);
                        }
                    }
                }
                this.mode = 3;
                this.elem.style.display = "none";
            }
            if(select == "4"){
                this.blocked = true;
                this.mode = 4;
                this.targetPoint.isSelected = true;
                this.elem.style.display = "none";
            }
            if(select == "5"){
                this.blocked = true;
                this.mode = 5;
                this.targetPoint.isSelected = true;
                this.elem.style.display = "none";
            }
            if(select == "6"){
                this.mode = 5;
                this.blocked = false;
                this.elem.style.display = "none";
            }
        })
    }
    show(node){
        this.targetPoint = node;
        this.x =  node.x + 40 + node.radius;
        this.y = node.y + 60;
        this.elem.style.left = this.x + "px";
        this.elem.style.display = "block";
        this.elem.style.top = this.y + "px";
        node.isConfig = false;
    }

}

class CNV {
    constructor() {
        this.cnv = document.querySelector("#cnv");
        this.ctx = this.cnv.getContext("2d");
        this.cnv.width = WIDTH_CNV;
        this.cnv.height = HEIGHT_CNV;
        this.init();
    }
    changeCursor(name){
        this.cnv.style.cursor = name;
    }
    init() {
        this.otn = this.cnv.getBoundingClientRect();
        this.ctx.font = "16px serif"
    }

    clear() {
        this.ctx.fillStyle = DEFAULT_COLOR_CNV;
        this.ctx.fillRect(0, 0, WIDTH_CNV, HEIGHT_CNV);
    }

    register() {
        let cursorIsHover = false;
        let isMove = false;
        let targetMove = null;
        this.cnv.addEventListener("contextmenu", (e)=>{
            e.preventDefault();
        });
        this.cnv.addEventListener("mousedown", (e) => {
            let x = e.clientX - this.otn.x;
            let y = e.clientY - this.otn.y;
            //добавление вершины
            if(e.which == 1){
                //построение ребра, пока без класса для ребра
                for(let key in graph.nodeHash){
                    if(graph.nodeHash[key].isSelected && menu.mode == 4){
                        for(let key2 in graph.nodeHash){
                            if(Math.abs(graph.nodeHash[key2].x -x) <= graph.nodeHash[key2].radius &&
                                Math.abs(graph.nodeHash[key2].y -y) <= graph.nodeHash[key2].radius){
                                graph.addPath(key, key2);
                                graph.nodeHash[key].isSelected = false;
                                menu.blocked = false;
                            }
                        }
                    }
                    //удаление ребра(можно оптимизировать)
                    if(graph.nodeHash[key].isSelected && menu.mode == 5){
                        for(let key2 in graph.nodeHash){
                            if(Math.abs(graph.nodeHash[key2].x -x) <= graph.nodeHash[key2].radius &&
                                Math.abs(graph.nodeHash[key2].y -y) <= graph.nodeHash[key2].radius){
                                graph.deletePath(key,key2);
                                graph.nodeHash[key].isSelected = false;
                                menu.blocked = false;
                            }
                        }
                    }
                }
                for(let key in graph.nodeHash){
                    if(Math.abs(graph.nodeHash[key].x -x) <= graph.nodeHash[key].radius &&
                        Math.abs(graph.nodeHash[key].y -y) <= graph.nodeHash[key].radius){
                        isMove = true;
                        targetMove = graph.nodeHash[key];
                    }
                }
                //предотвращение постановки точки на тоже место или очень близко
                for(let key in graph.nodeHash){
                    if(Math.abs(graph.nodeHash[key].x -x) <= graph.nodeHash[key].radius+15 &&
                        Math.abs(graph.nodeHash[key].y -y) <= graph.nodeHash[key].radius+15){
                        return;
                    }
                }

                //добавление новой вершины
                graph.add(x,y);
            }
            //вызов меню
            if(e.which == 3){
                //предотвращение запуска конфига на многих элементах
                for(let key in graph.nodeHash){
                    if(graph.nodeHash[key].isConfig){
                        graph.nodeHash[key].isConfig = false;
                    }
                }
                //переход в режим меню для элемента
                for(let key in graph.nodeHash){
                    if(Math.abs(graph.nodeHash[key].x -x) <= graph.nodeHash[key].radius &&
                        Math.abs(graph.nodeHash[key].y -y) <= graph.nodeHash[key].radius){

                        if(!menu.blocked) {
                            graph.nodeHash[key].isConfig = true;
                            menu.show(graph.nodeHash[key]);

                        }
                    }
                }

            }
        });
        this.cnv.addEventListener("mouseup", () => {
            isMove = false;
        });
        this.cnv.addEventListener("mousemove", (e) => {

            let x = e.clientX - this.otn.x;
            let y = e.clientY - this.otn.y;
            //изменение курсора
            for(let key in graph.nodeHash){
                if(Math.abs(graph.nodeHash[key].x -x) <= graph.nodeHash[key].radius &&
                    Math.abs(graph.nodeHash[key].y -y) <= graph.nodeHash[key].radius){
                    cursorIsHover = true;
                }
            }
            if(cursorIsHover){
                this.changeCursor("pointer");
                cursorIsHover = false;
            }
            else{
                this.changeCursor("default");
            }

            //движение
            if(isMove){
                targetMove.x = x;
                targetMove.y = y;
            }

        });
        this.cnv.addEventListener("dblclick", (e) => {

        });

    }
}
class Graph{
    //добавить методы удаления, добавления путей
    constructor(){
        this.nodeHash = {};
        this.cnt = 0;

    }
    add(x,y,name =""){
        this.nodeHash[this.cnt++] = new Node(name, x, y);
    }
    addPath(key, key2){
        graph.nodeHash[key].roads.push({to:key2});
        graph.nodeHash[key2].roads.push({to:key});
    }
    deletePath(key, key2){
        for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
            if(graph.nodeHash[key].roads[i].to == key2){
                graph.nodeHash[key].roads.splice(i, 1);
            }
        }
        for(let i = 0;i<graph.nodeHash[key2].roads.length;i++){
            if(graph.nodeHash[key2].roads[i].to == key){
                graph.nodeHash[key2].roads.splice(i, 1);
            }
        }
    }
    showGraph(){
        cnv.clear();
        cnv.ctx.shadowColor="rgba(137, 183, 26, 1)";
        cnv.ctx.shadowBlur = 0;
        for(let key in this.nodeHash){
            for(let i =0;i<this.nodeHash[key].roads.length;i++){
                let toKey = this.nodeHash[key].roads[i].to;
                cnv.ctx.beginPath();
                cnv.ctx.moveTo(this.nodeHash[key].x, this.nodeHash[key].y);
                cnv.ctx.lineTo(this.nodeHash[toKey].x, this.nodeHash[toKey].y);
                cnv.ctx.stroke();
                cnv.ctx.closePath();
            }
        }
        //вывод имен
        for(let key in this.nodeHash){
            cnv.ctx.fillStyle = "black";
            cnv.ctx.font = "20 Arial";
            cnv.ctx.fillText(this.nodeHash[key].name,this.nodeHash[key].x, this.nodeHash[key].y-this.nodeHash[key].radius*2);
        }
        //вывод вершин
        for(let key in this.nodeHash){
            cnv.ctx.fillStyle = this.nodeHash[key].color || "red";
            cnv.ctx.beginPath();
            cnv.ctx.shadowBlur= this.nodeHash[key].isSelected ? 10 : 0;
            cnv.ctx.arc(this.nodeHash[key].x, this.nodeHash[key].y,this.nodeHash[key].radius, 0 , 2*Math.PI);
            cnv.ctx.fill();
            cnv.ctx.closePath();
        }


    }
}
class Node{
    constructor(name,x,y){
        this.name = name;
        this.color = "red";
        this.radius = 15;
        this.isConfig = false;
        this.isSelected = false;
        this.x = x;
        this.y = y;
        this.roads = [];
    }


}
window.addEventListener("load",()=>{
    let props = {

    };

    cnv = new CNV();
    graph = new Graph();
    menu = new DataInput();
    cnv.clear();
    cnv.register();

    requestAnimationFrame(loop);
    initElems();
});
window.addEventListener("scroll", ()=>{
    if(cnv)
        cnv.init();
});
function initElems(){
    console.log("INT");
    let task_elem = document.querySelector("#tsk");
    let info_elem = document.querySelector("#act");
    let programm_elem = document.querySelector("#prg");

    let taskShow = document.querySelector(".tasks");
    let infoShow = document.querySelector(".actions");
    let programmShow = document.querySelector(".programms");
    taskShow.style.display = "flex";
    task_elem.addEventListener("click", ()=>{
        taskShow.style.display = "flex";
        infoShow.style.display = "none";
        programmShow.style.display = "none";
    });
    info_elem.addEventListener("click", ()=>{
        infoShow.style.display = "flex";
        taskShow.style.display = "none";
        programmShow.style.display = "none";
    });
    programm_elem.addEventListener("click", ()=>{
        programmShow.style.display = "flex";
        infoShow.style.display = "none";
        taskShow.style.display = "none";
    })
}
function loop(){
    graph.showGraph();

    requestAnimationFrame(loop);
}

