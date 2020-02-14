const defaultPortals = [
    'https://siasky.net/',
    'https://sialoop.net/',
    // 'https://skynet.luxor.tech/',
    'https://skynet.tutemwesi.com/',
    'https://siacdn.com/',
    'https://vault.lightspeedhosting.com/',
    'https://skydrain.net/'
]

const enabledPortals = {}
let skylink = "";

let running = 0;
let ms = 0;
let s = 0;
let m = 0;

let interval;
let timeout = 10;

let runid;
let finished = 0;
let racing = 0;

onClickRace = (evt) => {
    runid = new Date().getTime()
    document.getElementById("race").disabled = true
    document.getElementById("reset").disabled = false

    skylink = document.getElementById("skylink").value
    skylink = stripPrefix(skylink, 'sia://')
    console.log(`Racing ${skylink}`)

    if (running) {
        alert('already running')
        return
    }
    running = true

    interval = setInterval(timer, timeout)
    for (const [portal, enabled] of Object.entries(enabledPortals)) {
        if (enabled) {
            race(portal)
        }
    }
}

onClickReset = () => {
    runid = 0
    finished = 0;
    racing = 0;
    clearInterval(interval)
    document.getElementById("skylink").value = ""
    document.getElementById("timer").innerHTML = ""
    document.getElementById("laps").innerHTML = ""
    document.getElementById("race").disabled = false
    document.getElementById("reset").disabled = true
    running = false
}

onChangePortal = (cb) => {
    console.log(cb.id)
    if (enabledPortals[cb.id]) {
        cb.checked = false
        enabledPortals[cb.id] = false
    } else {
        cb.checked = true
        enabledPortals[cb.id] = true
    }
}

race = (portal) => {
    const id = runid
    racing++
    console.log(`RAcing https://${portal}${skylink}`)
    fetch(`https://${portal}${skylink}`, {
        withCredentials: true,
        mode: 'no-cors'
    })
        .then((resp) => {
            console.log(resp)
            console.log(resp.status)
            lap(id, portal)
        })
        .catch(fail(portal))
}

lap = (id, portal) => {
    if (id != runid) {
        return // old run
    }
    finished++

    const lap = document.createElement('tr')
    lap.className = "lap"
    const pos = document.createElement('td')
    pos.className = "lap-pos"
    pos.innerHTML = `#${finished}`
    lap.appendChild(pos)
    const name = document.createElement('td')
    name.className = "lap-name"
    name.innerHTML = portal
    lap.appendChild(name)
    const ttfb = document.createElement('td')
    ttfb.className = "lap-ttfb"
    ttfb.innerHTML = time()
    lap.appendChild(ttfb)

    document.getElementById("laps").appendChild(lap)

    if (finished == racing) {
        clearInterval(interval)
    }
}

stripPrefix = (str, prefix) => {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length)
    }
    return str
}

time = () => {
    const mst = ms / timeout
    const mins = m < 10 ? `0${m}` : m
    const secs = s < 10 ? `0${s}` : s
    const msec = mst < 10 ? `0${mst}` : mst
    return `${mins}:${secs}:${msec}`
}

timer = () => {
    document.getElementById("timer").innerHTML = time();
    ms += timeout;
    if (ms == 1000) {
        s += 1;
        ms = 0;
    }
    if (s == 60) {
        m += 1;
        s = 0;
    }
}

initUI = () => {
    let html = ''
    for (const portal of defaultPortals) {
        const name = stripPrefix(portal, "https://")
        html += `
        <input type="checkbox" id="${name}" name="${name}" value="${portal}" checked onchange="onChangePortal(this)">
        <label for="${name}">${name}</label>
        <br>
        `
        enabledPortals[name] = true
    }
    document.getElementById("portals").innerHTML = html
}

window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("race").onclick = onClickRace
    document.getElementById("reset").onclick = onClickReset
    document.getElementById("reset").disabled = true
    initUI()
})