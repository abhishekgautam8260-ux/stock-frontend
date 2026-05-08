// LOAD WALLET

const user = JSON.parse(localStorage.getItem("user")) || {};

const wallet = Number(user.walletBalance || 0);

document.getElementById("walletAmount").innerText = wallet.toFixed(1);

function goToStockPage() {
  window.location.href = "stock.html";
}

/* NAVIGATION */

function goToHome() {
  window.location.href = "newindex.html";
}

function goToFO() {
  window.location.href = "fo.html";
}
