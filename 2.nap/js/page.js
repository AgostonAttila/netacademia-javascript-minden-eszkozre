var üzenet = {
    rövid: "Hello Világ!",
    hosszú: "Hello Világ hosszan!"
};

function csináljValamit() {
    var res = prompt(arguments[0]);
    var igaze = confirm("Biztos?");

    if (arguments[1] === res) {
        alert("Oké");
    }
    else {
        alert("Nem oké");
    }
}

//csináljValamit("Mennyi öt meg öt?", "10");

document.getElementById("b").innerHTML = "<strong>VALAMI!</strong>";
document.getElementById("b").style.backgroundColor = "#123456";

document.getElementById("b").className += " alma";

document.getElementById("b").setAttribute("data-saját", "semmi")
var semmi = document.getElementById("b").getAttribute("data-saját");

//document.getElementById("b").hasAttribute("loop");

document.getElementById("btn").addEventListener("click", function (e) {
    console.log(e);
});