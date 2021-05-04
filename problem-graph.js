const WIDTH_CNV = 640;
const HEIGHT_CNV = 480;
const DEFAULT_COLOR_CNV = "rgb(253,253,253)";

let gl = 0;
let globalConfig = {
    radius: 5
};
let props = {
    leftClickMouse: null,
    rightClickMouse: null
};
let serverloader = null;
let embedmodule = null;
let isConstruct = true;
let menuLeft;
let graph;
let cnv;
let menu;
let menuProperty;
let history;
let statistics;
let historyAct;


let colors = ["black", "blue", "red", "yellow", "purple", "white", "green", "orange"];
Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
        let hash = 0, i, chr;
        for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
});
function invert(value){
    return value == 1 ? 2 : 1;
}
class Task{
    constructor(type, prps, hints) {
        this.type = type;
        this.id = (new Date()).toString().hashCode();
        this.description = document.querySelector("#text-newtask").innerText;
        this.actionMouse = JSON.parse(JSON.stringify(prps));
        this.hints = hints.slice();
        this.option = {};
        this.loadoption();
    }
    loadoption(){
        let taskLst = document.querySelector(".task-lst");
        switch (this.type) {
            case 1:{
                for(let i = 0;i<taskLst.children.length;i++){
                    if(taskLst.children[i].children[2].children[0].checked){
                        console.log(taskLst.children[i].children[1]);
                        let key = taskLst.children[i].children[1].id;
                        let value = taskLst.children[i].children[1].value;
                        this.option[key] = value;
                    }
                }
            };break;
            case 2:break;
        }
    }

}
class EmbededModule{
    constructor() {
        this.containerParams = document.querySelector(".task-lst");
        this.frmstatistic = document.querySelector("#frm-statistic");
        this.statisticUser = document.querySelector(".statistic");
        this.apiBlock = document.querySelector(".api-block");
        this.funcStorage = [];
    }
    embed(conf){
        for(let i = 0;i<conf.length;i++){
            let elemToParams = document.createElement('div');
            let statisticElem = document.createElement('p');
            statisticElem.innerHTML =  `${conf[i].name} <span></span>`;
            this.statisticUser.append(statisticElem);
            let option = document.createElement('input');
            option.type = "checkbox";
            option.className = "value-for-task";
            this.frmstatistic.append(option);
            this.frmstatistic.append(conf[i].name);
            let apiElem = document.createElement('div');
            apiElem.className = "api-elem dev";
            apiElem.innerHTML = `<p>${conf[i].name}() - ${conf[i].desc}. Возвращает тип ${conf[i].type}</p>`;
            this.apiBlock.append(apiElem);
            elemToParams.className = "val";
            switch (conf[i].type) {
                case "boolean":elemToParams.innerHTML = `<label data-title="Числовой параметр" for="">${conf[i].name}</label>
                        <input type="checkbox" class="value-for-task">
                        <div class="task-config">
                            <input type="checkbox">
                            <p href="#" class="tooltip">(?)<span><b>Действия</b><br>Включить данный параметр в задачу?</span></p>
                        </div>`;console.log("here");break;
                case "integer":elemToParams.innerHTML = ` <label data-title="Числовой параметр" for="">${conf[i].name} (<i>число</i>)</label>
                        <input type="text" class="value-for-task">
                        <div class="task-config">
                            <input type="checkbox">
                            <p href="#" class="tooltip">(?)<span><b>Действия</b><br>Включить данный параметр в задачу?</span></p>
                        </div>`;break;
            }
            this.containerParams.append(elemToParams);
        }

    }
    initfunc(modulesrc){
        console.log("HERE");
        for(let i =0;i<modulesrc.length;i++) {
            this.funcStorage.push(eval(modulesrc[i].script));
        }

    }
}
class ServerConnector{
    constructor() {
        this.host = "http://localhost:8000/";
        this.urlgetmodules = "getmodules";
        this.urlsetmodules = "setmodule";
        this.urlgettask = "gettask";
        this.urlloadtask = "settask";
        this.modul = [];
    }
    async gettask(){
        let fetchResponse = await fetch(this.host + this.urlgettask, {
            method: 'GET',
        });
        let txt = await fetchResponse.text();
        let data = JSON.parse(txt);
        return data;

    }
    async loadtask(data){
        let fetchResponse = await fetch(this.host + this.urlloadtask, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        await fetchResponse.text();
    }
    async loadsolution(){

    }
    async getmodules(){
        let fetchResponse = await fetch(this.host + this.urlgetmodules, {
            method: 'GET',
        });
        let txt = await fetchResponse.text();
        let data = JSON.parse(txt);
        for(let i = 0;i<data.length;i++)
            this.modul.push(data[i]);
    }
    run(){
        //let fun = eval(this.modul);
        //fun();
    }
    async loadmodule(data){
        let fetchResponse = await fetch(this.host + this.urlsetmodules, {
            method: 'POST',
            body: new FormData(data)
        });
        await fetchResponse.text();
    }
}
function changeColorCanvas(x,y){
    gl++;
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
                graph.nodeHash[key].setColor(colors[gl % colors.length]);
                return;
            }
        }
    }
    //режим меню для пути
    for (let key in graph.nodeHash) {
        for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
            if (Math.abs((x-graph.nodeHash[key].roads[i].xStart)/(graph.nodeHash[key].roads[i].xEnd - graph.nodeHash[key].roads[i].xStart) -
                (y-graph.nodeHash[key].roads[i].yStart)/(graph.nodeHash[key].roads[i].yEnd - graph.nodeHash[key].roads[i].yStart)) < 0.15 &&
                (((x > graph.nodeHash[key].roads[i].xStart && x < graph.nodeHash[key].roads[i].xEnd) || (x > graph.nodeHash[key].roads[i].xEnd && x < graph.nodeHash[key].roads[i].xStart)) &&
                    (y > graph.nodeHash[key].roads[i].yStart && y < graph.nodeHash[key].roads[i].yEnd && !menu.blocked)
                )){
                setPropertyPath(graph.nodeHash[key].roads[i].to, graph.nodeHash[key].roads[i].in, colors[gl % colors.length], graph.nodeHash[key].roads[i].setColor);
            }
        }
    }

}
function selectToCanvas(x,y) {
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
                graph.nodeHash[key].setActive();
                return;
            }
        }
    }

    for (let key in graph.nodeHash) {
        for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
            if (Math.abs((x-graph.nodeHash[key].roads[i].xStart)/(graph.nodeHash[key].roads[i].xEnd - graph.nodeHash[key].roads[i].xStart) -
                (y-graph.nodeHash[key].roads[i].yStart)/(graph.nodeHash[key].roads[i].yEnd - graph.nodeHash[key].roads[i].yStart)) < 0.15 &&
                (((x > graph.nodeHash[key].roads[i].xStart && x < graph.nodeHash[key].roads[i].xEnd) || (x > graph.nodeHash[key].roads[i].xEnd && x < graph.nodeHash[key].roads[i].xStart)) &&
                    (y > graph.nodeHash[key].roads[i].yStart && y < graph.nodeHash[key].roads[i].yEnd && !menu.blocked)
                )){
                setPropertyPath(graph.nodeHash[key].roads[i].to, graph.nodeHash[key].roads[i].in, 1, graph.nodeHash[key].roads[i].setActive)
                //graph.nodeHash[key].roads[i].setActive();

            }
        }
    }
}
function addToCanvas(x,y,arrToPath){

    //menuProperty.update("add");
}
function deleteToCanvas(x,y){
    for (let key in graph.nodeHash) {
        if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius &&
            Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
            graph.deleteNode(graph.nodeHash[key]);
            //menuProperty.update("delete");

            return;
        }
    }
    for (let key in graph.nodeHash) {
        for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
            if (Math.abs((x-graph.nodeHash[key].roads[i].xStart)/(graph.nodeHash[key].roads[i].xEnd - graph.nodeHash[key].roads[i].xStart) -
                (y-graph.nodeHash[key].roads[i].yStart)/(graph.nodeHash[key].roads[i].yEnd - graph.nodeHash[key].roads[i].yStart)) < 0.15 &&
                (((x > graph.nodeHash[key].roads[i].xStart && x < graph.nodeHash[key].roads[i].xEnd) || (x > graph.nodeHash[key].roads[i].xEnd && x < graph.nodeHash[key].roads[i].xStart)) &&
                    (y > graph.nodeHash[key].roads[i].yStart && y < graph.nodeHash[key].roads[i].yEnd)
                )){
                graph.deletePath(graph.nodeHash[key].roads[i].in, graph.nodeHash[key].roads[i].to);
                //menuProperty.update("deletePath");
            }
        }
    }
}
function setPropertyPath(to, ins, value, func){
    for(let i =0;i<graph.nodeHash[ins].roads.length;i++){
        if(graph.nodeHash[ins].roads[i].to == to){
            func.call(graph.nodeHash[ins].roads[i], value);
        }
    }
    for(let i =0;i<graph.nodeHash[to].roads.length;i++){
        if(graph.nodeHash[to].roads[i].to == ins){
            func.call(graph.nodeHash[to].roads[i], value);
        }
    }
    history.update(graph.nodeHash);
    console.log("!!!!!!");
}
class HistoryAction{
    constructor(){
        this.rootElem = document.querySelector(".history");
        this.counter = 1;
        //this.clear();
    }
    clear(){
        while(this.rootElem.children.length > 0){
            this.rootElem.removeChild(this.rootElem.lastChild);
        }
        this.counter = 1;
    }
    setMessage(message){
        let node = document.createElement("div");
        node.className = "history-elem";
        let p = document.createElement("p");
        p.innerText = message;
        node.append(p);
        this.rootElem.append(node);
    }
    update(action, param = null, obj = null){
        if(!param && !obj){
            switch (action) {
                case "addNode":this.setMessage(`${this.counter}.Добавлена новая вершина`);break;
                case "deleteNode":this.setMessage(`${this.counter}.Удалена вершина`);break;
                case "addPath":this.setMessage(`${this.counter}.Построено ребро`);break;
                case "deletePath":this.setMessage(`${this.counter}.Удалено ребро`);break;
            }
        }
        else{
            if(obj instanceof Node){
                switch (action) {
                    case "setColor":this.setMessage(`${this.counter}.Установлен цвет ${param} для вершины`);break;
                    case "setName":this.setMessage(`${this.counter}.Установлено имя ${param} для вершины`);break;
                    case "setGrow":this.setMessage(`${this.counter}.Установлен размер для вершины в ${param} единиц`);break;
                    case "setActive":this.setMessage(param ? `${this.counter}.Установлено выделение на вершине` : `${this.counter}.Снято выделение с вершины"`);break;
                    case "setWeight":this.setMessage(`${this.counter}.Установлен вес ${param} для вершины`);break;
                }
            }
            if(obj instanceof Path){
                switch (action) {
                    case "setColor":this.setMessage(`${this.counter}.Установлен цвет ${param} для ребра`);break;
                    case "setName":this.setMessage(`${this.counter}.Установлено имя ${param} для ребра`);break;
                    case "setGrow":this.setMessage(`${this.counter}.Установлена толщина для ребра в ${param} единиц`);break;
                    case "setActive":this.setMessage(param ? `${this.counter}.Поставлено выделение для ребра` : `${this.counter}.Снято выделение с ребра`);break;
                    case "setWeight":this.setMessage(`${this.counter}.Установлен вес ${param} для ребра`);break;
                }
            }
        }
        this.counter++;
    }
}
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
            this.back();
            /*this.nextElem.disabled = false;

            graph.nodeHash = JSON.parse(this.state[--this.index]);
            for(let key in graph.nodeHash){
                let roads = [];
                for(let i =0;i< graph.nodeHash[key].roads.length;i++){
                    roads.push(graph.nodeHash[key].roads[i]);
                }
                //roads = JSON.stringify(roads);
                graph.nodeHash[key] = new Node(graph.nodeHash[key].name,graph.nodeHash[key].x,graph.nodeHash[key].y, graph.nodeHash[key].radius ,graph.nodeHash[key].color, graph.nodeHash[key].weight);
                for(let i =0;i< roads.length;i++){
                    graph.nodeHash[key].roads.push(new Path(roads[i].name, roads[i].in, roads[i].to, roads[i].xStart, roads[i].yStart, roads[i].xEnd, roads[i].yEnd, roads[i].width, roads[i].stylePath ,roads[i].weight ,roads[i].color));
                }
                //graph.nodeHash[key].roads = JSON.parse(roads);
                roads = [];
            }
            menuProperty.update("ALL");
            if(this.index == 0){
                this.state = [];
                this.state.push(JSON.stringify({}));
                this.backElem.disabled = true;
                this.nextElem.disabled = true;
            }*/

        });
        this.nextElem.addEventListener("click", ()=>{

            this.next();

        });
    }
    update(nodeHash){
        this.state.push(JSON.stringify(nodeHash));
        this.index = this.state.length - 1;
        if(this.state.length > 1)
            this.backElem.disabled = false;

    }
    clear(){
        this.state = [];
        this.backElem.disabled = true;
        this.nextElem.disabled = true;
        this.state.push(JSON.stringify({}));
    }
    back(){
        this.nextElem.disabled = false;
        graph.nodeHash = JSON.parse(this.state[--this.index]);
        for(let key in graph.nodeHash){
            let roads = [];
            for(let i =0;i< graph.nodeHash[key].roads.length;i++){
                roads.push(graph.nodeHash[key].roads[i]);
            }
            //roads = JSON.stringify(roads);
            graph.nodeHash[key] = new Node(graph.nodeHash[key].name,graph.nodeHash[key].x,graph.nodeHash[key].y, graph.nodeHash[key].radius ,graph.nodeHash[key].color, graph.nodeHash[key].weight,graph.nodeHash[key].isActive);
            for(let i =0;i< roads.length;i++){
                graph.nodeHash[key].roads.push(new Path(roads[i].name, roads[i].in, roads[i].to, roads[i].xStart, roads[i].yStart, roads[i].xEnd, roads[i].yEnd, roads[i].width, roads[i].stylePath ,roads[i].weight ,roads[i].color,false, roads[i].isActive));
            }
            //graph.nodeHash[key].roads = JSON.parse(roads);
            roads = [];
        }
        menuProperty.update("ALL");
        if(this.index == 0){
            this.state = [];
            this.state.push(JSON.stringify({}));
            this.backElem.disabled = true;
            this.nextElem.disabled = true;
        }
    }
    next(){
        if(!(this.index + 1 > this.state.length  - 1)){
            graph.nodeHash = JSON.parse(this.state[++this.index]);
            for(let key in graph.nodeHash){
                let roads = [];
                for(let i =0;i< graph.nodeHash[key].roads.length;i++){
                    roads.push(graph.nodeHash[key].roads[i]);
                }
                //roads = JSON.stringify(roads);
                graph.nodeHash[key] = new Node(graph.nodeHash[key].name,graph.nodeHash[key].x,graph.nodeHash[key].y, graph.nodeHash[key].radius , graph.nodeHash[key].color, graph.nodeHash[key].weight, graph.nodeHash[key].isActive);
                //graph.nodeHash[key].roads = JSON.parse(roads);
                for(let i =0;i< roads.length;i++){
                    graph.nodeHash[key].roads.push(new Path(roads[i].name, roads[i].in, roads[i].to, roads[i].xStart, roads[i].yStart, roads[i].xEnd, roads[i].yEnd, roads[i].width,roads[i].stylePath ,roads[i].weight,roads[i].color,false, roads[i].isActive));
                }
                roads = [];
            }
            menuProperty.update("ALL");
            if(this.index == this.state.length - 1){
                this.nextElem.disabled = true;
            }
        }
    }
}
class Statistics{
    constructor() {
        this.statisticElem = document.querySelector(".statistic");
        this.prps = [];
        this.toggle();
    }
    toggle(){
        this.statisticElem.style.display = isConstruct ? "none" : "flex";
        for(let i = 0;i<this.statisticElem.children.length;i++){
            this.statisticElem.children[i].style.display = this.prps[i] ? "block" : "none";
        }
    }
    update(){
        this.statisticElem.children[0].children[0].innerText = graph.getCountNodes();
        this.statisticElem.children[1].children[0].innerText = graph.getCountPath();
        this.statisticElem.children[2].children[0].innerText = graph.getConnectComponentCount();
        this.statisticElem.children[3].children[0].innerText = graph.getCyclomaticNumber();
        this.statisticElem.children[4].children[0].innerText = graph.isDicotyledonous();
        this.statisticElem.children[5].children[0].innerText = graph.isTree();
        this.statisticElem.children[6].children[0].innerText = graph.isWood();
        this.statisticElem.children[7].children[0].innerText = graph.isCycle();
        this.statisticElem.children[8].children[0].innerText = graph.isBiconnected();
        this.statisticElem.children[9].children[0].innerText = graph.isRegular();

        let j = 0;
        for(let i = 10;i< this.statisticElem.children.length;i++){
            this.statisticElem.children[i].children[0].innerText = embedmodule.funcStorage[j]();
            j++;
        }
    }
    setParam(prp){
        this.prps = prp;
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
      this.biconnectElem = document.querySelector("#checkConnected");
      this.checkWoodElem = document.querySelector("#checkWood");
      this.checkDicotyledonousElem = document.querySelector("#dicotyledonous");
      this.checkedRegularElem = document.querySelector("#checkRegular");

      this.createTaskElem = document.querySelector("#create-task");
      this.lkmElem = document.querySelector("#lkm");
      this.rkmElem = document.querySelector("#rkm");
      this.paElem = document.querySelector("#pa");
      this.formStatistic = document.querySelector("#frm-statistic");
      this.elemNewTaskText = document.querySelector("#text-newtask");
      this.areaTextElem =  document.querySelector("#text-area");
      this.init();
    }
    init(){
        let selectLeft = null;
        let selectRight = null;
        this.lkmElem.addEventListener("change", ()=>{
            selectLeft = this.lkmElem.value;
        });
        this.rkmElem.addEventListener("change", ()=>{
            selectRight = this.rkmElem.value;
        });
        this.paElem.addEventListener("change", ()=>{
            if(this.paElem.checked) {
                this.elemNewTaskText.style.display = "none";
            }
            else{
                this.elemNewTaskText.style.display = "block";
            }
        });
        this.createTaskElem.addEventListener("click", ()=>{
            if(selectLeft == selectRight)
                console.log("ERROR");
            else{
                //isConstruct = false;
                let prps = [];
                for(let i =0;i<this.formStatistic.children.length;i++){
                    prps.push(this.formStatistic.children[i].checked);
                }
                console.log(prps);
                //menuLeft.hidden();
                historyAct.clear();
                //statistics.setParam(prps);
                ///statistics.toggle();

                //false = tip1
                //true = tip2
                if(this.paElem.checked){
                    //упаковка графа
                    props.leftClickMouse = selectLeft;
                    props.rightClickMouse = selectRight;

                }
                else{
                    history.clear();
                    graph = new Graph();
                    props.leftClickMouse = selectLeft;
                    props.rightClickMouse = selectRight;

                    let newTask = new Task(1, props, prps);
                    console.log(newTask);
                    serverloader.loadtask(newTask);
                    statistics.update();
                }
            }
        });
        this.nodesElemCount.value = 0;
        this.pathElemCount.value = 0;
        this.connectElemCount.value = 0;

    }
    updateText(){
        this.elemNewTaskText.innerHTML = "<p>Постройте граф удовлетворяющий следующим свойствам:</p>";
        this.elemNewTaskText.innerHTML += "<p>Количество вершин: " + this.nodesElemCount.value + "</p>";
        this.elemNewTaskText.innerHTML += "<p>Количество ребер: " + this.pathElemCount.value + "</p>";
        this.elemNewTaskText.innerHTML += "<p>Количество компонент связоности: " + this.connectElemCount.value + "</p>";
        this.elemNewTaskText.innerHTML += "<p>Цикломатическое число: " + this.cyclomaticElemCount.value + "</p>";
        this.elemNewTaskText.innerHTML += this.checkedElemCycle.checked ? "<p>Имеются циклы</p>" : "<p>Без циклов</p>";
        this.elemNewTaskText.innerHTML += this.checkedElemTree.checked ? "<p>Дерево</p>" : "";
        this.elemNewTaskText.innerHTML += this.checkWoodElem.checked ? "<p>Лес</p>" : "";
        this.elemNewTaskText.innerHTML += this.checkDicotyledonousElem.checked ? "<p>Двудольный</p>" : "";
        this.elemNewTaskText.innerHTML += this.biconnectElem.checked ? "<p>Двусвязный</p>" : "";
        this.elemNewTaskText.innerHTML += this.checkedRegularElem.checked ? "<p>Регулярный</p>" : "";

        let wrapper = document.querySelector(".task-lst");
        let j = 0;
        let len = wrapper.children.length;
        for(let i = len - embedmodule.funcStorage.length;i< wrapper.children.length;i++){
            console.log(wrapper.children[i].children[1].checked);
            this.elemNewTaskText.innerHTML += wrapper.children[i].children[1].checked ? `<p>${serverloader.modul[j].name}</p>` : "";
            j++;
        }
    }

    update(action){
       switch (action) {
           case "add":this.nodesElemCount.value = graph.getCountNodes();break;
           case "delete":this.nodesElemCount.value = graph.getCountNodes();this.pathElemCount.value = graph.getCountPath();break;
           case "addPath":this.pathElemCount.value = graph.getCountPath();break;
           case "ALL":{
               this.nodesElemCount.value = graph.getCountNodes();
               this.pathElemCount.value = graph.getCountPath();
           };break;
       }
        this.connectElemCount.value = graph.getConnectComponentCount();
        this.cyclomaticElemCount.value = graph.getCyclomaticNumber();
        this.checkedElemCycle.checked = graph.isCycle();
        this.checkedElemTree.checked = graph.isTree();
        this.checkWoodElem.checked = graph.isWood();
        this.checkDicotyledonousElem.checked = graph.isDicotyledonous();
        this.biconnectElem.checked = graph.isBiconnected();
        this.checkedRegularElem.checked = graph.isRegular();

        let wrapper = document.querySelector(".task-lst");
        let j = 0;
        let len = wrapper.children.length;
        for(let i = len - embedmodule.funcStorage.length;i< wrapper.children.length;i++){
            wrapper.children[i].children[1].checked = embedmodule.funcStorage[j]();
            j++;
        }
        statistics.update(this);
        this.updateText();
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
                if(this.targetPoint instanceof Path){
                    setPropertyPath(this.targetPoint.to, this.targetPoint.in, colors[i], this.targetPoint.setColor);
                }
                else {
                    this.targetPoint.setColor(colors[i]);
                }
                //this.targetPoint.setColor(colors[i]);
               // this.targetPoint.color = colors[i];
            })
        }
        //поле ввода имени и значения
        this.setname.addEventListener("keydown", (e)=>{
            if(e.code == "Enter"){
                if(this.mode == 1){
                    if(this.setname.value == "")
                        return;
                    else{
                        /*this.targetPoint.setName(this.setname.value);
                        this.setname.style.display = "none";
                        this.targetPoint.isSelected = false;
                        this.blocked = false;
                        for(let key in graph.nodeHash){
                            if(graph.nodeHash[key].name == this.setname.value)
                                return;
                        }*/
                        if(this.targetPoint instanceof Path){
                            setPropertyPath(this.targetPoint.to, this.targetPoint.in, this.setname.value, this.targetPoint.setName);
                        }
                        else {
                            this.targetPoint.setName(this.setname.value);
                        }
                        this.setname.style.display = "none";
                        this.targetPoint.isSelected = false;
                        this.blocked = false;
                    }
                }
                if(this.mode == 3){
                    if(this.setname.value == "" || isNaN(this.setname.value))
                        return;
                    else{
                        if(this.targetPoint instanceof Path){
                            setPropertyPath(this.targetPoint.to, this.targetPoint.in, this.setname.value, this.targetPoint.setGrow);
                        }
                        else {
                            this.targetPoint.setGrow(+this.setname.value);
                        }
                        this.setname.style.display = "none";
                        this.targetPoint.isSelected = false;
                        this.blocked = false;
                    }
                }
                if(this.mode == 5){
                    if(this.setname.value == "" || isNaN(this.setname.value))
                        return;
                    else{
                        if(this.targetPoint instanceof Path){
                            setPropertyPath(this.targetPoint.to, this.targetPoint.in, this.setname.value, this.targetPoint.setWeight);
                        }
                        else {
                            this.targetPoint.setWeight(+this.setname.value);
                        }
                        this.setname.style.display = "none";
                        this.targetPoint.isSelected = false;
                        this.blocked = false;
                    }
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
                this.elem.value = 0;
            }
            if(select == "2"){
                this.setcolor.style.display = "block";
                this.targetPoint.isSelected = true;
                this.mode = 2;
                this.setcolor.style.left = this.x + "px";
                this.setcolor.style.top = this.y + "px";
                this.blocked = true;
                this.elem.style.display = "none";
                this.elem.value = 0;
            }
            if(select == "3"){
                this.setname.value = "";
                this.targetPoint.isSelected = true;
                this.mode = 3;
                this.setname.style.display = "block";
                this.setname.style.left = this.x + "px";
                this.setname.style.top = this.y + "px";
                this.blocked = true;
                this.elem.style.display = "none";
                this.elem.value = 0;
            }
            if(select == "4"){
                this.targetPoint.isSelected = true;
                this.mode = 4;
                if(this.targetPoint instanceof Path){
                    setPropertyPath(this.targetPoint.to, this.targetPoint.in, this.setname.value, this.targetPoint.setActive);
                }
                else {
                    this.targetPoint.setActive();
                }
                //this.targetPoint.setActive();
                this.blocked = false;
                this.targetPoint.isSelected = false;
                this.elem.style.display = "none";
                this.elem.value = 0;
            }
            if(select == "5"){
                this.setname.value = "";
                this.targetPoint.isSelected = true;
                this.mode = 5;
                this.setname.style.display = "block";
                this.setname.style.left = this.x + "px";
                this.setname.style.top = this.y + "px";
                this.blocked = true;
                this.elem.style.display = "none";
                this.elem.value = 0;
            }
            if(select == "6"){
                this.mode = 6;
                this.blocked = false;
                this.elem.style.display = "none";
                this.targetPoint.isSelected = false;
                this.elem.value = 0;
            }

        })
    }
    show(node,x,y){
        this.targetPoint = node;

        this.x = x + 75;
        this.y = y + 55;

        this.blocked = true;
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
        this.elemClear = document.querySelector(".clear");
        this.selectPointGrow = document.querySelector("#point-grow");
        this.selectStylePath = document.querySelector("#style-path");
        this.mode = 0;
        this.init();
    }
    toggle(){
        this.mainElem.style.display = isConstruct ? "flex" : "none";
    }
    init(){

        this.selectStylePath.addEventListener("change", ()=>{
            let value = this.selectStylePath.value.split(",").map(item => +item);
            if(!value.includes(NaN)){
                graph.setAllStylePath(value);
                globalConfig.stylePath = value;
            }

        });
        this.selectPointGrow.addEventListener("change", ()=>{
            let value = this.selectPointGrow.value;
            if(!isNaN(value)) {
                graph.setAllGrowPoints(value);
                globalConfig.radius = value;
            }
        });

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
        });
        this.elemClear.addEventListener("click", ()=>{
            graph = new Graph();
            history.update(graph.nodeHash);
            //history.clear();
        });
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
        let elemHovered = null;
        let pathHovered = [];
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
                    elemHovered = graph.nodeHash[key];
                }
            }
            if(cursorIsHover){
                this.changeCursor(cursorInp);
                elemHovered.isSelected = true;
                cursorIsHover = false;
            }
            else{
                this.changeCursor("default");
                if(elemHovered) {
                    elemHovered.isSelected = false;
                    elemHovered = null;
                }
            }
            if(menuLeft.mode == 5 && !elemHovered){
                for (let key in graph.nodeHash) {
                    for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
                        if (Math.abs((x-graph.nodeHash[key].roads[i].xStart)/(graph.nodeHash[key].roads[i].xEnd - graph.nodeHash[key].roads[i].xStart) -
                            (y-graph.nodeHash[key].roads[i].yStart)/(graph.nodeHash[key].roads[i].yEnd - graph.nodeHash[key].roads[i].yStart)) < 0.15 &&
                            (((x > graph.nodeHash[key].roads[i].xStart && x < graph.nodeHash[key].roads[i].xEnd) || (x > graph.nodeHash[key].roads[i].xEnd && x < graph.nodeHash[key].roads[i].xStart)) &&
                                (y > graph.nodeHash[key].roads[i].yStart && y < graph.nodeHash[key].roads[i].yEnd))
                        ) {
                            cursorIsHover = true;
                            console.log("add");
                            pathHovered.push(graph.nodeHash[key].roads[i]);
                        }
                    }
                }
                if(cursorIsHover){
                    this.changeCursor(cursorInp);
                    for(let i =0;i<pathHovered.length;i++){
                        pathHovered[i].isSelected = true;
                    }
                    cursorIsHover = false;
                }
                else{
                    this.changeCursor("default");
                    for(let i =0;i<pathHovered.length;i++) {
                        pathHovered[i].isSelected = false;
                    }
                    pathHovered = [];
                }

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
                    if (menuLeft.mode == 1 && !menu.blocked) {
                        console.log("here");
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius  &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
                                return;
                            }
                        }
                        graph.add(x, y);
                        menuProperty.update("add");
                    }
                    //выделение вершины
                    if (menuLeft.mode == 2 && !menu.blocked) {
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
                    if (menuLeft.mode == 3 && !menu.blocked) {
                        let isFree = true;
                        let node = null;
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
                                isFree = false;
                                node = graph.nodeHash[key];
                            }
                        }
                        if(arrToAdd.length < 1 && isFree) {
                            graph.add(x, y);
                            arrToAdd.push({x,y, key: graph.getKey(x,y)});
                            menuProperty.update("add");
                        }
                        else if(arrToAdd.length < 1 && !isFree){
                            arrToAdd.push({x:node.x,y:node.y, key: graph.getKey(node.x,node.y)});
                        }
                        else{
                            let key1 = arrToAdd[arrToAdd.length - 1].key;
                            if(isFree){
                                graph.add(x, y);
                                arrToAdd.push({x,y, key: graph.getKey(x,y)});
                                graph.addPath(key1, graph.getKey(x,y));
                                menuProperty.update("addPath");
                                menuProperty.update("add");
                            }
                            else{
                                arrToAdd.push({x:node.x,y:node.y, key: graph.getKey(node.x,node.y)});
                                graph.addPath(key1, graph.getKey(node.x,node.y));
                                menuProperty.update("addPath");
                                for(let i = 0;i<arrToAdd.length-1;i++){
                                    graph.nodeHash[arrToAdd[i].key].phantomX = null;
                                    graph.nodeHash[arrToAdd[i].key].phantomY = null;
                                }
                            }

                        }
                    }
                    //построение ребра
                    if(menuLeft.mode == 4 && !menu.blocked){
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
                    if (menuLeft.mode == 5 && !menu.blocked) {
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius) {
                                graph.deleteNode(graph.nodeHash[key]);
                                menuProperty.update("delete");

                                return;
                            }
                        }
                        console.log(graph.nodeHash);
                        for (let key in graph.nodeHash) {
                            for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
                                if (Math.abs((x-graph.nodeHash[key].roads[i].xStart)/(graph.nodeHash[key].roads[i].xEnd - graph.nodeHash[key].roads[i].xStart) -
                                    (y-graph.nodeHash[key].roads[i].yStart)/(graph.nodeHash[key].roads[i].yEnd - graph.nodeHash[key].roads[i].yStart)) < 0.15 &&
                                    (((x > graph.nodeHash[key].roads[i].xStart && x < graph.nodeHash[key].roads[i].xEnd) || (x > graph.nodeHash[key].roads[i].xEnd && x < graph.nodeHash[key].roads[i].xStart)) &&
                                        (y > graph.nodeHash[key].roads[i].yStart && y < graph.nodeHash[key].roads[i].yEnd)
                                )){
                                    graph.deletePath(graph.nodeHash[key].roads[i].in, graph.nodeHash[key].roads[i].to);
                                    menuProperty.update("deletePath");
                                }
                            }
                        }
                    }

                }
                if(e.which == 3){
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
                                graph.nodeHash[key].isSelected = true;
                                menu.show(graph.nodeHash[key],x,y);
                                return;
                            }
                        }
                    }
                    //режим меню для пути
                    for (let key in graph.nodeHash) {
                        for(let i = 0;i<graph.nodeHash[key].roads.length;i++){
                            if (Math.abs((x-graph.nodeHash[key].roads[i].xStart)/(graph.nodeHash[key].roads[i].xEnd - graph.nodeHash[key].roads[i].xStart) -
                                (y-graph.nodeHash[key].roads[i].yStart)/(graph.nodeHash[key].roads[i].yEnd - graph.nodeHash[key].roads[i].yStart)) < 0.15 &&
                                (((x > graph.nodeHash[key].roads[i].xStart && x < graph.nodeHash[key].roads[i].xEnd) || (x > graph.nodeHash[key].roads[i].xEnd && x < graph.nodeHash[key].roads[i].xStart)) &&
                                    (y > graph.nodeHash[key].roads[i].yStart && y < graph.nodeHash[key].roads[i].yEnd && !menu.blocked)
                                )){
                                graph.nodeHash[key].roads[i].isSelected = true;
                                menu.show(graph.nodeHash[key].roads[i],x,y);
                            }
                        }
                    }
                }
            }
            else{
                console.log("HHHHH");
                console.log(props.leftClickMouse, props.rightClickMouse);
                if(e.which == 1){
                    if(props.leftClickMouse == "construct"){
                        //addToCanvas(x,y,arrToPath);
                        let flag = false;
                        //проверка на нажатие
                        for (let key in graph.nodeHash) {
                            if (Math.abs(graph.nodeHash[key].x - x) <= graph.nodeHash[key].radius*2  &&
                                Math.abs(graph.nodeHash[key].y - y) <= graph.nodeHash[key].radius*2) {
                                flag = true;
                            }
                        }
                        if(flag){
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
                                statistics.update();
                                //menuProperty.update("addPath");
                                arrToPath = [];

                            }
                        }
                        else{
                            graph.add(x, y);
                            statistics.update();
                        }
                    }
                    if(props.leftClickMouse == "delete"){
                        deleteToCanvas(x,y);
                        statistics.update();
                    }
                    if(props.leftClickMouse == "select"){
                        selectToCanvas(x,y);
                    }
                }
                else{
                    if(props.rightClickMouse == "delete"){
                        deleteToCanvas(x,y);
                        statistics.update();
                    }
                    if(props.rightClickMouse == "construct"){

                    }
                    if(props.rightClickMouse == "select"){
                        selectToCanvas(x,y);
                    }
                    if(props.rightClickMouse == "changecolor"){
                        changeColorCanvas(x,y);
                    }
                }


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

                        for(let i = 0;i<targetMove.roads.length;i++){
                            let key = targetMove.roads[i].to;
                            targetMove.roads[i].xStart = x;
                            targetMove.roads[i].yStart = y;
                            for(let j =0;j<graph.nodeHash[key].roads.length;j++){
                                if(graph.nodeHash[key].roads[j].to == targetMove.roads[i].in){
                                    graph.nodeHash[key].roads[j].xEnd = x;
                                    graph.nodeHash[key].roads[j].yEnd = y;
                                }
                            }
                        }
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
        this.isDicotyleds = false;
    }
    add(x,y,name =""){
        this.nodeHash[this.cnt++] = new Node(name, x, y);
        history.update(this.nodeHash);
        historyAct.update("addNode");
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
    isWood(){
        return this.getConnectComponentCount() > 1 && !this.isCycle();
    }
    isRegular(){
        let arr = [];
        for(let key in this.nodeHash){
            arr.push(this.nodeHash[key].roads.length);
        }
        console.log(arr);
        let curr = arr[0];
        let result = arr.find(item => item != curr);
        return result == undefined;
    }
    isDicotyledonous(){
        this.isDicotyleds = true;
        let checkendNode = [];
        for(let key in this.nodeHash){
            if(!checkendNode.includes(key)) {
                checkendNode.push(key);
                this.dfs3(this.nodeHash[key], 1, checkendNode);
            }
        }
        for(let key in this.nodeHash)
            this.nodeHash[key]._color = null;
        return this.isDicotyleds;
    }
    dfs3(node, color, checkendNode){
        node._color = color;
        for(let i = 0;i<node.roads.length;i++){
            let key = node.roads[i].to;
            if(!checkendNode.includes(key)){
                checkendNode.push(key);
                this.dfs3(this.nodeHash[key], invert(color), checkendNode);
            }
            if(this.nodeHash[key]._color == color){
                this.isDicotyleds = false;
                return false;
            }
        }
    }
    dfsToBi(key, arrChecked, graphBi){
        arrChecked.push(key);
        for(let i = 0;i<graphBi[key].roads.length;i++){
            let keym = graphBi[key].roads[i].to;
            if(!arrChecked.includes(keym)){
                this.dfsToBi(keym, arrChecked, graphBi);
            }
        }
    }
    isBiconnected(){
        let graphCurrent = JSON.parse(JSON.stringify(this.nodeHash));
        let keys = [];
        for(let key in graphCurrent)
            keys.push(key);
        for(let i = 0;i<keys.length;i++){
            graphCurrent = JSON.parse(JSON.stringify(this.nodeHash));
            let point = JSON.parse(JSON.stringify(graphCurrent[keys[i]]));
            delete graphCurrent[keys[i]];
            for(let key in graphCurrent){
                for(let j =0;j<graphCurrent[key].roads.length;j++){
                    if(graphCurrent[key].roads[j].to == keys[i]){
                        graphCurrent[key].roads.splice(j,1);
                    }
                }
            }

            let checkedNode = [];
            let count = 0;
            for(let key in graphCurrent){
                if(!checkedNode.includes(key)) {
                    this.dfsToBi(key, checkedNode, graphCurrent);
                    count++;
                }
            }
            if(count > 1)
                return false;

        }
        return true;
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
        historyAct.update("deleteNode");
    }
    addPath(key, key2){
        graph.nodeHash[key].roads.push(new Path("",key, key2,  graph.nodeHash[key].x,  graph.nodeHash[key].y, graph.nodeHash[key2].x,  graph.nodeHash[key2].y, 1, globalConfig.stylePath, null));
        graph.nodeHash[key2].roads.push(new Path("",key2, key, graph.nodeHash[key2].x,  graph.nodeHash[key2].y, graph.nodeHash[key].x,  graph.nodeHash[key].y, 1, globalConfig.stylePath, null));
        history.update(this.nodeHash);
        historyAct.update("addPath");
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
        historyAct.update("deletePath");
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
        let checked = [];
        for(let key in this.nodeHash){
            for(let i =0;i<this.nodeHash[key].roads.length;i++){
                //if(!checked.includes(this.nodeHash[key].roads[i].to)) {
                    let toKey = this.nodeHash[key].roads[i].to;
                    cnv.ctx.globalAlpha = this.nodeHash[key].roads[i].isActive ? 1 : 0.2;
                    cnv.ctx.beginPath();
                    cnv.ctx.strokeStyle = this.nodeHash[key].roads[i].color;
                    cnv.ctx.setLineDash(this.nodeHash[key].roads[i].stylePath);
                    cnv.ctx.lineWidth = this.nodeHash[key].roads[i].width;
                    cnv.ctx.shadowBlur = this.nodeHash[key].roads[i].isSelected ? 10 : 0;
                    cnv.ctx.moveTo(this.nodeHash[key].x, this.nodeHash[key].y);
                    cnv.ctx.lineTo(this.nodeHash[toKey].x, this.nodeHash[toKey].y);
                    cnv.ctx.stroke();
                    cnv.ctx.closePath();
                    //checked.push(this.nodeHash[key].roads[i].in);
                //}
            }
        }
        cnv.ctx.globalAlpha = 1;
        //вывод имен путей
        checked = [];
        for(let key in this.nodeHash){
            for(let i =0;i<this.nodeHash[key].roads.length;i++){
                //if(!checked.includes(this.nodeHash[key].roads[i].to)) {
                    let x = (this.nodeHash[key].roads[i].xStart + this.nodeHash[key].roads[i].xEnd) / 2,
                        y = (this.nodeHash[key].roads[i].yStart + this.nodeHash[key].roads[i].yEnd) / 2;
                    cnv.ctx.fillStyle = "black";
                    cnv.ctx.font = "20 Arial";
                    if (this.nodeHash[key].roads[i].weight)
                        cnv.ctx.fillText(this.nodeHash[key].roads[i].name + " (" + this.nodeHash[key].roads[i].weight + ")", x, y - 15);
                    else
                        cnv.ctx.fillText(this.nodeHash[key].roads[i].name, x, y - 15);
                    //checked.push(this.nodeHash[key].roads[i].in);
                //}
            }

        }
        //вывод имен
        for(let key in this.nodeHash){
            cnv.ctx.fillStyle = "black";
            cnv.ctx.font = "20 Arial";
            if(this.nodeHash[key].weight)
                cnv.ctx.fillText(this.nodeHash[key].name + " (" + this.nodeHash[key].weight + ")",this.nodeHash[key].x, this.nodeHash[key].y-this.nodeHash[key].radius*2);
            else
                cnv.ctx.fillText(this.nodeHash[key].name,this.nodeHash[key].x, this.nodeHash[key].y-this.nodeHash[key].radius*2);
        }
        //вывод вершин
        for(let key in this.nodeHash){
            cnv.ctx.fillStyle = this.nodeHash[key].color || "red";
            cnv.ctx.globalAlpha = this.nodeHash[key].isActive ? 1 : 0.2;
            cnv.ctx.beginPath();
            cnv.ctx.shadowBlur= this.nodeHash[key].isSelected ? 10 : 0;
            cnv.ctx.arc(this.nodeHash[key].x, this.nodeHash[key].y,this.nodeHash[key].radius, 0 , 2*Math.PI);
            cnv.ctx.fill();
            cnv.ctx.closePath();
        }
        cnv.ctx.globalAlpha = 1;

    }
    setAllGrowPoints(value){
        for(let key in this.nodeHash){
           this.nodeHash[key].setGrow(value);
        }
    }
    setAllStylePath(value){
        for(let key in this.nodeHash){
            for(let i = 0;i<this.nodeHash[key].roads.length;i++){
                this.nodeHash[key].roads[i].setStyle(value);
            }
        }
    }
}
class Node{
    constructor(name,x,y, radius = globalConfig.radius, color = "red", weight = null, active = true){
        this.name = name;
        this.color = color;
        this.radius = radius;
        this.isActive = active;
        this.isConfig = false;
        this.isSelected = false;
        this.x = x;
        this.y = y;
        this.weight = weight;
        this.phantomX = null;
        this.phantomY = null;
        this.roads = [];
    }
    setColor(color){
        this.color = color;
        history.update(graph.nodeHash);
        historyAct.update("setColor", color, this);
    }
    setName(name){
        this.name = name;
        history.update(graph.nodeHash);
        historyAct.update("setName", name, this);
    }
    setGrow(value){
        this.radius = value;
        history.update(graph.nodeHash);
        historyAct.update("setGrow", value, this);
    }
    setActive(){
        this.isActive = !this.isActive;
        history.update(graph.nodeHash);
        historyAct.update("setActive", this.isActive, this);
    }
    setWeight(value){
        this.weight = value;
        history.update(graph.nodeHash);
        historyAct.update("setWeight", value, this);
    }
}
class Path{
    constructor(name,namein,nameto,x1,y1,x2,y2,width,stylePath = [0],weight = null,color ="black",select = false, active = true) {
        this.to = nameto;
        this.in = namein;
        this.name = name;
        this.isActive = active;
        this.width = width;
        this.color = color;
        this.xStart = x1;
        this.yStart = y1;
        this.xEnd = x2;
        this.yEnd = y2;
        this.weight = weight;
        this.isSelected = select;
        this.isConfig = false;
        this.stylePath = stylePath;
        this._color = null;
    }
    setColor(color){
        this.color = color;
        historyAct.update("setColor", color, this);
        //history.update(graph.nodeHash);
    }
    setGrow(value){
        this.width = value;
        historyAct.update("setGrow", value, this);
        //history.update(graph.nodeHash);
    }
    setName(name){
        this.name = name;
        historyAct.update("setName", name, this);
        //history.update(graph.nodeHash);
    }
    setActive(){
        this.isActive = !this.isActive;
        historyAct.update("setActive", this.isActive, this);
    }
    setStyle(value){
        this.stylePath = value;
        //history.update(graph.nodeHash);
    }
    setWeight(value){
        this.weight = value;
        historyAct.update("setWeight", value, this);
        //history.update(graph.nodeHash);
    }
}
window.addEventListener("load",async ()=>{
    serverloader = new ServerConnector();
    embedmodule = new EmbededModule();
    await serverloader.getmodules();
    menuProperty = new MenuPropertyGraph();
    cnv = new CNV();
    graph = new Graph();
    menu = new ContextMenu();
    history = new History();
    historyAct = new HistoryAction();
    menuLeft = new Menu();
    statistics = new Statistics();
    console.log("T");
    cnv.clear();
    cnv.register();
    history.update(graph.nodeHash);
    embedmodule.embed(serverloader.modul);
    embedmodule.initfunc(serverloader.modul);
    //serverloader.run();
    requestAnimationFrame(loop);
    initElems();
});
window.addEventListener("scroll", ()=>{
    if(cnv)
        cnv.init();
});
async function preGetTask(elemHTMLTask) {
    let taskOption = await serverloader.gettask();
    console.log(taskOption);
    elemHTMLTask.children[0].innerText = `Задача #${taskOption["id"]}`;
    elemHTMLTask.children[1].innerText = `${taskOption["description"]}`;

    isConstruct = false;
    menuLeft.toggle();
    historyAct.clear();
    statistics.setParam(taskOption["hints"]);
    statistics.toggle();
    props.leftClickMouse = taskOption["actionMouse"].leftClickMouse;
    props.rightClickMouse = taskOption["actionMouse"].rightClickMouse;
    history.clear();
    graph = new Graph();

}
function initElems(){
    let task_elem = document.querySelector("#tsk");
    let info_elem = document.querySelector("#act");
    let programm_elem = document.querySelector("#prg");
    let module_elem = document.querySelector("#mdl");
    let api_elem = document.querySelector("#api");
    let task_learn_elem = document.querySelector("#lrn");

    let taskShow = document.querySelector(".tasks");
    let infoShow = document.querySelector(".actions");
    let programmShow = document.querySelector(".programms");
    let modulesShow = document.querySelector(".modules");
    let apiShow = document.querySelector(".api-block");
    let newTaskShow = document.querySelector(".task-text");

    taskShow.style.display = "flex";
    task_elem.addEventListener("click", ()=>{
        taskShow.style.display = "flex";
        infoShow.style.display = "none";
        programmShow.style.display = "none";
        modulesShow.style.display = "none";
        apiShow.style.display = "none";
        newTaskShow.style.display = "none";
        isConstruct = true;
        menuLeft.toggle();
        historyAct.clear();
        statistics.toggle();
        history.clear();
        graph = new Graph();
    });
    info_elem.addEventListener("click", ()=>{
        infoShow.style.display = "flex";
        taskShow.style.display = "none";
        programmShow.style.display = "none";
        modulesShow.style.display = "none";
        apiShow.style.display = "none";
        newTaskShow.style.display = "none";
    });
    programm_elem.addEventListener("click", ()=>{
        programmShow.style.display = "flex";
        infoShow.style.display = "none";
        taskShow.style.display = "none";
        modulesShow.style.display = "none";
        apiShow.style.display = "none";
        newTaskShow.style.display = "none";
    });
    module_elem.addEventListener("click", ()=>{
        modulesShow.style.display = "flex";
        infoShow.style.display = "none";
        taskShow.style.display = "none";
        programmShow.style.display = "none";
        apiShow.style.display = "none";
        newTaskShow.style.display = "none";
    });
    api_elem.addEventListener("click", ()=>{
        apiShow.style.display = "flex";
        infoShow.style.display = "none";
        taskShow.style.display = "none";
        programmShow.style.display = "none";
        modulesShow.style.display = "none";
        newTaskShow.style.display = "none";
    });
    task_learn_elem.addEventListener("click", ()=>{
        newTaskShow.style.display = "flex";
        modulesShow.style.display = "none";
        infoShow.style.display = "none";
        taskShow.style.display = "none";
        programmShow.style.display = "none";
        apiShow.style.display = "none";
        preGetTask(newTaskShow);
    });

    let editElem = document.querySelector("#edit");
    let area = document.querySelector("#text-area");
    let flag_area = false;
    editElem.addEventListener("click", ()=>{
        let textTaskElem = document.querySelector("#text-newtask");
        let text = "";
        flag_area = !flag_area;
        area.style.display = flag_area ? "block" :"none";
        textTaskElem.style.display = !flag_area ? "block" : "none";
        for(let i = 0;i<textTaskElem.children.length;i++){
            text += textTaskElem.children[i].innerText + "\n";
        }
        if(flag_area)
            area.value = text;
        if(!flag_area){
            let currentText = document.querySelector("#text-area");
            console.log(currentText.value);
            let arrText = currentText.value.split("\n");
            textTaskElem.innerHTML = "";
            for(let i  =0;i<arrText.length;i++){
                textTaskElem.innerHTML += `<p>${arrText[i]}</p>`;
            }
        }
    });

    let loadModuleElem = document.querySelector("#loadmodule");
    loadModuleElem.addEventListener("click", async (e)=>{
        e.preventDefault();
        let file = document.querySelector("#file-input-module").files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load",async()=>{
            let jsonmodule = JSON.parse(reader.result);
            if(jsonmodule["name"] && jsonmodule["type"] && jsonmodule["desc"] && jsonmodule["script"]){
                /*
                let gl = 0;
                let globalConfig = {
                    radius: 5
                };
                let props = {
                    leftClickMouse: null,
                    rightClickMouse: null
                };
                let serverloader = null;
                let embedmodule = null;
                let isConstruct = true;
                let menuLeft;
                let graph;
                let cnv;
                let menu;
                let menuProperty;
                let history;
                let statistics;
                let historyAct;
                */
                let regexp = /graph=|graph =|globalConfig|props|serverloader|embedmodule|isConstruct|menuLeft|cnv|menu|menuProperty|history|statistics|colors|globalConfig|graph\.nodeHash\[[a-z][a-z0-9]*] =|graph\.nodeHash\[[a-z][a-z0-9]*]=/;
                if(!jsonmodule["script"].match(regexp) && (jsonmodule["type"] == "boolean" || jsonmodule["type"] == "integer")){
                    console.log("УСПЕХ");
                    let formData = document.querySelector("#upload-container");
                    await serverloader.loadmodule(formData);
                }
            }


        });


        //let file = document.querySelector("#file-input-module");
        //console.log(file.files[0]);

    });

}
function loop(){
    graph.showGraph();
    requestAnimationFrame(loop);
}

