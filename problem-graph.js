const WIDTH_CNV = 640;
const HEIGHT_CNV = 480;
const DEFAULT_COLOR_CNV = "rgb(36,37,43)";

let graph;
let cnv;
let menu;
function updateStatistic(props){
}
function isClickOnRoad(x,y) {
}
class DataInput{
    constructor() {
        this.x = 0;
        this.y = 0;
        this.elem = document.querySelector("#data");
        this.init();
    }
    init(){
        this.elem.addEventListener("change", ()=>{
            let select = this.elem.value;
            console.log(select);
            if(select == "5"){
                this.elem.style.display = "none";
            }
        })
    }
    show(node){
        this.elem.style.left = node.x + 40 + node.radius + "px";
        this.elem.style.top = node.y + 60 + "px";
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
                        graph.nodeHash[key].isConfig = true;
                        menu.show(graph.nodeHash[key]);
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
    constructor(){
        this.nodeHash = {};
        this.cnt = 0;

    }
    add(x,y,name =""){
        this.nodeHash[this.cnt++] = new Node(name, x, y);
    }
    showGraph(){
        cnv.clear();
        cnv.ctx.fillStyle = "red";
        for(let key in this.nodeHash){

            cnv.ctx.beginPath();
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

