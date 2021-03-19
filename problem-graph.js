const WIDTH_CNV = 640;
const HEIGHT_CNV = 480;
const DEFAULT_COLOR_CNV = "rgb(36,37,43)";

let graph;
let cnv;

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

    init() {
        this.otn = this.cnv.getBoundingClientRect();
        this.ctx.font = "16px serif"
    }

    clear() {
        this.ctx.fillStyle = DEFAULT_COLOR_CNV;
        this.ctx.fillRect(0, 0, WIDTH_CNV, HEIGHT_CNV);
    }

    register(props) {

        this.cnv.addEventListener("mousedown", (e) => {

        });
        this.cnv.addEventListener("mouseup", () => {

        });
        this.cnv.addEventListener("mousemove", (e) => {


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
    showGraph(){

        cnv.clear();
    }
}
class Node{
    constructor(name,color,x,y){
        this.name = name;
        this.color = color;
        this.radius = 15;
        this.x = x;
        this.y = y;
        this.roads = [];
    }


}
window.addEventListener("load",()=>{
    let props = {
        points: 3,
        path: 12,
        colors: 5
    };

    cnv = new CNV();
    graph = new Graph();
    cnv.clear();
    cnv.register(props);

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

