let userLongitude = null
let userLatitude = null

function setError(inputId, message) {
    const input = document.getElementById(inputId)
    input.classList.add("input-error")

    let error = document.getElementById(inputId + "-error")

    if (!error) {
        error = document.createElement("div")
        error.id = inputId + "-error"
        error.className = "error-text"
        input.parentNode.insertBefore(error, input.nextSibling)
    }

    error.innerText = message
}

function clearErrors() {
    document.querySelectorAll(".input-error").forEach(el => {
        el.classList.remove("input-error")
    })

    document.querySelectorAll(".error-text").forEach(el => {
        el.remove()
    })
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
        userLatitude = position.coords.latitude
        userLongitude = position.coords.longitude
        document.getElementById("message").innerText = "Location captured"
    })
}

async function register() {

    clearErrors()

    const name = document.getElementById("name").value.trim()
    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()
    const phone = document.getElementById("phone").value.trim()
    const role = document.getElementById("role").value

    let isValid = true

    if (!name) {
        setError("name", "Name is required")
        isValid = false
    }

    if (!email || !validateEmail(email)) {
        setError("email", "Valid email required")
        isValid = false
    }

    if (!password || password.length < 6) {
        setError("password", "Password must be at least 6 characters")
        isValid = false
    }

    if (!phone) {
        setError("phone", "Phone number required")
        isValid = false
    }

    if (!userLatitude || !userLongitude) {
        document.getElementById("message").innerText =
            "Please capture your location"
        isValid = false
    }

    if (!isValid) return

    const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name,
            email,
            password,
            phone,
            role,
            location: {
                type: "Point",
                coordinates: [userLongitude, userLatitude]
            }
        })
    })

    const data = await response.json()
    document.getElementById("message").innerText = data.message

    if (response.status === 201) {
        setTimeout(() => {
            window.location.href = "login.html"
        }, 1000)
    }
}

async function login() {

    clearErrors()

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value.trim()

    let isValid = true

    if (!email || !validateEmail(email)) {
        setError("email", "Valid email required")
        isValid = false
    }

    if (!password) {
        setError("password", "Password required")
        isValid = false
    }

    if (!isValid) return

    const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password
        })
    })

    const data = await response.json()

    if (response.status !== 200) {
        document.getElementById("message").innerText = data.message
        return
    }

    localStorage.setItem("token", data.token)
    localStorage.setItem("role", data.role)

    if (data.role === "donor") {
        window.location.href = "donor-dashboard.html"
    } else if (data.role === "ngo") {
        window.location.href = "ngo-dashboard.html"
    } else {
        window.location.href = "beneficiary-dashboard.html"
    }
}