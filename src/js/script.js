document.getElementById("draw-button").addEventListener("click", drawOnClickEvent);

document.getElementById("select-button").addEventListener("click", selectOnClickEvent);

function drawOnClickEvent() {
    var button = document.getElementById("draw-child");
    if (button.style.display === "block") {
        button.style.display = "none";
    } else {
        button.style.display = "block";
    }
    document.getElementById("select-child").style.display = "none";
}

// function selectOnClickEvent() {
//     var button = document.getElementById("select-child");
//     if (button.style.display === "block") {
//         button.style.display = "none";
//     } else {
//         button.style.display = "block";
//     }
//     document.getElementById("draw-child").style.display = "none";
// }