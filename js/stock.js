const stockData = JSON.parse(localStorage.getItem("selectedStock"));
const startPrice = stockData ? Number(stockData.price) : 100;
const API = "https://efficient-simplicity-production-0081.up.railway.app";

let prices = [];
let current = startPrice;
let lastBuyAmount = null;

/* ================= USER LOAD ================= */

async function refreshUser() {

    const token = localStorage.getItem("token");

    const res = await fetch(API+"/api/user", {
        headers: { "Authorization": "Bearer " + token }
    });

    const user = await res.json();
    localStorage.setItem("user", JSON.stringify(user));

    const profile = document.querySelector(".profile");
    if (profile && user.name)
        profile.innerText = user.name.charAt(0).toUpperCase();

    const walletEl = document.getElementById("walletAmount");
    if (walletEl)
        walletEl.innerText = user.walletBalance ?? 0;

    return user;
}

refreshUser();

/* ================= INITIAL GRAPH DATA ================= */

for (let i = 0; i < 120; i++) {
    const volatility = current * 0.01;
    const trend = Math.sin(i / 15) * volatility;
    current += trend + (Math.random() - 0.5) * volatility;
    if (current < 1) current = 1;
    prices.push(current);
}

/* ================= STOCK UI ================= */

if (stockData) {
    document.querySelector(".stock-header h2").innerText = stockData.name;
    document.getElementById("stockPrice").innerText = "₹ " + startPrice;
    document.querySelector(".trade-card h3").innerText = stockData.name;
}

/* ================= CANVAS ================= */

const canvas = document.getElementById("stockChart");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 400;

/* ================= CONFIG ================= */

const CONFIG = {
    maxPoints: 180,
    xGap: 5,
    minPrice: 15,
    updateSpeed: 800
};

/* ================= STATE ================= */

let buyMarkers = [];
let mode = "BUY";
let holdingsQty = 0;

/* ================= DOM ================= */

const priceEl = document.getElementById("stockPrice");
const qtyInput = document.getElementById("qtyInput");
const reqText = document.getElementById("reqText");
const balanceText = document.getElementById("balanceText");
const tradeBtn = document.getElementById("tradeBtn");

/* ================= PRICE ================= */

function getCurrentPrice() {
    return prices[prices.length - 1];
}

/* ================= DRAW GRAPH ================= */

function drawGraph() {

    if (prices.length < 2) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const range = max - min || 1;

    /* GRID */
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;

    for (let i = 0; i < 5; i++) {
        let y = (canvas.height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    /* LABELS */
    ctx.fillStyle = "#888";
    ctx.font = "12px Arial";

    for (let i = 0; i <= 4; i++) {
        const value = min + (range / 4) * i;
        const y = canvas.height - (canvas.height / 4) * i;
        ctx.fillText(value.toFixed(2), canvas.width - 50, y);
    }

    /* LINE */
    ctx.beginPath();
    ctx.strokeStyle = "#00b386";
    ctx.lineWidth = 2;

    const startIndex = Math.max(0, prices.length - CONFIG.maxPoints);
    const visible = prices.slice(startIndex);

    visible.forEach((price, i) => {

        const offset =
            Math.max(0,
                prices.length * CONFIG.xGap - canvas.width
            );

        const x = i * CONFIG.xGap - offset;
        const y = canvas.height - ((price - min) / range) * canvas.height;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();

    /* BUY LINES */
    buyMarkers.forEach(marker => {

        const y =
            canvas.height -
            ((marker.price - min) / range) * canvas.height;

        ctx.strokeStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        ctx.fillStyle = "#000";
        ctx.fillText("BUY ₹" + marker.price.toFixed(2), 10, y - 5);
    });
}

/* ================= LIVE RANDOM GRAPH ================= */

setInterval(() => {

    const last = prices.length ? prices[prices.length - 1] : startPrice;

    const volatility = last * 0.003;
    const trend = Math.sin(Date.now()/5000) * volatility;

    const newPrice =
        last + trend + (Math.random()-0.5)*volatility;

    prices.push(newPrice);

    if (prices.length > CONFIG.maxPoints)
        prices.shift();

    priceEl.innerText = "₹ " + newPrice.toFixed(2);

    updateApprox();
    drawGraph();

}, CONFIG.updateSpeed);

/* ================= APPROX ================= */

function updateApprox() {

    const qty = Number(qtyInput.value) || 0;
    const price = getCurrentPrice();
    const total = qty * price;

    reqText.innerText = "Approx req: ₹" + total.toFixed(2);

    if (mode === "BUY") {
        balanceText.innerText =
            lastBuyAmount !== null
                ? "Bought at ₹" + lastBuyAmount.toFixed(2)
                : "Buy Amount: ₹" + total.toFixed(2);
    }
}

qtyInput.addEventListener("input", updateApprox);

/* ================= TAB SWITCH ================= */

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {

        document.querySelectorAll(".tab")
            .forEach(t => t.classList.remove("active"));

        tab.classList.add("active");
        mode = tab.innerText.trim();

        tradeBtn.innerText = mode === "BUY" ? "Buy" : "Sell";
        tradeBtn.style.background =
            mode === "BUY" ? "#00b386" : "#ff4d4f";
    });
});

/* ================= TRADE ================= */

tradeBtn.addEventListener("click", () => {
    mode === "BUY" ? executeBuy() : executeSell();
});

/* ================= BUY ================= */

async function executeBuy() {

    const qty = Number(qtyInput.value);
    if (!qty || qty <= 0) return alert("Enter qty");

    const price = getCurrentPrice();
    const total = qty * price;

    const token = localStorage.getItem("token");

    try {

        const res = await fetch(API +
            "/api/user/wallet/update",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body: JSON.stringify({ amount:-total })
            });

        const data = await res.json();

        if(!res.ok) throw new Error(data.message);

        document.getElementById("walletAmount").innerText = data.wallet;

        holdingsQty += qty;
        buyMarkers.push({ price, qty });
        lastBuyAmount = total;

    } catch(e){
        alert("Buy failed");
    }
}

/* ================= SELL ================= */

async function executeSell(){

    const qty = Number(qtyInput.value);
    if(!qty || qty<=0) return alert("Enter valid Qty");
    if(qty>holdingsQty) return alert("Not enough shares");

    const sellPrice = getCurrentPrice();
    const totalSellValue = qty * sellPrice;
    const token = localStorage.getItem("token");

    try{

        const res = await fetch(API +
            "/api/user/wallet/update",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:`Bearer ${token}`
                },
                body: JSON.stringify({ amount: totalSellValue })
            });

        const data = await res.json();
        if(!res.ok) throw new Error();

        document.getElementById("walletAmount").innerText = data.wallet;
        holdingsQty -= qty;
        alert("Sold successfully ✅");

    }catch{
        alert("Sell failed");
    }

    /* remove markers */
    let remaining = qty;
    while(remaining>0 && buyMarkers.length>0){
        const last = buyMarkers[buyMarkers.length-1];
        if(last.qty<=remaining){
            remaining-=last.qty;
            buyMarkers.pop();
        }else{
            last.qty-=remaining;
            remaining=0;
        }
    }
}

/* ================= START ================= */

drawGraph();