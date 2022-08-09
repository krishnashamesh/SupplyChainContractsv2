function renderParameters() {
    var inputs = document.getElementsByName("compareCheckboxes");
    let allParameters = document.getElementsByClassName("parameters");

    for (let j = 0; j < allParameters.length; j++) {
        allParameters[j].setAttribute("hidden", true);
    }

    var checkedBoxes = [];
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked == true) {
            checkedBoxes.push(inputs[i].id)
        }
    }

    if (checkedBoxes.length > 0) {
        //document.getElementById("enterParameterText").removeAttribute("hidden");
        for (let i = 0; i < checkedBoxes.length; i++) {

            let contractSpecificElements = document.getElementsByClassName(checkedBoxes[i]);

            for (let j = 0; j < contractSpecificElements.length; j++) {
                contractSpecificElements[j].removeAttribute("hidden");
                if (contractSpecificElements[j].nodeName == "INPUT") {
                    contractSpecificElements[j].value = "";
                }
            }

        }

    }

    chartOptions = document.getElementById("chartOptions");
    while (chartOptions.firstChild) {
        chartOptions.removeChild(chartOptions.lastChild);
    }

    chartContainer = document.getElementById("chartContainer");
    while (chartContainer.firstChild) {
        chartContainer.removeChild(chartContainer.lastChild);
    }
};


function runCompareSimulation() {

    var inputs = document.getElementsByName("compareCheckboxes");
    var checkedBoxes = [];
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].checked == true) {
            checkedBoxes.push(inputs[i].id)
        }
    }

    var contractInputs = []
    if (checkedBoxes.length > 0) {
        for (let i = 0; i < checkedBoxes.length; i++) {
            let contractSpecificElements = document.getElementsByClassName(checkedBoxes[i]);
            for (let j = 0; j < contractSpecificElements.length; j++) {
                if (contractSpecificElements[j].nodeName == "INPUT") {
                    if (contractSpecificElements[j].value == "") {
                        alert(contractSpecificElements[j].placeholder + " is empty. Please enter the parameter.");
                        return;
                    } else {
                        let id = contractSpecificElements[j].id;
                        contractInputs.push({
                            id: id,
                            value: (contractSpecificElements[j].value)
                        });
                    }
                }
            }
        }
    }


    let responseJSON = postJSON("/compare", JSON.stringify({
        "contracts": checkedBoxes,
        "inputs": contractInputs
    }));

};


function renderChartsForContracts(data) {

    let actualDemandChartDataTemplate = {
        type: "line",
        name: "Actual Demand",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let lostSalesChartDataTemplate = {
        type: "line",
        name: "Lost Sales",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let excessInvChartDataTemplate = {
        type: "line",
        name: "Excess Inventory",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let expiredOptionsChartDataTemplate = {
        type: "line",
        name: "Expired Options",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let orderQtyFulByLTCChartDataTemplate = {
        type: "line",
        name: "Quantity fulfiled by LT",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let orderQtyFulBySpotChartDataTemplate = {
        type: "line",
        name: "Quantity fulfiled by Spot",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let orderQtyFulByOptionsChartDataTemplate = {
        type: "line",
        name: "Quantity fulfiled by Options",
        showInLegend: true,
        visible: true,
        dataPoints: []
    };

    let costChartDataTemplate = {
        type: "line",
        axisYType: "secondary",
        name: "Cost",
        showInLegend: true,
        visible: true,
        axisYIndex: 1,
        dataPoints: []
    };

    let proOrLossChartDataTemplate = {
        type: "line",
        axisYType: "secondary",
        name: "Profit/Loss",
        showInLegend: true,
        visible: true,
        axisYIndex: 1,
        dataPoints: []
    };

    let revenueChartDataTemplate = {
        type: "line",
        axisYType: "secondary",
        name: "Sales Revenue",
        showInLegend: true,
        visible: true,
        axisYIndex: 1,
        dataPoints: []
    };

    let salRevenueChartDataTemplate = {
        type: "line",
        axisYType: "secondary",
        name: "Salvage Revenue",
        showInLegend: true,
        visible: true,
        axisYIndex: 1,
        dataPoints: []
    };

    let spotPriceChartDataTemplate = {
        type: "line",
        axisYType: "secondary",
        name: "Spot Price",
        showInLegend: true,
        visible: true,
        axisYIndex: 1,
        dataPoints: []
    };

    contractChartData = [];
    for (i = 0; i < data.length; i++) {

        contract = data[i];
        contractType = "";
        contractHead = contract.contractHeader;
        contractDetails = contract.contractDetails


        spotPriceChartData = {};
        excessInvChartData = {};
        expiredOptionsChartData = {};
        orderQtyFulByLTCChartData = {};
        orderQtyFulBySpotChartData = {};
        orderQtyFulByOptionsChartData = {};
        salRevenueChartData = {};


        actualDemandChartData = JSON.parse(JSON.stringify(actualDemandChartDataTemplate))
        costChartData = JSON.parse(JSON.stringify(costChartDataTemplate));
        proOrLossChartData = JSON.parse(JSON.stringify(proOrLossChartDataTemplate));
        revenueChartData = JSON.parse(JSON.stringify(revenueChartDataTemplate));

        switch (contract.contractType) {
            case "spot":
                contractType = "Spot";
                spotPriceChartData = JSON.parse(JSON.stringify(spotPriceChartDataTemplate));

                spotPriceChartData.name = spotPriceChartData.name + " (Spot) ";
                actualDemandChartData.name = actualDemandChartData.name + " (Spot) ";
                costChartData.name = costChartData.name + " (Spot) ";
                proOrLossChartData.name = proOrLossChartData.name + " (Spot) ";
                revenueChartData.name = revenueChartData.name + " (Spot) ";

                break;

            case "ltc-spot":
                contractType = "Long Term with Spot";
                spotPriceChartData = JSON.parse(JSON.stringify(spotPriceChartDataTemplate));
                excessInvChartData = JSON.parse(JSON.stringify(excessInvChartDataTemplate));
                orderQtyFulByLTCChartData = JSON.parse(JSON.stringify(orderQtyFulByLTCChartDataTemplate));
                orderQtyFulBySpotChartData = JSON.parse(JSON.stringify(orderQtyFulBySpotChartDataTemplate));
                salRevenueChartData = JSON.parse(JSON.stringify(salRevenueChartDataTemplate));

                spotPriceChartData.name = spotPriceChartData.name + " (LTC with Spot) ";
                actualDemandChartData.name = actualDemandChartData.name + " (LTC with Spot) ";
                costChartData.name = costChartData.name + " (LTC with Spot) ";
                proOrLossChartData.name = proOrLossChartData.name + " (LTC with Spot) ";
                revenueChartData.name = revenueChartData.name + " (LTC with Spot) ";
                excessInvChartData.name = excessInvChartData.name + " (LTC with Spot) ";
                orderQtyFulByLTCChartData.name = orderQtyFulByLTCChartData.name + " (LTC with Spot) ";
                orderQtyFulBySpotChartData.name = orderQtyFulBySpotChartData.name + " (LTC with Spot) ";
                salRevenueChartData.name = salRevenueChartData.name + " (LTC with Spot) ";

                break;

            case "ltc":
                contractType = "Long Term";
                lostSalesChartData = JSON.parse(JSON.stringify(lostSalesChartDataTemplate));
                excessInvChartData = JSON.parse(JSON.stringify(excessInvChartDataTemplate));
                orderQtyFulByLTCChartData = JSON.parse(JSON.stringify(orderQtyFulByLTCChartDataTemplate));
                salRevenueChartData = JSON.parse(JSON.stringify(salRevenueChartDataTemplate));

                lostSalesChartData.name = lostSalesChartData.name + " (LTC) ";
                actualDemandChartData.name = actualDemandChartData.name + " (LTC) ";
                costChartData.name = costChartData.name + " (LTC) ";
                proOrLossChartData.name = proOrLossChartData.name + " (LTC) ";
                revenueChartData.name = revenueChartData.name + " (LTC) ";
                excessInvChartData.name = excessInvChartData.name + " (LTC) ";
                orderQtyFulByLTCChartData.name = orderQtyFulByLTCChartData.name + " (LTC) ";
                salRevenueChartData.name = salRevenueChartData.name + " (LTC) ";

                break;

            case "options":
                contractType = "Options";
                lostSalesChartData = JSON.parse(JSON.stringify(lostSalesChartDataTemplate));
                expiredOptionsChartData = JSON.parse(JSON.stringify(expiredOptionsChartDataTemplate));
                orderQtyFulByOptionsChartData = JSON.parse(JSON.stringify(orderQtyFulByOptionsChartDataTemplate));

                lostSalesChartData.name = lostSalesChartData.name + " (Options) ";
                actualDemandChartData.name = actualDemandChartData.name + " (Options) ";
                costChartData.name = costChartData.name + " (Options) ";
                proOrLossChartData.name = proOrLossChartData.name + " (Options) ";
                revenueChartData.name = revenueChartData.name + " (Options) ";
                expiredOptionsChartData.name = expiredOptionsChartData.name + " (Options) ";
                orderQtyFulByOptionsChartData.name = orderQtyFulByOptionsChartData.name + " (Options) ";

                break;

            case "ltc-options":
                contractType = "Long Term with Options";
                expiredOptionsChartData = JSON.parse(JSON.stringify(expiredOptionsChartDataTemplate));
                excessInvChartData = JSON.parse(JSON.stringify(excessInvChartDataTemplate));
                orderQtyFulByLTCChartData = JSON.parse(JSON.stringify(orderQtyFulByLTCChartDataTemplate));
                orderQtyFulByOptionsChartData = JSON.parse(JSON.stringify(orderQtyFulByOptionsChartDataTemplate));
                salRevenueChartData = JSON.parse(JSON.stringify(salRevenueChartDataTemplate));
                lostSalesChartData = JSON.parse(JSON.stringify(lostSalesChartDataTemplate));

                expiredOptionsChartData.name = expiredOptionsChartData.name + " (LTC with Options) ";
                actualDemandChartData.name = actualDemandChartData.name + " (LTC with Options) ";
                costChartData.name = costChartData.name + " (LTC with Options) ";
                proOrLossChartData.name = proOrLossChartData.name + " (LTC with Options) ";
                revenueChartData.name = revenueChartData.name + " (LTC with Options) ";
                excessInvChartData.name = excessInvChartData.name + " (LTC with Options) ";
                orderQtyFulByLTCChartData.name = orderQtyFulByLTCChartData.name + " (LTC with Options) ";
                orderQtyFulByOptionsChartData.name = orderQtyFulByOptionsChartData.name + " (LTC with Options) ";
                salRevenueChartData.name = salRevenueChartData.name + " (LTC with Options) ";
                lostSalesChartData.name = lostSalesChartData.name + " (LTC with Options) ";

                break;

        }

        actualDemandDataPointArr = [];
        costDataPointArr = [];
        proOrLossDataPointArr = [];
        revenueDataPointArr = [];
        spotPriceDataPointArr = [];
        excessInvDataPointArr = [];
        salRevenueDataPointArr = [];
        orderQtyFulByLTCDataPointArr = [];
        orderQtyFulBySpotDataPointArr = [];
        orderQtyFulByOptionsDataPointArr = [];
        lostSalesDataPointArr = [];
        expiredOptionsDataPointArr = []



        for (k = 1; k <= contractDetails.length; k++) {
            contractDataPoint = contractDetails[k - 1];

            for (key in contractDataPoint) {
                if (key == "actualDemand") {
                    actualDemandDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    actualDemandDataPointArr.push(actualDemandDataPoint);
                } else if (key == "revenue") {
                    revenueDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    revenueDataPointArr.push(revenueDataPoint);
                } else if (key == "cost") {
                    costDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    costDataPointArr.push(costDataPoint);
                } else if (key == "proOrLoss") {
                    proOrLossDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    proOrLossDataPointArr.push(proOrLossDataPoint);
                } else if (key == "spotPrice") {
                    spotPriceDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    spotPriceDataPointArr.push(spotPriceDataPoint);
                } else if (key == "excessInv") {
                    excessInvDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    excessInvDataPointArr.push(excessInvDataPoint);
                } else if (key == "orderQtyFulByLTC") {
                    orderQtyFulByLTCDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    orderQtyFulByLTCDataPointArr.push(orderQtyFulByLTCDataPoint);
                } else if (key == "orderQtyFulBySpot") {
                    orderQtyFulBySpotDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    orderQtyFulBySpotDataPointArr.push(orderQtyFulBySpotDataPoint);
                } else if (key == "orderQtyFulByOptions") {
                    orderQtyFulByOptionsDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    orderQtyFulByOptionsDataPointArr.push(orderQtyFulByOptionsDataPoint);
                } else if (key == "salRevenue") {
                    salRevenueDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    salRevenueDataPointArr.push(salRevenueDataPoint);
                } else if (key == "lostSales") {
                    lostSalesDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    lostSalesDataPointArr.push(lostSalesDataPoint);
                } else if (key == "expiredOptions") {
                    expiredOptionsDataPoint = {
                        x: k,
                        y: contractDataPoint[key]
                    };
                    expiredOptionsDataPointArr.push(expiredOptionsDataPoint);
                }



            }

        }

        actualDemandChartData.dataPoints = actualDemandDataPointArr;
        costChartData.dataPoints = costDataPointArr;
        revenueChartData.dataPoints = revenueDataPointArr;
        proOrLossChartData.dataPoints = proOrLossDataPointArr;

        contractChartData.push(actualDemandChartData);
        contractChartData.push(costChartData);
        contractChartData.push(revenueChartData);
        contractChartData.push(proOrLossChartData);

        switch (contract.contractType) {
            case "spot":
                spotPriceChartData.dataPoints = spotPriceDataPointArr;
                contractChartData.push(spotPriceChartData);
                break;

            case "ltc-spot":

                spotPriceChartData.dataPoints = spotPriceDataPointArr;
                excessInvChartData.dataPoints = excessInvDataPointArr;
                orderQtyFulByLTCChartData.dataPoints = orderQtyFulByLTCDataPointArr;
                orderQtyFulBySpotChartData.dataPoints = orderQtyFulBySpotDataPointArr;
                salRevenueChartData.dataPoints = salRevenueDataPointArr;

                contractChartData.push(spotPriceChartData);
                contractChartData.push(excessInvChartData);
                contractChartData.push(orderQtyFulByLTCChartData);
                contractChartData.push(orderQtyFulBySpotChartData);
                contractChartData.push(salRevenueChartData);

                break;

            case "ltc":

                lostSalesChartData.dataPoints = lostSalesDataPointArr;
                excessInvChartData.dataPoints = excessInvDataPointArr;
                orderQtyFulByLTCChartData.dataPoints = orderQtyFulByLTCDataPointArr;
                salRevenueChartData.dataPoints = salRevenueDataPointArr;

                contractChartData.push(lostSalesChartData);
                contractChartData.push(excessInvChartData);
                contractChartData.push(orderQtyFulByLTCChartData);
                contractChartData.push(salRevenueChartData);

                break;

            case "options":

                lostSalesChartData.dataPoints = lostSalesDataPointArr;
                expiredOptionsChartData.dataPoints = expiredOptionsDataPointArr;
                orderQtyFulByOptionsChartData.dataPoints = orderQtyFulByOptionsDataPointArr;

                contractChartData.push(lostSalesChartData);
                contractChartData.push(expiredOptionsChartData);
                contractChartData.push(orderQtyFulByOptionsChartData);

                break;

            case "ltc-options":

                expiredOptionsChartData.dataPoints = expiredOptionsDataPointArr;
                excessInvChartData.dataPoints = excessInvDataPointArr;
                orderQtyFulByLTCChartData.dataPoints = orderQtyFulByLTCDataPointArr;
                orderQtyFulByOptionsChartData.dataPoints = orderQtyFulByOptionsDataPointArr;
                salRevenueChartData.dataPoints = salRevenueDataPointArr;
                lostSalesChartData.dataPoints = lostSalesDataPointArr;

                contractChartData.push(expiredOptionsChartData);
                contractChartData.push(excessInvChartData);
                contractChartData.push(orderQtyFulByLTCChartData);
                contractChartData.push(orderQtyFulByOptionsChartData);
                contractChartData.push(salRevenueChartData);
                contractChartData.push(lostSalesChartData);

                break;



        }
    }

    chartContainer = {
        title: {
            text: "Simulation Result"
        },
        axisX: {
            title: "Iteration Number",
            interval: 1
        },
        axisY: {
            title: "Quantity"
        },
        axisY2: {
            title: "Monies",
            prefix: "$"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            verticalAlign: "bottom",
            horizontalAlign: "center",
            dockInsidePlotArea: false,
            itemclick: toogleDataSeries
        },
        data: contractChartData
    };

    localStorage.setItem('chartData', JSON.stringify(chartContainer));

    renderCheckBoxes(chartContainer);

    var chart = new CanvasJS.Chart("chartContainer", chartContainer);

    chart.render();

};

function renderCheckBoxes(chartContainer) {

    tableArea = document.getElementById("chartOptions");
    while (tableArea.firstChild) {
        tableArea.removeChild(tableArea.lastChild);
    }

    dataArr = chartContainer.data;

    emText = document.createElement("em");
    emText.textContent = "Toggle the checkboxes to add/remove the line in the graph.";

    tableArea.appendChild(emText);
    outerCoverDiv = document.createElement("DIV");
    outerCoverDiv.className += " mb-3";
    tableArea.appendChild(outerCoverDiv);


    for (j = 0; j < dataArr.length; j++) {

        dataItem = dataArr[j];

        coverDiv = document.createElement("DIV");
        coverDiv.className += " form-check form-check-inline";

        checkBox = document.createElement("INPUT");
        checkBox.type = "checkbox"
        checkBox.checked = true;
        checkBox.name = dataItem.name;
        checkBox.className += "resultParameter form-check-input";

        checkBox.addEventListener('change', (event) => {
            reRenderChart(event.currentTarget);
        });


        label = document.createElement("LABEL");
        label.textContent = dataItem.name;
        label.className += " form-check-label"

        coverDiv.appendChild(checkBox);
        coverDiv.appendChild(label);

        tableArea.appendChild(coverDiv);
    }

    coverDiv = document.createElement("DIV");
    coverDiv.className += " form-check form-check-inline";

    checkBox = document.createElement("INPUT");
    checkBox.type = "checkbox"
    checkBox.checked = true;
    checkBox.name = "all";
    checkBox.className += " form-check-input";

    checkBox.addEventListener('change', (event) => {
        reRenderChartWithToggle(event.currentTarget);
        toggleCheckBoxes();
    });


    label = document.createElement("LABEL");
    label.textContent = "Toggle All";
    label.className += " form-check-label"
    label.style.fontWeight = "bold"

    coverDiv.appendChild(checkBox);
    coverDiv.appendChild(label);

    tableArea.appendChild(coverDiv);


};

function toggleCheckBoxes() {

    var checkBoxesInputs = document.getElementsByClassName("resultParameter");

    for (i = 0; i < checkBoxesInputs.length; i++) {
        checkBoxesInputs[i].checked = !checkBoxesInputs[i].checked;
    }

};

function reRenderChart(checkBox) {

    name = checkBox.name;

    var retrievedObject = JSON.parse(localStorage.getItem("chartData"));

    for (i = 0; i < retrievedObject.data.length; i++) {
        if (name == retrievedObject.data[i].name) {
            retrievedObject.data[i].visible = checkBox.checked;
        }
    }

    localStorage.setItem('chartData', JSON.stringify(retrievedObject));
    var chart = new CanvasJS.Chart("chartContainer", retrievedObject);
    chart.render();
}

function reRenderChartWithToggle(checkBox) {

    var retrievedObject = JSON.parse(localStorage.getItem("chartData"));

    for (i = 0; i < retrievedObject.data.length; i++) {
        retrievedObject.data[i].visible = !retrievedObject.data[i].visible;
    }

    localStorage.setItem('chartData', JSON.stringify(retrievedObject));
    var chart = new CanvasJS.Chart("chartContainer", retrievedObject);
    chart.render();
}


function toogleDataSeries(e) {
    if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
    } else {
        e.dataSeries.visible = true;
    }
    chart.render();
};



function postJSON(url, data) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let responseJson = JSON.parse(this.responseText);
            //console.log(responseJson);
            renderChartsForContracts(responseJson);
            return responseJson;
        }
    };
    xhr.send(data);
};

function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true;
};