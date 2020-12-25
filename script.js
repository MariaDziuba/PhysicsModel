function drawChart(arr, indexes) {
    const ctx = document.getElementById("сhart");
    Chart.defaults.global.defaultFontFamily = "Caveat";
    Chart.defaults.global.defaultFontSize = 25;
    //ctx.style.backgroundColor = 'rgba(255,0,0,255)';
    const data = {
        labels: indexes,
        datasets: [{
            label: "Зависимость координаты шара от времени",
            borderColor: "rgba(128,0,0 ,1 )",
            data: arr,
            fill: false
        },
    ]
    };
    const myBarChart = new Chart(ctx, {
        type: 'line',
        data: data,

        options: {
            legend: {
                label: {
                    font: {
                        size: '30'
                    }
                }
            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: '20',
                        //beginAtZero: true
                    }
                }],
                yAxes: [{
                    ticks: {
                        fontSize: '20',
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

let inputMass;
let outputMass;
let inputConcentration;
let outputConcentration;
let inputMaxtime;
let outputMaxtime;


window.onload = function () {
    inputMass = document.getElementById("mass");
    outputMass = document.getElementById("mass-text");
    inputConcentration = document.getElementById("concentration");
    outputConcentration = document.getElementById("concentration-text");
    inputMaxtime = document.getElementById("max-time");
    outputMaxtime= document.getElementById("max-time-text");
    generate();
    sliders();
}

function parametersInnerHTML() {
    outputMass.innerHTML = inputMass.value;
    outputConcentration.innerHTML = inputConcentration.value;
    outputMaxtime.innerHTML = inputMaxtime.value;
}

function slider(slider, output) {
    slider.oninput = function () {
        output.innerHTML = this.value;
        generate();
    }
}

function sliders() {
    parametersInnerHTML();
    slider(inputMass, outputMass);
    slider(inputConcentration, outputConcentration);
    slider(inputMaxtime, outputMaxtime);

}

function generate(mass = Number(inputMass.value),
                  concentration = Number(inputConcentration.value),
                  maxTime = Number(inputMaxtime.value),) {

    let coords = generateCoordinates(mass, concentration, maxTime);

    let indexes = new Array(maxTime + 1);
    for (let i = 1; i <= maxTime; i++) {
        indexes[i] = i;
    }

    document.getElementById("canvas-container").innerHTML = "<canvas id=\"сhart\"></canvas>";
    drawChart(coords, indexes)
}

function generateCoordinates(m, cp, maxTime) { //delete v0
    let coords = new Array(maxTime + 1);
    // m - mg, v0 - mm/s, cp - %, maxTime - s

    //common
    let g = 9806.65; // mm/s^2
    let h = 100.0; // пусть высота сосуда
    coords[0] = h; // mm

    //ball
    let ro = 8.0; // mg/mm^3
    let V = m / ro; // mm^3
    let R = Math.cbrt((3.0 * V) / (4.0 * Math.PI)); // mm
    let v0 = 0;

    //water
    let c = 5.0 * v0;
    let nu = (1.92 * Math.pow(Math.E, (0.05 * cp))) / 1000.0;
    let w = Math.pow(Math.E, -nu);
    let k = 0.0;
    let p0 = 1.0 + (cp / 14.29); // mg/mm^3
    let tal = 1.0;

    //other
    let A = (g - (p0 * g * V) / m);
    let B = (- (6.0 * Math.PI* R * nu) / m);
    let D = (c / m);

    //задача коши
    //t0 = 0:
    let const1 = -
                (   (D
                    * Math.pow(tal, 2)
                    * (- (B + 1/tal))
                    /   (   Math.pow(tal, 2)
                            * (Math.pow(w, 2) + Math.pow(B, 2))
                        + 2 * B * tal + 1))
                - A/B - v0);
    let const2 = -
            (   (D
                * Math.pow(tal, 3)
                * (-tal * Math.pow(w, 2)
                    + B
                    + 1.0/tal))
                / ( (   Math.pow(tal, 2)* Math.pow(tal, 2)
                        + Math.pow(tal, 2)*Math.pow(B, 2)
                        +2.0 * tal * B
                        +1.0)
                    *(1.0 + Math.pow(tal, 2)
                            *Math.pow(w, 2)))
            + const1 / B)
            + h;

    for (let t1 = 1; t1 < maxTime + 1; t1++) { // цикл по времени
        let t = t1/100.0;
        let coord =
                (   (D
                    * Math.pow(tal, 3)
                    * Math.pow(Math.E, -t / tal)
                    * (((-w * (2 + B * tal))
                            * Math.sin(w * t))
                        + (     (-tal * Math.pow(w, 2)
                                + B
                                + 1.0/tal)
                            * Math.cos(w * t))))
                    / ( (   Math.pow(tal, 2)* Math.pow(tal, 2)
                        + Math.pow(tal, 2)*Math.pow(B, 2)
                        +2.0 * tal * B
                        +1.0)
                        *(1.0 + Math.pow(tal, 2)
                            * Math.pow(w, 2))))
            - A * t / B
            + const1 * Math.pow(Math.E, B * t) / B
            + const2;
        if(2 * h - coord <= 0) {
            break;
        }
        coords[t1] = 2 * h - coord ;
    }
    return coords;
}
