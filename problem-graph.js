const WIDTH_CNV = 640;
const HEIGHT_CNV = 480;
const DEFAULT_COLOR_CNV = "rgb(36,37,43)";

let block_async = false;

const COLORS_DEFAULT = ["orange", "white", "yellow", "green", "gray"];


let deb_i = 0;
let data_input;
let graph;
let cnv;
function updateStatistic(props){
    let node = null;
    for(let key in props){
        node = document.querySelector("."+key);
        if(node != null)
            node.children[0].innerHTML = props[key];
    }
}
function isClickOnRoad(x,y) {

}
class DataInput{
    constructor() {
        this.x = 0;
        this.y = 0;
        this.isShow = false;
        this.title = "";
        this.elem = document.querySelector("#data");
        this.init();
    }
    init(){
        this.elem.addEventListener("keydown",(e)=>{
            if(e.code === "Enter"){
                for(let key in graph.nodeHash){
                    if(this.elem.value === graph.nodeHash[key].nameGraphic){
                        return;
                    }
                }
                this.isShow = false;
                block_async = false;
                for(let key in graph.nodeHash){
                    if(graph.nodeHash[key].x === this.x - 30 && graph.nodeHash[key].y === this.y - 20){
                        graph.nodeHash[key].nameGraphic = this.elem.value;
                    }
                }
                this.showInPosXY();
            }
        })
    }
    showInPosXY(x = 0,y = 0){
        this.x = x;
        this.y = y;
        this.elem.style.display = this.isShow ? "block" : "none";
        this.elem.style.left = x + "px";
        this.elem.style.top = y + "px";
    }
}
class CNV{
    constructor(){
        this.cnv = document.querySelector("#cnv");
        this.ctx = this.cnv.getContext("2d");
        this.cnv.width = WIDTH_CNV;
        this.cnv.height = HEIGHT_CNV;
        this.init();
    }
    init(){
        this.otn = this.cnv.getBoundingClientRect();
        this.ctx.font = "16px serif"
    }
    clear(){
        this.ctx.fillStyle = DEFAULT_COLOR_CNV;
        this.ctx.fillRect(0,0,WIDTH_CNV,HEIGHT_CNV);
    }
    register(props){
        let isHover = false;
        let nodeKey = null;
        let selectedNode = 0;
        let path = [];
        let startDate = 0;
        let moveDate = 0;

        let colorI = 0;
        this.cnv.addEventListener("mousedown", (e)=>{
            if(block_async) return;
            let xClient = e.clientX - this.otn.x;
            let yClient = e.clientY - this.otn.y;
            startDate = new Date();
            for(let key in graph.nodeHash){
                if(Math.abs(xClient - graph.nodeHash[key].x) <= graph.nodeHash[key].radius && Math.abs(yClient - graph.nodeHash[key].y) <= graph.nodeHash[key].radius){
                    isHover = true;
                    nodeKey = key;
                }
            }
        });
        this.cnv.addEventListener("mouseup", ()=>{
            if(block_async) return;
            isHover = false
        });
        this.cnv.addEventListener("mousemove", (e)=>{
            if(block_async) return;
            let xClient = e.clientX - this.otn.x;
            let yClient = e.clientY - this.otn.y;
            if(isHover){
                let localDate = new Date();
                graph.nodeHash[nodeKey].x = xClient;
                graph.nodeHash[nodeKey].y = yClient;
                moveDate = localDate - startDate;
               /* if(localDate - startDate > 100){
                    console.log("NOT SELECT");
                    graph.nodeHash[nodeKey].isSelected = false;
                    path = [];
                    selectedNode = 0;
                }*/
            }

        });
        this.cnv.addEventListener("dblclick", (e)=>{
            if(block_async) return;
            let xClient = e.clientX - this.otn.x;
            let yClient = e.clientY - this.otn.y;
            for(let key in graph.nodeHash){
                if(Math.abs(xClient - graph.nodeHash[key].x) <= graph.nodeHash[key].radius && Math.abs(yClient - graph.nodeHash[key].y) <= graph.nodeHash[key].radius){
                    graph.nodeHash[key].changeName();
                    block_async = true;

                    //убрать выделение
                    path = [];
                    selectedNode = 0;
                    graph.nodeHash[key].isSelected = false;
                }
            }
        });
        this.cnv.addEventListener("click", (e)=>{
            if(block_async) return;
            let xClient = e.clientX - this.otn.x;
            let yClient = e.clientY - this.otn.y;
            let isAdd = 0;

            if(props.colors){

                for(let key in graph.nodeHash){
                    if(Math.abs(graph.nodeHash[key].x - xClient) <= graph.nodeHash[key].radius &&
                        Math.abs(graph.nodeHash[key].y - yClient) <= graph.nodeHash[key].radius && moveDate < 100){
                            graph.nodeHash[key].color = COLORS_DEFAULT[colorI % COLORS_DEFAULT.length];
                            colorI++;
                    }
                }

            }
            if(graph.cnt === 0 && props.points > 0){
                graph.addPoint("B", "blue", xClient,yClient);
                block_async = true;
                props.points--;
                updateStatistic(props);
            }
            else{
                for(let key in graph.nodeHash){
                    //добавление новой  вершины
                    if((Math.abs(graph.nodeHash[key].x - xClient) > (graph.nodeHash[key].radius*2 + 5)) ||
                        (Math.abs(graph.nodeHash[key].y - yClient) > (graph.nodeHash[key].radius*2 + 5))){
                        isAdd++;
                    }
                    else{
                        isAdd--;
                    }

                    //выбор вершины ?
                    if(Math.abs(graph.nodeHash[key].x - xClient) <= graph.nodeHash[key].radius &&
                        Math.abs(graph.nodeHash[key].y - yClient) <= graph.nodeHash[key].radius &&
                        !graph.nodeHash[key].isSelected && selectedNode < 2 && moveDate < 100){

                        console.log("select");
                        graph.nodeHash[key].isSelected = true;
                        path.push(graph.nodeHash[key]);
                        selectedNode++;
                        if(selectedNode == 2){
                            //объект без класса

                            //предусмотреть снятие селекта
                            for(let i = 0;i< path[0].roads.length;i++){
                                if(path[0].roads[i].to === path[1].name){
                                    path[0].isSelected = false;
                                    path[1].isSelected = false;
                                    path = [];
                                    selectedNode = 0;
                                    return;
                                }
                            }
                            console.log("ADD");
                            path[0].roads.push({to: path[1].name});
                            path[1].roads.push({to: path[0].name});

                            path[0].isSelected = false;
                            path[1].isSelected = false;
                            path = [];
                            selectedNode = 0;
                        }

                    }
                }
                if(isAdd == graph.cnt && props.points > 0){
                    graph.addPoint("A"+deb_i, "red", xClient,yClient);
                    props.points--;
                    updateStatistic(props);
                    block_async = true;
                }

            }
            deb_i++;
            graph.showGraph();

        });
    }

}
class Graph{
    constructor(){
        this.nodeHash = {};
        this.cnt = 0;
    }
    addPoint(name,color,x,y){
        data_input.isShow = true;
        data_input.showInPosXY(x + 30,y + 20);
        this.nodeHash[name] = new Node(name, color,x,y);
        this.cnt++;
    }
    showGraph(){

        cnv.clear();
        for(let key in this.nodeHash){
            let point = this.nodeHash[key];
            if(point.roads.length != 0){
                for(let i = 0;i<point.roads.length;i++){
                    //?? дважды рисует пути
                    let toPoint = this.nodeHash[point.roads[i].to];
                    cnv.ctx.lineWidth = 3;
                    cnv.ctx.beginPath();
                    cnv.ctx.moveTo(point.x, point.y);
                    cnv.ctx.lineTo(toPoint.x, toPoint.y);
                    cnv.ctx.stroke();
                }

            }
        }
        for(let key in this.nodeHash){
            let point = this.nodeHash[key];
            cnv.ctx.beginPath();
            cnv.ctx.arc(point.x,point.y,point.radius,0,2*Math.PI);
            cnv.ctx.fillStyle = point.color;
            cnv.ctx.fillText(point.nameGraphic, point.x, point.y-point.radius*2);
            cnv.ctx.fill();
            cnv.ctx.closePath();
        }



    }
}
class Node{
    constructor(name,color,x,y){
        this.name = name;
        this.color = color;
        this.radius = 15;
        this.isSelected = false;
        this.x = x;
        this.y = y;
        this.roads = [];

        this.nameGraphic = "";
    }
    changeName(){
        data_input.isShow = true;
        data_input.showInPosXY(this.x + 30,this.y + 20);
    }

}
window.addEventListener("load",()=>{
    let props = {
        points: 3,
        path: 12,
        colors: 5
    };
    data_input = new DataInput();
    cnv = new CNV();
    graph = new Graph();
    cnv.clear();
    cnv.register(props);
    updateStatistic(props);
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

