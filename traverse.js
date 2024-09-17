// To dynamically add a new row for traverse input

const PI = Math.PI;

let numOfStations = 0;

function addStations() {
  const tableBody = document.getElementById("table-body");
  const zBody = document.getElementById("z-body");

  let numStations = event.target.value;
  numOfStations = parseInt(numStations);

  for (let i = 0; i < numStations; i++) {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td> <span> 100${i + 1}  </span></td>
            <td><input type="number" class="observed-angle" placeholder="Enter observed angle"></td>
            <td><span class="corrected-angle-display"></span></td>
            <td><input type="number" class="length" placeholder="Enter length"></td>
        `;

    let bearingCell =
      i === 0
        ? '<td><input type="number" class="bearing" placeholder="Enter bearing"></td>'
        : '<td><span class="bearing"></span></td>';
    row.innerHTML += bearingCell;

    row.innerHTML += `<td><span class="easting"></span></td>
            <td><span class="delta-e"></span></td>
            <td><span class="northing"></span></td>
            <td><span class="delta-n"></span></td>
        `;

    tableBody.appendChild(row);

    const zRow = document.createElement("tr");

    zRow.innerHTML = `
            <td> <span> 100${i === 0 ? numOfStations : i}  </span> </td>
            <td> <input type="number" class="z-angle" placeholder="Enter Zenithal Angle"> </td>
            <td> <input type="number" class="hi" placeholder="Enter Height of Instrument"> </td>
            <td> <input type="number" class="ht" placeholder="Enter Height of Target"> </td>
            <td> <span class="delta-h"></span> </td>
        `;

    let heightInputCell =
      i === 0
        ? '<td><input type="number" id="inputHeight" placeholder="Enter height"></td>'
        : '<td><span class="correctHeight"></span></td>';
    zRow.innerHTML += heightInputCell;
    zBody.appendChild(zRow);
  }

  let lastRow = document.createElement("tr");
  lastRow.innerHTML = `
        <td> <span> 100${numOfStations} </span> </td>
        <td> <input type="number" class="z-angle" placeholder="Enter Zenithal Angle"> </td>
        <td> <input type="number" class="hi" placeholder="Enter Height of Instrument"> </td>
        <td> <input type="number" class="ht" placeholder="Enter Height of Target"> </td>
        <td> <span class="delta-h"></span> </td>
        <td><span class="correctHeight"></span></td>
    `;
  zBody.appendChild(lastRow);

  let bearing1 = tableBody.querySelector("tr td .bearing");
  let heightElem = document.getElementById("inputHeight");
  bearing1.addEventListener("change", calculateBearings);
  heightElem.addEventListener("change", calculateZ);
}

function validateObservedAngles() {
  const observedAngles = document.querySelectorAll(
    "#table-body tr .observed-angle"
  );

  let angles = [];
  observedAngles.forEach((angle) => angles.push(angle.valueAsNumber));
  const sumOfAngles = angles.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  let formulaSum = (2 * numOfStations - 4) * 100;
  let correction = formulaSum - sumOfAngles;
  const correctedAngles = document.querySelectorAll(
    "#table-body tr .corrected-angle-display"
  );

  if (correction > 0) {
    corrAngles = angles.map((angle) => angle + correction / numOfStations);
    correctedAngles.forEach(
      (angle, index) => (angle.innerHTML = corrAngles[index])
    );
  } else if (correction < 0) {
    corrAngles = angles.map((angle) => angle - correction / numOfStations);
    correctedAngles.forEach(
      (angle, index) => (angle.innerHTML = corrAngles[index])
    );
  } else if (correction === 0) {
    correctedAngles.forEach(
      (angle, index) => (angle.innerHTML = angles[index])
    );
  }
}

const populateDummyData = () => {
  let angles = [
    134.5818, 107.5991, 262.6784, 148.8424, 94.5599, 136.6286, 235.7505,
    79.3593,
  ];
  let distances = [
    56.623, 39.401, 27.487, 43.423, 41.033, 47.988, 56.699, 36.394,
  ];

  const observedAngles = document.querySelectorAll(
    "#table-body tr .observed-angle"
  );
  observedAngles.forEach((angle, index) => (angle.value = angles[index]));

  const lengthContaners = document.querySelectorAll("#table-body tr .length");
  lengthContaners.forEach(
    (container, index) => (container.value = distances[index])
  );

  let zAngles = [
    99.515, 92.3138, 100.145, 99.5188, 105.0335, 103.388, 102.0675, 100.3738,
    102.4362,
  ];
  let heightOfInstrument = [
    1.36, 1.355, 1.355, 1.385, 1.51, 1.39, 1.285, 1.46, 1.455,
  ];
  let heightOfTarget = [2, 2, 2, 2, 2, 2, 2.2, 2, 2.2];

  const zAngleContainers = document.querySelectorAll("#z-body tr .z-angle");
  const hiContainers = document.querySelectorAll("#z-body tr .hi");
  const htContainers = document.querySelectorAll("#z-body tr .ht");

  zAngleContainers.forEach((container, index) => {
    container.value = zAngles[index];
    hiContainers[index].value = heightOfInstrument[index];
    htContainers[index].value = heightOfTarget[index];
  });
};

const calculateBearings = () => {
  const tableBody = document.getElementById("table-body");

  let bearings = tableBody.querySelectorAll("tr td .bearing");

  let bearing1Value = parseFloat(bearings[0]?.value) || 0;

  const correctedColumn = document.querySelectorAll(
    "#table-body tr .corrected-angle-display"
  );
  let correctedAngles = [];
  correctedColumn.forEach((angle) =>
    correctedAngles.push(parseFloat(angle.innerHTML))
  );

  let bearingValues = [bearing1Value];

  for (i = 1; i < numOfStations; i++) {
    let value = bearingValues[i - 1];
    let calculatedValue = value + 200 - correctedAngles[i - 1];
    let valueToSet = calculatedValue;
    if (calculatedValue >= 600) valueToSet = calculatedValue - 600;
    else if (calculatedValue >= 400) valueToSet = calculatedValue - 400;

    bearingValues.push(valueToSet);

    bearings[i].innerHTML = valueToSet;
  }
};

const calculateEasting = () => {
  // calculate del E
  // distance * sine of bearing*PI/200

  let eastingContainers = document.querySelectorAll(
    "#table-body tr td .easting"
  );

  let bearings = document.querySelectorAll("tr td .bearing");

  let distanceContainers = document.querySelectorAll(
    "#table-body tr td .length"
  );
  let distanceValues = [];
  distanceContainers.forEach((container) =>
    distanceValues.push(container.valueAsNumber)
  );
  let perimeter = distanceValues.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  let knownEasting = document.getElementById("eastingKnown").valueAsNumber;
  let eastingValues = [knownEasting];

  let correctionEasting = [];
  let totalCorrection = 0;

  let delEContainers = document.querySelectorAll("#table-body tr td .delta-e");

  for (i = 1; i <= numOfStations; i++) {
    let bearing =
      i === 1
        ? bearings[i - 1].valueAsNumber
        : parseFloat(bearings[i - 1].innerHTML);
    let angle = (bearing * PI) / 200;
    let delE = distanceValues[i - 1] * Math.sin(angle);
    correctionEasting.push(delE);
    totalCorrection += delE;
  }

  eastingContainers.forEach((container, index) => {
    let correctionDelE = (-totalCorrection * distanceValues[index]) / perimeter;
    delEContainers[index].innerHTML = correctionEasting[index];
    let newValue =
      eastingValues[index] + correctionEasting[index] + correctionDelE;
    container.innerHTML = newValue;
    eastingValues.push(newValue);
  });
};

const calculaeNorthing = () => {
  let northingContainers = document.querySelectorAll(
    "#table-body tr td .northing"
  );

  let bearings = document.querySelectorAll("tr td .bearing");

  let distanceContainers = document.querySelectorAll(
    "#table-body tr td .length"
  );
  let distanceValues = [];
  distanceContainers.forEach((container) =>
    distanceValues.push(container.valueAsNumber)
  );
  let perimeter = distanceValues.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  let knownNorthing = document.getElementById("northingKnown").valueAsNumber;
  let northingValues = [knownNorthing];

  let correctionNorthing = [];
  let totalCorrection = 0;

  let delNContainers = document.querySelectorAll("#table-body tr td .delta-n");

  for (i = 1; i <= numOfStations; i++) {
    let bearing =
      i === 1
        ? bearings[i - 1].valueAsNumber
        : parseFloat(bearings[i - 1].innerHTML);
    let angle = (bearing * PI) / 200;
    let delN = distanceValues[i - 1] * Math.cos(angle);
    correctionNorthing.push(delN);
    totalCorrection += delN;
  }

  northingContainers.forEach((container, index) => {
    let correctionDelN = (-totalCorrection * distanceValues[index]) / perimeter;
    delNContainers[index].innerHTML = correctionNorthing[index];
    let newValue =
      northingValues[index] + correctionNorthing[index] + correctionDelN;
    container.innerHTML = newValue;
    northingValues.push(newValue);
  });
};

const calculateZ = () => {
  let distanceContainers = document.querySelectorAll(
    "#table-body tr td .length"
  );
  let distanceValues = [0];
  distanceContainers.forEach((container) =>
    distanceValues.push(container.valueAsNumber)
  );

  let heightContainers = document.querySelectorAll("#z-body tr .correctHeight");
  let inputHeight = document.getElementById("inputHeight").valueAsNumber;

  let heightValues = [inputHeight];
  let delHContainers = document.querySelectorAll("#z-body tr .delta-h");
  let zAngles = document.querySelectorAll("#z-body tr .z-angle");

  const hiContainers = document.querySelectorAll("#z-body tr .hi");
  const htContainers = document.querySelectorAll("#z-body tr .ht");

  zAngles.forEach((angle, index) => {
    let zAngle = (angle.valueAsNumber * PI) / 200;
    delH = distanceValues[index] / Math.tan(zAngle);
    let valueToSet =
      delH +
      hiContainers[index].valueAsNumber -
      htContainers[index].valueAsNumber;
    delHContainers[index].innerHTML = valueToSet;

    heightValues[index + 1] = heightValues[index] + valueToSet;
    if (heightContainers[index])
      heightContainers[index].innerHTML = heightValues[index] + valueToSet;
  });
};

// To calculate sums, closing error, and linear accuracy
function calculate() {
  const rows = document.querySelectorAll("#table-body tr");

  let sumE = 0;
  let sumN = 0;
  let perimeter = 0;

  rows.forEach((row) => {
    const deltaE = parseFloat(row.querySelector(".delta-e").innerHTML) || 0;
    const deltaN = parseFloat(row.querySelector(".delta-n").innerHTML) || 0;
    const length = parseFloat(row.querySelector(".length").value) || 0;

    sumE += deltaE;
    sumN += deltaN;
    perimeter += length;
  });

  const closingError = Math.sqrt(Math.pow(sumE, 2) + Math.pow(sumN, 2));
  const linearAccuracy = perimeter / closingError;

  document.getElementById("sum-del-e").textContent = sumE?.toFixed(3);
  document.getElementById("sum-del-n").textContent = sumN?.toFixed(3);
  document.getElementById("closingError").textContent =
    closingError?.toFixed(3);
  document.getElementById("linearAccuracy").textContent =
    Math.round(linearAccuracy);
}