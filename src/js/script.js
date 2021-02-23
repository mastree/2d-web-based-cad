// document.getElementById("draw-button").addEventListener("click", drawOnClickEvent);

// document.getElementById("select-button").addEventListener("click", selectOnClickEvent);

// function drawOnClickEvent() {
//     var button = document.getElementById("draw-child");
//     button.style.display = "block";
//     document.getElementById("select-child").style.display = "none";
// }

// function selectOnClickEvent() {
//     var button = document.getElementById("select-child");
//     if (button.style.display === "block") {
//         button.style.display = "none";
//     } else {
//         button.style.display = "block";
//     }
//     document.getElementById("draw-child").style.display = "none";
// }
function download(filename, text) {
    var element = document.createElement('a');
    element.target = "_blank"
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
}