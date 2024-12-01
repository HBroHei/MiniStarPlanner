var spaceList_undoStack = []
var spaceList_redoStack = []

function enterVal(evt,ele){
    if(evt.key !== "Enter" && ele.nodeName !== "SELECT") // Prevent non-enter key and other unwanted actions
        return;
    evt.preventDefault();

    var undoAction = {
        "Action" : ele.id.substring(4),
    }
    // For the time being we will use stack with the full spaceList
    spaceList_undoStack.push(structuredClone(spacesList))
    document.getElementById("btn_undo").disabled = false;
    getElement("btn_undo").classList.remove("disabled");

    // Set the value by extracting the id of the element for what info should be replaced
    spacesList[current_space][ele.id.substring(4)] = ele.value;

    // Explicit check if the key needs to be renamed
    if(ele.id=="inp_ms_name"){
        // Iterate for refactoring ms_link of other spaces
        for (const [key, value] of Object.entries(spacesList)) {
            if(value.ms_link == current_space){
                if(undoAction.refactor===undefined)
                    undoAction["ms_link_refactor"] = [];
                spacesList[key].ms_link = ele.value;
            }
        }

        // Renaming the space itself
        spacesList[ele.value] = spacesList[current_space];
        delete spacesList[current_space];
        current_space = ele.value;
    }

    // Re-render the entire map (which may be costy)
    rerender();
}

function undo(){
    // List operation
    spaceList_redoStack.push(structuredClone(spacesList));
    spacesList = spaceList_undoStack.pop();
    // Button UI operation
    document.getElementById("btn_redo").disabled = false;
    getElement("btn_redo").classList.remove("disabled");
    if(spaceList_undoStack.length==0){
        getElement("btn_undo").disabled = true;
        getElement("btn_undo").classList.add("disabled");
    }

    // Reset the canvas
    getElement("div_ms_prop").style.display = "none";
    getElement("div_action_btns").style.display = "block";

    can3Ctx.clearRect(0, 0, can3Ctx.canvas.width, can3Ctx.canvas.height);
}

function redo(){
    spaceList_undoStack.push(structuredClone(spacesList))
    spacesList = spaceList_redoStack.pop();
    getElement("btn_undo").disabled = false;
    getElement("btn_undo").classList.remove("disabled");
    if(spaceList_redoStack.length==0){
        getElement("btn_redo").disabled = true;
        getElement("btn_redo").classList.add("disabled");
    }

    getElement("div_ms_prop").style.display = "none";
    getElement("div_action_btns").style.display = "block";

    can3Ctx.clearRect(0, 0, can3Ctx.canvas.width, can3Ctx.canvas.height);
}