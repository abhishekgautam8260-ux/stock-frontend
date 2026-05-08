// WALLET LOAD

const user = JSON.parse(localStorage.getItem("user")) || {};

const wallet = Number(user.walletBalance || 0);

document.getElementById("walletAmount").innerText = wallet.toFixed(1);

function goToStockPage() {
  window.location.href = "stock.html";
}

function logout() {
    // 🧹 Remove token
    localStorage.removeItem("token");
    // 🔄 Redirect
    window.location.href = "/index.html";
}


function goToWallet() {
    window.location.href = "wallet.html";
}

/* GO HOME */

function goToHome() {
  window.location.href = "newindex.html";
}
