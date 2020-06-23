let initTutorials = async () => {
    window.tab2 = document.getElementById("tab2");
    document.querySelector("#tabs-swipe .hide").classList.remove("hide");
    window.tab2.classList.remove("hide");
    M.Tabs.init(document.getElementById("tabs-swipe"));
    window.tutPanel1 = M.Collapsible.init(document.getElementById("tut_panel1"), {accordion: false});
    window.tutPanel2 = M.Collapsible.init(document.getElementById("tut_panel2"));

    console.log("waiting...")
    listTutorials();  
}
let appendTutorials = (tutorials) => {
    window.tutsDiv = newEl("div")
    tutsDiv.setAttribute("id","units_wrapper");
    window.tutsDiv.appendChild(tutorials)
    document.getElementById("tuts_outline").appendChild(window.tutsDiv);
}
let makeUnits = (array) => {
    var list = newEl("ul");
    for (var i = 0; i < array.length; i++) {
        var unitdiv = newEl('li');
        unitdiv.classList.add("node");
        unitdiv.setAttribute("id", array[i].gsx$tutorialid.$t);
        var unittitle  = newEl("h6");
        unittitle.innerHTML = `<a href="#${array[i].gsx$tutorialid.$t}_section">Tutorial - ${i+1} — ${array[i].gsx$title.$t}</a>`;
        unitdiv.appendChild(unittitle);
        list.appendChild(unitdiv);
    }
    return list;
}
let listTutorials = async () => {
    fetch("https://spreadsheets.google.com/feeds/list/1fY543yk17esz7nenR2x1hmBzQHPNK96UhE1oSZcIyZo/2/public/values?alt=json")
    .then(response => response.json())
    .then(json => {
        window.tutsObj = json.feed.entry;
        appendTutorials(makeUnits(window.tutsObj));
        tutPanel1.open(2);
    })
    .catch(console.log)
}

let getTutorial = async (id) => {
    let api = "https://asia-east2-gce-dashboard-277717.cloudfunctions.net/gce-get-tut-v1?id=";
    if(typeof id == 'number'){
        fetch(api+id, {method: 'post', body: JSON.parse(window.geg_user)})
        .then(response => response.json())
        .then(console.log)
    }
}
let newEl = (tagname) => {return document.createElement(tagname)}


initTutorials();

