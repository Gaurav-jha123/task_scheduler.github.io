let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textaeaCont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let lockElem = document.querySelector("tikcet-lock");
let toolBoxColors = document.querySelectorAll(".color");

let colors  = ["lightpink" , "lightblue" , "lightgreen" , "black"];
let modalPriorityColor = colors[colors.length - 1];


let addFlag = false;
let removeFlag = false;
let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketArr = [];

if(localStorage.getItem("jira_tickets")){
    // retrieve and dispaly tickets
    ticketArr = JSON.parse(localStorage.getItem("jira_tickets"));
    ticketArr.forEach((ticketObj) => {
        createTicket(ticketObj.ticketColor ,  ticketObj.ticketTask, ticketObj.ticketID);
    })

}

for(let i = 0 ; i < toolBoxColors.length ; i++){
    toolBoxColors[i].addEventListener("click", (e) =>{
        let currentToolBoxColor = toolBoxColors[i].classList[0];
         // to acces color value from here
         // use ticketArra
         let filteredTickets = ticketArr.filter((ticketObj , idx) =>{
            return currentToolBoxColor === ticketObj.ticketColor;
            
         })
         // to remove the other tikcets which do not match color
         let allTicketsCont =  document.querySelectorAll(".ticket-cont");
         for(let i = 0 ; i < allTicketsCont.length ; i++){
             allTicketsCont[i].remove();
         }
         //display new filtered ctickets which match color
         filteredTickets.forEach((ticketObj , idx) => {
             createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
         })
    })
    toolBoxColors[i].addEventListener("dblclick" , (e) =>{
        // to remove the other tikcets which do not match color
        let allTicketsCont =  document.querySelectorAll(".ticket-cont");
        for(let i = 0 ; i < allTicketsCont.length ; i++){
            allTicketsCont[i].remove();
        }
        ticketArr.forEach((ticketObj , idx) => {
                createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
        }) 
    })
}

//Listnere for modal priority coloring
allPriorityColors.forEach((colorElem , idx) =>{
    colorElem.addEventListener("click" , (e) => {
        allPriorityColors.forEach((prioriityColorElem , idx) =>{
            prioriityColorElem.classList.remove("border");
        })
        colorElem.classList.add("border");
        modalPriorityColor= colorElem.classList[0];
    })
})

addBtn.addEventListener("click" , (e) =>{
    // console.log("Clicked" + i++);
    // display modal
    //generate ticket
    
    // addFlag = true  -> Modal diplay
    // false - > modal none
    addFlag = !addFlag; // i.e. toggle 
    if(addFlag == true){
        modalCont.style.display = "flex";
    }else{
        modalCont.style.display = "none";
    }
})

removeBtn.addEventListener("click" , (e) =>{
    removeFlag = !removeFlag;
})

modalCont.addEventListener("keydown" , (e) =>{
    let key = e.key;
    if(key === "Shift"){
        createTicket(modalPriorityColor , textaeaCont.value );// passed from scipt in index
        modalCont.style.display = "none";
        addFlag = false;// so taht it removes see aboce toggle conditon
        setModalToDEfault();
    }
})

function createTicket(ticketColor , ticketTask , ticketID){
    let id =  ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${ticketTask}</div>
    <div class="ticket-lock">        
                <i class="fas fa-lock"></i>
                </div>`;
    mainCont.appendChild(ticketCont);

    //create object of ticket and add to array
    
    if(!ticketID){
        ticketArr.push({ticketColor, ticketTask , ticketID : id});
        localStorage.setItem("jira_tickets" , JSON.stringify(ticketArr));
    } 
    // to store in array;

    handleRemoval(ticketCont  , id);
    handleLock(ticketCont  , id);
    handleColor(ticketCont , id);
}

function handleRemoval(ticket , id){
    // remove falg - true -> remove
   ticket.addEventListener("click" , (e) => {
       if(!removeFlag) return;
       let idx = getTicketIdx(id);
       // db removal
       ticketArr.splice(idx , 1);
        let strTicketsArr = JSON.stringify(ticketArr);
       localStorage.setItem("jira_tickets" , strTicketsArr);
       ticket.remove();// ui removal
   }) 
}
function handleLock(ticket , id){
    let ticketLockElem = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea =ticket.querySelector(".task-area");
    ticketLock.addEventListener("click" , (e) =>{
        let ticketIdx = getTicketIdx(id);
        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable" , "true");

        }else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable" , "false");

        }
        //modify data in localstorage(Task)
        ticketArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets" , JSON.stringify(ticketArr));
    })
}

function handleColor(ticket , id){
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e) => {
        //get ticketIdx from tickerArr    
        let ticketIdx = getTicketIdx(id);
    
    let currentTicketColor = ticketColor.classList[1];
    // GEt Ticket Colro index
    let currentTicketColorIdx = colors.findIndex((color) =>{
        return currentTicketColor === color;
    })
    currentTicketColorIdx++;
    let newTicketColorIdx = currentTicketColorIdx % colors.length;
    let newTicketColor = colors[newTicketColorIdx];
    // to make the roate  back to 0 from .length end
    ticketColor.classList.remove(currentTicketColor);
    ticketColor.classList.add(newTicketColor);
    //modify data in local storage(priority color change)
    ticketArr[ticketIdx].ticketColor = newTicketColor;
    localStorage.setItem("jira_tickets" , JSON.stringify(ticketArr));

})

}

function getTicketIdx(id){
    let ticketIdx = ticketArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return ticketIdx;
}
function setModalToDEfault(){
    modalCont.style.display = "none";
    textaeaCont.value = "";
    modalPriorityColor = colors[colors.length - 1];
    allPriorityColors.forEach((prioriityColorElem , idx) =>{
        prioriityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
}

