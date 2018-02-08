var oracle1 = [
    "Szinte", "Teljesen", "Egészen", "Néha", "Kicsit", "Nagyon", "Átlagosan", "Mesésen", "Fantasztikusan", "Elképesztően", "Halálosan"
];

var oracle2 = [
    "boldog", "szerencsés", "szerencsétlen", "érdekes", "izgalmas", "nehéz", "könnyű", "mozgalmas", "unalmas", "értelmetlen", "hosszú", "rövid"
];

var oracle3 = [
    "életed lesz.", "leszel életed során.", "leszel következő életedben.", "lesz a jövő heted.", "lesz a következő napod."
];

var range = function (nr, max) {
    while (nr >= max) {
        nr -= max;
    }

    return nr;
}

var progress = function (message) {
    var counter = 0;

    var timer = this.setInterval(function () {
        this.postMessage({ status: "thinking", progress: ++counter });
        if (counter >= 100) {
            this.clearInterval(timer);
            this.postMessage({ status: "oracle", message: message });
        }
    }, 100);
}

this.addEventListener("message", function (e) {
    var person = e.data;

    var oracle = oracle1[range(person.age, oracle1.length)] + " " +
                 oracle2[range(person.sign, oracle2.length)] + " " +
                 oracle3[range(person.day, oracle3.length)];

    progress(oracle);
});