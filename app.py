import os
import numpy as np

# from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session, jsonify
from flask_session import Session
from tempfile import mkdtemp
from werkzeug.security import check_password_hash, generate_password_hash
from random import randrange

from helpers import apology, login_required
from sql import SQL

# Configure application
app = Flask(__name__)

# Ensure templates are auto-reloaded
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
# app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=5)
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///contractSimulation.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    return render_template("introduction.html")


@app.route("/simulate", methods=["GET", "POST"])
@login_required
def simulate():

    if request.method == "GET":
        return render_template("simulate.html")
    elif request.method == "POST":
        pass


@app.route("/compare", methods=["GET", "POST"])
@login_required
def compare():

    checkedBoxes = {}
    if request.method == "GET":
        return render_template("compare.html")
    elif request.method == "POST":
        print(request.json)

        contracts = request.json.get("contracts")
        inputs = request.json.get("inputs")

        wsp = 0
        uop = 0
        uep = 0
        rp = 0
        salp = 0
        mean = 0
        sd = 0
        orderQty = 0
        optOrderQty = 0
        numOfIter = 0
        for input in inputs:
            if input.get("id") == "mean":
                mean = float(input.get("value"))
            elif input.get("id") == "sd":
                sd = float(input.get("value"))
            elif input.get("id") == "numOfIter":
                numOfIter = int(round(float(input.get("value"))))

        responseJson = {}
        responseJsonArr = []
        spotPrices = []
        demandArr = np.random.normal(mean, sd, numOfIter)

        for contract in contracts:
            if contract == "ltc":

                for input in inputs:
                    if input.get("id") == "rp":
                        rp = float(input.get("value"))
                    elif input.get("id") == "wsp":
                        wsp = float(input.get("value"))
                    elif input.get("id") == "salp":
                        salp = float(input.get("value"))
                    elif input.get("id") == "orderQty":
                        orderQty = int(round(float(input.get("value"))))

                responseArr = []
                i = 0
                for demand in demandArr:
                    simData = {}
                    simData["num"] = i
                    simData["actualDemand"] = round(demand, 0)
                    simData["orderQtyFulByLTC"] = min(simData["actualDemand"], orderQty)

                    if (simData["orderQtyFulByLTC"] < simData["actualDemand"]):
                        simData["lostSales"] = round(simData["actualDemand"] - simData["orderQtyFulByLTC"],  0)
                        simData["excessInv"] = 0
                        simData["salRevenue"] = 0
                    elif (orderQty > simData["actualDemand"]):
                        simData["lostSales"] = 0
                        simData["excessInv"] = round(orderQty - simData["orderQtyFulByLTC"], 0)
                        simData["salRevenue"] = round(salp * simData["excessInv"], 2)
                    else:
                        simData["lostSales"] = 0
                        simData["excessInv"] = 0
                        simData["salRevenue"] = 0

                    simData["revenue"] = round(rp*simData["orderQtyFulByLTC"], 2)
                    simData["cost"] = round((orderQty * wsp), 2)
                    simData["proOrLoss"] = round(simData["revenue"] + simData["salRevenue"] - simData["cost"], 2)
                    responseArr.append(simData)
                    i += 1

                contractHeader = {"Iteration Number": "num", "Actual Demand": "actualDemand", "Quantity fulfiled by Long Term Contract": "orderQtyFulByLTC",
                                  "Lost Sales": "lostSales", "Excess Inventory": "excessInv", "Sales Revenue": "revenue", "Salvage Revenue": "salRevenue", "Cost": "cost", "Profit/Loss": "proOrLoss"}
                responseJson = {"contractType": contract, "contractHeader": contractHeader, "contractDetails": responseArr}
                responseJsonArr.append(responseJson)

            elif (contract == "spot" or contract == "ltc-spot"):

                for input in inputs:
                    if input.get("id") == "rp":
                        rp = float(input.get("value"))

                if len(spotPrices) == 0:
                    for spotPriceNum in range(numOfIter):
                        spotPrices.append(round(max(rp*((100-randrange(10))/100), 0), 2))

                if (contract == "spot"):
                    responseArr = []
                    i = 0
                    for demand in demandArr:
                        simData = {}
                        simData["num"] = i
                        simData["actualDemand"] = round(max(demand, 0), 0)
                        simData["revenue"] = round(rp*simData["actualDemand"], 2)
                        simData["spotPrice"] = spotPrices[i]
                        simData["cost"] = round(simData["actualDemand"] * simData["spotPrice"], 2)
                        simData["proOrLoss"] = round(simData["revenue"] - simData["cost"], 2)
                        responseArr.append(simData)
                        i += 1

                    contractHeader = {"Iteration Number": "num", "Actual Demand": "actualDemand",
                                     "Spot Price": "spotPrice", "Sales Revenue": "revenue", "Cost": "cost", "Profit/Loss": "proOrLoss"}
                    responseJson = {"contractType": contract, "contractHeader": contractHeader, "contractDetails": responseArr}
                    responseJsonArr.append(responseJson)

                elif (contract == "ltc-spot"):
                    for input in inputs:
                        if input.get("id") == "wsp":
                            wsp = float(input.get("value"))
                        elif input.get("id") == "salp":
                            salp = float(input.get("value"))
                        elif input.get("id") == "orderQty":
                            orderQty = int(round(float(input.get("value"))))

                    responseArr = []
                    i = 0
                    for demand in demandArr:
                        simData = {}
                        simData["num"] = i
                        simData["actualDemand"] = round(demand, 0)
                        simData["orderQtyFulByLTC"] = min(simData["actualDemand"], orderQty)

                        if (simData["orderQtyFulByLTC"] < simData["actualDemand"]):
                            simData["orderQtyFulBySpot"] = round(simData["actualDemand"] - simData["orderQtyFulByLTC"], 0)
                            simData["excessInv"] = 0
                            simData["salRevenue"] = 0
                        elif (orderQty > simData["actualDemand"]):
                            simData["orderQtyFulBySpot"] = 0
                            simData["excessInv"] = round(orderQty - simData["orderQtyFulByLTC"], 0)
                            simData["salRevenue"] = round(salp * simData["excessInv"], 2)
                        else:
                            simData["orderQtyFulBySpot"] = 0
                            simData["excessInv"] = 0
                            simData["salRevenue"] = 0

                        simData["revenue"] = round(rp*simData["actualDemand"], 2)
                        simData["spotPrice"] = spotPrices[i]
                        simData["cost"] = round((orderQty * wsp)+(simData["orderQtyFulBySpot"] * simData["spotPrice"]), 2)
                        simData["proOrLoss"] = round(simData["revenue"] + simData["salRevenue"] - simData["cost"], 2)
                        responseArr.append(simData)
                        i += 1

                    contractHeader = {"Iteration Number": "num", "Actual Demand": "actualDemand", "Quantity fulfiled by Long Term Contract": "orderQtyFulByLTC", "Quantity fulfiled by Spot Contract": "orderQtyFulBySpot",
                                      "Spot Price": "spotPrice", "Excess Inventory": "excessInv", "Sales Revenue": "revenue", "Salvage Revenue": "salRevenue", "Cost": "cost", "Profit/Loss": "proOrLoss"}

                    responseJson = {"contractType": contract, "contractHeader": contractHeader, "contractDetails": responseArr}
                    responseJsonArr.append(responseJson)

            elif (contract == "options" or contract == "ltc-options"):

                for input in inputs:
                    if input.get("id") == "rp":
                        rp = float(input.get("value"))
                    elif input.get("id") == "uop":
                        uop = float(input.get("value"))
                    elif input.get("id") == "uep":
                        uep = float(input.get("value"))
                    elif input.get("id") == "optOrderQty":
                        optOrderQty = int(float(input.get("value")))

                if (contract == "options"):
                    responseArr = []
                    i =  0
                    for demand in demandArr:
                        simData = {}
                        simData["num"] = i
                        simData["actualDemand"] = round(max(demand, 0), 0)
                        simData["orderQtyFulByOptions"] = min(simData["actualDemand"], optOrderQty)

                        if simData["orderQtyFulByOptions"] < simData["actualDemand"]:
                            simData["lostSales"] = simData["actualDemand"] - simData["orderQtyFulByOptions"]
                        else:
                            simData["lostSales"] = 0

                        if optOrderQty > simData["actualDemand"]:
                            simData["expiredOptions"] = optOrderQty - simData["actualDemand"]
                        else:
                            simData["expiredOptions"] = 0

                        simData["revenue"] = round(rp*simData["orderQtyFulByOptions"], 2)
                        simData["cost"] = round(optOrderQty * uop + uep * simData["orderQtyFulByOptions"], 2)
                        simData["proOrLoss"] = round(simData["revenue"] - simData["cost"], 2)
                        responseArr.append(simData)
                        i += 1

                    contractHeader = {"Iteration Number": "num", "Actual Demand": "actualDemand", "Quantity fulfiled by Options": "orderQtyFulByOptions",
                                      "Lost Sales": "lostSales", "Expired Options": "expiredOptions", "Sales Revenue": "revenue", "Cost": "cost", "Profit/Loss": "proOrLoss"}
                    responseJson = {"contractType": contract, "contractHeader": contractHeader, "contractDetails": responseArr}
                    responseJsonArr.append(responseJson)

                elif (contract == "ltc-options"):
                    for input in inputs:
                        if input.get("id") == "wsp":
                            wsp = float(input.get("value"))
                        elif input.get("id") == "salp":
                            salp = float(input.get("value"))
                        elif input.get("id") == "orderQty":
                            orderQty = int(round(float(input.get("value"))))
                        elif input.get("id") == "uop":
                            uop = float(input.get("value"))
                        elif input.get("id") == "uep":
                            uep = float(input.get("value"))
                        elif input.get("id") == "optOrderQty":
                            optOrderQty = int(float(input.get("value")))

                    responseArr = []
                    i = 0
                    for demand in demandArr:
                        simData = {}
                        simData["num"] = i
                        simData["actualDemand"] = round(demand, 0)
                        simData["orderQtyFulByLTC"] = min(simData["actualDemand"], orderQty)
                        simData["orderQtyFulByOptions"] = 0
                        simData["lostSales"] = 0
                        simData["excessInv"] = 0
                        simData["salRevenue"] = 0
                        simData["expiredOptions"] = 0

                        if (simData["orderQtyFulByLTC"] < simData["actualDemand"]):
                            simData["orderQtyFulByOptions"] = round(min(simData["actualDemand"]-orderQty, optOrderQty), 0)

                        if (simData["orderQtyFulByLTC"]+simData["orderQtyFulByOptions"]) < simData["actualDemand"]:
                            simData["lostSales"] = simData["actualDemand"] - simData["orderQtyFulByOptions"] - simData["orderQtyFulByLTC"]

                        if ((orderQty+optOrderQty) > simData["actualDemand"]):
                            if(orderQty > simData["actualDemand"]):
                                simData["excessInv"] = orderQty - simData["actualDemand"]
                                simData["expiredOptions"] = optOrderQty
                            else:
                                simData["excessInv"] = 0
                                simData["expiredOptions"] = orderQty + optOrderQty - simData["actualDemand"]

                        simData["revenue"] = round(rp*(simData["orderQtyFulByLTC"]+simData["orderQtyFulByOptions"]), 2)
                        simData["salRevenue"] = round(salp*simData["excessInv"], 2)
                        simData["cost"] = round((orderQty * wsp)+(simData["orderQtyFulByOptions"] * uep)+(optOrderQty*uop), 2)
                        simData["proOrLoss"] = round(simData["revenue"] + simData["salRevenue"] - simData["cost"], 2)
                        responseArr.append(simData)
                        i += 1

                    contractHeader = {"Iteration Number": "num", "Actual Demand": "actualDemand", "Quantity fulfiled by Long Term Contract": "orderQtyFulByLTC", "Quantity fulfiled by Options Contract": "orderQtyFulByOptions",
                                      "Lost Sales": "lostSales", "Excess Inventory": "excessInv", "Expired Options": "expiredOptions", "Sales Revenue": "revenue", "Salvage Revenue": "salRevenue", "Cost": "cost", "Profit/Loss": "proOrLoss"}
                    responseJson = {"contractType": contract, "contractHeader": contractHeader, "contractDetails": responseArr}
                    responseJsonArr.append(responseJson)

        return jsonify(responseJsonArr)


@app.route("/apology", methods=["POST"])
@login_required
def apology():
    return apology(request.json, 500)


@app.route("/login", methods=["GET", "POST"])
def login():

    session.clear()

    if request.method == "POST":

        if not request.form.get("username"):
            return apology("must provide username", 403)

        elif not request.form.get("password"):
            return apology("must provide password", 403)

        rows = db.execute("SELECT USER_ID,HASH FROM USERS WHERE USERNAME = ?", request.form.get("username"))

        if len(rows) != 1 or not check_password_hash(rows[0]["HASH"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        session["user_id"] = rows[0]["USER_ID"]

        flash("Login Successful")
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():

    session.clear()

    return redirect("/")


@app.route("/register", methods=["GET", "POST"])
def register():
    if (request.method == "POST"):
        username = request.form.get("username")
        password = request.form.get("password")
        confirmPassword = request.form.get("confirmation")

        if not username:
            return apology("Please enter the username")
        elif not password:
            return apology("Please enter the password")
        elif not confirmPassword:
            return apology("Please enter the Confirm Password")
        elif (password != confirmPassword):
            return apology("Password and Confirm Password does not match")

        userPresent = db.execute("SELECT * FROM USERS WHERE USERNAME = ?", username)

        if userPresent:
            return apology("Username already exists")

        hashed_password = generate_password_hash(password)

        try:
            db.execute("INSERT INTO USERS (USERNAME, HASH, USER_TYPE) VALUES(?,?,?)", username, hashed_password, "User")
            flash("Registration Successful. Please login to proceed.")
            return redirect("/")
        except:
            return apology("Something went wrong !!")
    else:
        return render_template("register.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)