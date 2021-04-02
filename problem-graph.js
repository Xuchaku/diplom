const WIDTH_CNV = 640;
const HEIGHT_CNV = 480;
const DEFAULT_COLOR_CNV = "rgb(36,37,43)";

let isConstruct = true;
let menuLeft;
let graph;
let cnv;
let menu;
let menuProperty;
let history;


let colors = ["black", "blue", "red", "yellow", "purple"];
class History{
    constructor() {
        this.backElem = document.querySelector(".back");
        this.nextElem = document.querySelector(".next");
        this.state = [];
        this.index = 1;
        this.init();
    }
    init(){
        this.backElem.addEventListener("click", ()=>{
            this.nextElem.disabled = false;

            graph.nodeHash = JSON.parse(this.state[--this.index]);
            for(let key in graph.nodeHash){
                let roads = [];
                for(let i =0;i< graph.nodeHash[key].roads.length;i++){
                    roads.push(graph.nodeHash[key].roads[i]);
                }
                roads = JSON.stringify(roads);
                graph.nodeHash[key] = new Node(graph.nodeHash[key].name,graph.nodeHash[key].x,graph.nodeHash[key].y, graph.nodeHash[key].color);
                graph.nodeHash[key].roads = JSON.parse(roads);
                roads = [];
            }
            menuProperty.update("ALL");
            if(this.index == 0){
                this.state = [];
                this.state.push(JSON.stringify({}));
                this.backElem.disabled = true;
                this.nextElem.disabled = true;
            }

        });
        this.nextElem.addEventListener("click", ()=>{
            if(!(this.index + 1 > this.state.length  - 1)){
                graph.nodeHash = JSON.parse(this.state[++this.index]);
                for(let key in graph.nodeHash){
                    let roads = [];
                    for(let i =0;i< graph.nodeHash[key].roads.length;i++){
                        roads.push(graph.nodeHash[key].roads[i]);
                    }
                    roads = JSON.stringify(roads);
                    graph.nodeHash[key] = new Node(graph.nodeHash[key].name,graph.nodeHash[key].x,graph.nodeHash[key].y, graph.nodeHash[key].color);
                    graph.nodeHash[key].roads = JSON.parse(roads);
                    roads = [];
                }
                menuProperty.update("ALL");
                if(this.index == this.state.length - 1){
                    this.nextElem.disabled = true;
                }
            }


        });
    }
    update(nodeHash){
        this.state.push(JSON.stringify(nodeHash));
        this.index = this.state.length - 1;
        if(this.state.length > 1)
            this.backElem.disabled = false;

    }
}
class MenuPropertyGraph{
    constructor() {
      this.nodesElemCount = document.querySelector("#nodes");
      this.pathElemCount = document.querySelector("#paths");
      this.connectElemCount = document.querySelector("#connect-component");
      this.hromaticElemCount = document.querySelector("#hromatic-number");
      this.cyclomaticElemCount = document.querySelector("#cyclomatic-number");
      this.checkedElemTree = document.querySelector("#checkTree");
      this.checkedElemCycle = document.querySelector("#checkCycle");
      this.init();
    }
    init(){
        this.nodesElemCount.value = 0;
        this.pathElemCount.value = 0;
        this.connectElemCount.value = 0;

    }
    update(action){
       switch (action) {
           case "add":this.nodesElemCount.value = graph.getCountNodes();break;
           case "delete":this.nodesElemCount.value = graph.getCountNodes();break;
           case "addPath":this.pathElemCount.value = graph.getCountPath();break;
           case "deletePath":this.pathElemCount.value = graph.getCountPath();break;
           case "ALL":{
               this.nodesElemCount.value = graph.getCountNodes();
               this.pathElemCount.value = graph.getCountPath();
           };break;
       }
        this.connectElemCount.value = graph.getConnectComponentCount();
        this.cyclomaticElemCount.value = graph.getCyclomaticNumber();
        this.checkedElemCycle.checked = graph.isCycle();
        this.checkedElemTree.checked = graph.isTree();
    }
}
class ContextMenu{
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
                this.targetPoint.setColor(colors[i]);
               // this.targetPoint.color = colors[i];
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
                    this.targetPoint.setName(this.setname.value);
                    this.setname.style.display = "none";
                    this.targetPoint.isSelected = false;
                    this.blocked = false;
                }
            }
        });
        this.elem.addEventListener("change", ()=>{
            let select = this.elem.value;
            if(select == "1"){
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
                graph.deleteNode(this.targetPoint);
                menuProperty.update("delete");
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
class Menu{
    constructor(props) {
        this.mainElem = document.querySelector(".button-menu");
        this.elemAdd = document.querySelector(".add");
        this.elemSelect = document.querySelector(".select");
        this.elemAdds = document.querySelector(".adds");
        this.elemPath = document.querySelector(".path");
        this.elemRemove = document.querySelector(".remove");
        this.mode = 0;
        this.init();
    }
    init(){
        this.elemAdd.addEventListener("click", ()=>{
            //мод добавления одной вершины
            this.mode = 1;
        });
        this.elemSelect.addEventListener("click", ()=>{
            this.mode = 2;
        });
        this.elemAdds.addEventListener("click", ()=>{
            this.mode = 3;
        });
        this.elemPath.addEventListener("click", ()=>{
            this.mode = 4;
        });
        this.elemRemove.addEventListener("click", ()=>{
            this.mode = 5;
        })
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
        let arrToAdd = [];
        let arrToPath = [];
        function clearData(){
            for(let i = 0;i<arrToAdd.length;i++){
                graph.nodeHash[arrToAdd[i].key].phantomX = null;
                graph.nodeHash[arrToAdd[i].key].phantomY = null;
            }
            arrToAdd = [];
        }
        function hovered(cursorInp,x,y){
            for(let key in graph.nodeHash){
                if(Math.abs(graph.nodeHash[key].x -x) <= graph.nodeHash[key].radius &&
                    Math.abs(graph.nodeHash[key].y -y) <= graph.nodeHash[key].radius){
                    cursorIsHover = true;
                }
            }
            if(cursorIsHover){
                this.changeCursor(cursorInp);
                cursorIsHover = false;
            }
            else{
                this.changeCursor("default");
            }
        }
        document.addEventListener("keydown", (e)=>{
            if(e.code == "Enter"){
                console.log("ENTER");
                clearData();
            }
        });
        this.cnv.addEventListener("contextmenu", (e)=>{
            e.preventDefault();
        });

        this.cnv.addEventListener("mousedown", (e) => {
            let x = e.clientX - this.otn.x;
            let y = e.clientY - this.otn.y;
            if(isConstruct){
                if(e.which == 1) {
                    //режим создания задачи
                    if (menuLeft.mode == 1) {
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius + 15 &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius + 15) {
                                return;
                            }
                        }
                        graph.add(x, y);
                        menuProperty.update("add");
                    }
                    //выделение вершины
                    if (menuLeft.mode == 2) {
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
                                isMove = true;
                                targetMove = graph.nodeHash[key];
                                targetMove.isSelected = true;
                            }
                        }
                    }
                    //множественное создание вершин с ребрами
                    if (menuLeft.mode == 3) {
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius + 15 &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius + 15) {
                                return;
                            }
                        }
                        if(arrToAdd.length < 1) {
                            graph.add(x, y);
                            arrToAdd.push({x,y, key: graph.getKey(x,y)});
                            menuProperty.update("add");
                        }
                        else{
                            let key1 = arrToAdd[arrToAdd.length - 1].key;
                            graph.add(x, y);
                            arrToAdd.push({x,y, key: graph.getKey(x,y)});
                            graph.addPath(key1, graph.getKey(x,y));
                            menuProperty.update("addPath");
                            menuProperty.update("add");
                        }
                    }
                    //построение ребра
                    if(menuLeft.mode == 4){
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
                                if(arrToPath.length < 2 && !arrToPath.includes(key)){
                                    graph.nodeHash[key].isSelected = true;
                                    arrToPath.push(key);
                                }
                            }
                        }
                        if(arrToPath.length == 2){
                            graph.addPath(arrToPath[0], arrToPath[1]);
                            graph.nodeHash[arrToPath[0]].isSelected = false;
                            graph.nodeHash[arrToPath[1]].isSelected = false;
                            graph.nodeHash[arrToPath[0]].phantomX = null;
                            graph.nodeHash[arrToPath[0]].phantomY = null;
                            menuProperty.update("addPath");
                            arrToPath = [];
                        }
                    }
                    //удаление элемента
                    if (menuLeft.mode == 5) {
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
                                graph.deleteNode(graph.nodeHash[key]);
                                menuProperty.update("delete");
                            }
                        }
                    }

                }
            }
            else{

            }
            /*
            //добавление вершины
            if(e.which == 1){
                //построение ребра, пока без класса для ребра
                for(let key in graph.nodeHash){
                    if(graph.nodeHash[key].isSelected && menu.mode == 4){
                        for(let key2 in graph.nodeHash){
                            if(Math.abs(graph.nodeHash[key2].x -x) <= graph.nodeHash[key2].radius &&
                                Math.abs(graph.nodeHash[key2].y -y) <= graph.nodeHash[key2].radius){
                                graph.addPath(key, key2);
                                menuProperty.update("addPath");
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
                                menuProperty.update("deletePath");
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
                menuProperty.update("add");
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

            }*/
        });
        this.cnv.addEventListener("mouseup", () => {
            isMove = false;
            if(targetMove) {
                targetMove.isSelected = false;
            }
        });
        this.cnv.addEventListener("mousemove", (e) => {

            let x = e.clientX - this.otn.x;
            let y = e.clientY - this.otn.y;
            if(isConstruct){
                if (menuLeft.mode == 2){
                    //изменение курсора
                    hovered.call(this,"move",x,y);

                    //движение
                    if(isMove){
                        targetMove.x = x;
                        targetMove.y = y;
                    }
                }
                if (menuLeft.mode == 3){
                    if(arrToAdd.length > 0){
                        graph.nodeHash[arrToAdd[arrToAdd.length - 1].key].phantomX = x;
                        graph.nodeHash[arrToAdd[arrToAdd.length - 1].key].phantomY = y;
                    }
                }
                if (menuLeft.mode == 4){

                    hovered.call(this,"pointer",x,y);
                    if(arrToPath.length == 1){
                        graph.nodeHash[arrToPath[0]].phantomX = x;
                        graph.nodeHash[arrToPath[0]].phantomY = y;
                    }
                }
                if(menuLeft.mode == 5){
                    hovered.call(this,"no-drop",x,y);
                }
            }

        });


    }
}
class Graph{
    //добавить методы удаления, добавления путей
    constructor(){
        this.nodeHash = {};
        this.cnt = 0;
        this.isCycled = false;
    }
    add(x,y,name =""){
        this.nodeHash[this.cnt++] = new Node(name, x, y);
        history.update(this.nodeHash);
    }
    getCountPath(){
        let path = [];
        let checkedNode = [];
        for(let key in this.nodeHash){
            for(let i =0;i<this.nodeHash[key].roads.length;i++){
                if(!checkedNode.includes(this.nodeHash[key].roads[i].to))
                    path.push(this.nodeHash[key].roads[i].to);
            }
            checkedNode.push(key);
        }
        return path.length;
    }
    isCycle(){
        let checkedNode = [];
        this.isCycled = false;
        for(let key in this.nodeHash){
            if(!checkedNode.includes(this.nodeHash[key])){
              this.dfs2(this.nodeHash[key], checkedNode, null)
            }
        }
        return this.isCycled;


    }
    isTree(){
        return !this.isCycle() && ((this.getCountNodes() - this.getCountPath()) == 1);
    }
    getKey(x,y){
        for(let key in this.nodeHash){
            if(this.nodeHash[key].x == x && this.nodeHash[key].y == y){
                return key;
            }
        }
        return null;
    }
    dfs2(node, arrChecked, p){
        arrChecked.push(node);
        for(let i = 0;i<node.roads.length;i++){
            let key = node.roads[i].to;
            if(!arrChecked.includes(this.nodeHash[key])){
                this.dfs2(this.nodeHash[key], arrChecked, node);
            }
            else if(this.nodeHash[key] != p){
                this.isCycled = true;
            }
        }
    }
    getCyclomaticNumber(){
        return this.getCountPath() -this.getCountNodes() + this.getConnectComponentCount();
    }
    getCountNodes(){
        let count = 0;
        for(let key in this.nodeHash){
            count++;
        }
        return count;
    }
    getConnectComponentCount(){
        let checkedNode = [];
        let count = 0;
        for(let key in this.nodeHash){
            if(!checkedNode.includes(this.nodeHash[key])) {
                this.dfs(this.nodeHash[key], checkedNode);
                count++;
            }
        }
        return count;
    }
    dfs(node, arrChecked){
        arrChecked.push(node);
        for(let i = 0;i<node.roads.length;i++){
            let key = node.roads[i].to;
            if(!arrChecked.includes(this.nodeHash[key])){
                this.dfs(this.nodeHash[key], arrChecked);
            }
        }
    }

    deleteNode(node){
        let keyDelete = null;
        for(let key in this.nodeHash){
            if(node == this.nodeHash[key]){
                keyDelete = key;
                delete this.nodeHash[key];
            }
        }
        //удаление путей
        for(let key in this.nodeHash){
            for(let i = 0;i<this.nodeHash[key].roads.length;i++){
                if(this.nodeHash[key].roads[i].to == keyDelete){
                    this.nodeHash[key].roads.splice(i, 1);
                }
            }
        }
        history.update(this.nodeHash);
    }
    addPath(key, key2){
        graph.nodeHash[key].roads.push({to:key2});
        graph.nodeHash[key2].roads.push({to:key});
        history.update(this.nodeHash);
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
        history.update(this.nodeHash);
    }
    showGraph(){
        cnv.clear();
        cnv.ctx.shadowColor="rgba(137, 183, 26, 1)";
        cnv.ctx.shadowBlur = 0;
        for(let key in this.nodeHash){
            let point = this.nodeHash[key];
            if(point.phantomX != null && point.phantomY != null){
                console.log("PHANTOM");
                cnv.ctx.beginPath();
                cnv.ctx.moveTo(point.x, point.y);
                cnv.ctx.lineTo(point.phantomX, point.phantomY);
                cnv.ctx.stroke();
                cnv.ctx.closePath();
            }
        }
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
    constructor(name,x,y, color = "#ccc"){
        this.name = name;
        this.color = color;
        this.radius = 15;
        this.isConfig = false;
        this.isSelected = false;
        this.x = x;
        this.y = y;
        this.phantomX = null;
        this.phantomY = null;
        this.roads = [];
    }
    setColor(color){
        this.color = color;
        history.update(graph.nodeHash);
    }
    setName(name){
        this.name = name;
        history.update(graph.nodeHash);
    }
}
window.addEventListener("load",()=>{
    let props = {

    };
    menuProperty = new MenuPropertyGraph();
    cnv = new CNV();
    graph = new Graph();
    menu = new ContextMenu();
    history = new History();
    menuLeft = new Menu();
    cnv.clear();
    cnv.register();
    history.update(graph.nodeHash);

    requestAnimationFrame(loop);
    initElems();
});
window.addEventListener("scroll", ()=>{
    if(cnv)
        cnv.init();
});
function initElems(){
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

