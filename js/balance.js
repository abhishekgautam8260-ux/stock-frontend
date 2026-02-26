const API = "https://efficient-simplicity-production-0081.up.railway.app";

async function submitDeposit(){

    const amount = Number(document.getElementById("amount").value);
    const utr = document.getElementById("utr").value;
    const file = document.getElementById("file").files[0];

    if(!amount || amount<=0) return alert("Enter valid amount");
    if(!utr) return alert("Enter UTR");
    if(!file) return alert("Upload screenshot");

    const token = localStorage.getItem("token");

    try{

        const res = await fetch(API +
            "/api/user/wallet/update",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":"Bearer "+token
                },
                body:JSON.stringify({ amount })
            });

        const data = await res.json();

        if(!res.ok) throw new Error(data.message);

        alert("Balance Added ✅");

        /* redirect to dashboard */
        window.location.href="newindex.html";

    }catch(e){
        console.error(e);
        alert("Deposit failed");
    }
}

loadWallet();

async function loadWallet(){

    const token = localStorage.getItem("token");
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
            walletEl.innerText = formatMoney(user.walletBalance ?? 0);
        }
        else{
            console.warn("Wallet element not found");
        }
    }
    catch (err) {
        console.log("User fetch failed:", err);
        localStorage.removeItem("token");
        window.location.href = "login.html";
    }
};

function formatMoney(value){
    if(value == null) return "0";

    return Number(value)
        .toFixed(1)        // keeps 1 decimal
        .replace(/\.0$/,''); // removes .0 if integer
}

async function withdrawMoney(){

    const amount = prompt("Enter amount");

    if(!amount || amount<=0) return alert("Invalid amount");

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
                body:JSON.stringify({ amount:-Number(amount) })
            });

        const data = await res.json();

        if(!res.ok) throw new Error(data.message);

        document.getElementById("balance").innerText =
            "₹ " + data.wallet;

        alert("Withdraw successful");

    }catch(e){
        console.error(e);
        alert("Withdraw failed");
    }
}

function goToHome(){
    location.href="newindex.html";
}