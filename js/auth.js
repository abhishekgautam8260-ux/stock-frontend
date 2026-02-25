const API = "https://stock-backend-production-f4d5.up.railway.app";

async function signup() {


    const name = document.getElementById("signupName").value;
    const phone = document.getElementById("signupPhone").value;
    const password = document.getElementById("signupPassword").value;


    const data = {
        name: name,
        phone: phone,
        password: password
    };

    const res = await fetch(API + "/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result));

    if (result.token) {
        window.location.href = "newindex.html";
    }
    else {
        alert("Signup failed: " + result.message)
    };

}


async function login() {

    const phone = document.getElementById("loginPhone").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            phone: phone,
            password: password
        })
    });

    const result = await res.json();

    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result));

    if (result.token) {
        window.location.href = "newindex.html";
    }
    else {
        alert("Signup failed: " + result.message)
    };

}

function showLogin() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
}

function showSignup() {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
}