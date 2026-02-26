const token = localStorage.getItem("token");

const API = "https://efficient-simplicity-production-0081.up.railway.app/";

document.addEventListener("DOMContentLoaded", initApp);
function initApp(){
    console.log("Initializing app...");
    loadUser();
    initStockClicks();
}

function initStockClicks(){

    console.log("Initializing stock click handlers...");
    document.querySelectorAll(".stock-box").forEach(card=>{
        card.addEventListener("click", ()=>{
            const name = card.dataset.name;
            const price = card.dataset.price;

            localStorage.setItem("selectedStock",
                JSON.stringify({ name, price })
            );

            window.location.href="stock.html";
        });
    });
}

console.log("Token:", token);

if (!token) {
    window.location.href = "login.html";
}

loadUser();

async function loadUser() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    console.log("Loading user with token:", token);

    try {
        const res = await fetch(API + "/api/user", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        console.log("Loading user with result:", res);
        if (!res.ok) throw new Error("Auth failed");

        const user = await res.json();

        localStorage.setItem("user", JSON.stringify(user));
        console.log("User loaded:", user);

        /* PROFILE LETTER */
        const profile = document.querySelector(".profile");
        if (profile && user.name) {
            profile.innerText = user.name.charAt(0).toUpperCase();
        }

        console.log("Profile element:", profile);
        /* WALLET */
        const walletEl = document.getElementById("walletAmount");
        if (walletEl) {

            console.log(walletEl);
            walletEl.innerText = user.walletBalance ?? 0;
        }
        else{
            console.warn("Wallet element not found");
        }

    } catch (err) {
        console.log("User fetch failed:", err);
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
}


setInterval(() => {
    console.log("Market data refreshing...");
}, 4000);



function goToStockPage() {
    window.location.href = "stock.html";
}

function toggleProfile() {
    document.getElementById("profilePanel")
        .classList.toggle("show");
}

// Click stock → open stock page with data
document.querySelectorAll(".stock-box").forEach(card => {
    card.addEventListener("click", () => {

        const name = card.dataset.name;
        const price = card.dataset.price;

        localStorage.setItem("selectedStock",
            JSON.stringify({ name, price })
        );

        window.location.href = "stock.html";
    });
});

function logout() {
    // 🧹 Remove token
    localStorage.removeItem("token");
    // 🔄 Redirect
    window.location.href = "/login.html";
}


function goToWallet() {
    window.location.href = "wallet.html";
}

function goToHome() {
    window.location.href = "newindex.html";
}