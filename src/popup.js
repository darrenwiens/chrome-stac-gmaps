btnEl = document.getElementById("queryBtn")
btnEl.addEventListener("click", query);

let imgsEl = document.getElementById("imgs")
let colSelect = document.getElementById('collections-select');
let colSelectInstance;
var dateSlider = document.getElementById('date-slider');

let supportedCollections = [
    'landsat-c2-l2'
]

document.addEventListener('DOMContentLoaded', function () {
    var colSelect = document.getElementById('collections-select');

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
    };

    fetch("https://planetarycomputer.microsoft.com/api/stac/v1/collections", requestOptions)
        .then(response => response.text())
        .then(result => {
            JSON.parse(result).collections.forEach((collection) => {
                let opt = document.createElement('option');
                opt.value = collection.id;
                opt.innerHTML = collection.title;

                if (supportedCollections.includes(collection.id)) {
                    colSelect.appendChild(opt);
                }
            })
            colSelectInstance = M.FormSelect.init(colSelect)
        })
        .catch(error => console.log('error', error));
});

function timestamp(str) {
    return new Date(str).getTime();
}

let start = '2015-06-27'
let end = '2023-01-01'

noUiSlider.create(dateSlider, {
    // Create two timestamps to define a range.
    range: {
        min: timestamp(start),
        max: timestamp(end)
    },

    // Steps of one week
    step: 7 * 24 * 60 * 60 * 1000,

    // Two more timestamps indicate the handle starting positions.
    start: [timestamp(start), timestamp(end)],

    // No decimals
    format: wNumb({
        decimals: 0
    })
});

var dateValues = [
    document.getElementById('event-start'),
    document.getElementById('event-end')
];

var formatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full'
});

dateSlider.noUiSlider.on('update', function (values, handle) {
    dateValues[handle].innerHTML = formatter.format(new Date(+values[handle]));
});

function query() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, "query", function (coords) {
            let startDate = new Date(document.getElementById('event-start').innerText)
            let endDate = new Date(document.getElementById('event-end').innerText)

            let startFormattedDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1).toString().padStart(2, "0")}-${(startDate.getDate()).toString().padStart(2, "0")}T00:00:00Z`
            let endFormattedDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1).toString().padStart(2, "0")}-${(endDate.getDate()).toString().padStart(2, "0")}T00:00:00Z`

            let tinyOffset = 0.0000001
            let bbox = [coords.lng - tinyOffset, coords.lat - tinyOffset, coords.lng + tinyOffset, coords.lat + tinyOffset]

            var myHeaders = new Headers();
            myHeaders.append("Accept", "application/dns-json");
            myHeaders.append("Content-Type", "application/json");

            var raw = JSON.stringify({
                "collections": colSelectInstance.getSelectedValues(),
                "bbox": bbox,
                "datetime": `${startFormattedDate}/${endFormattedDate}`,
                "intersects": null,
                "query": {
                    "eo:cloud_cover": {
                        "lt": 50
                    }
                }
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://planetarycomputer.microsoft.com/api/stac/v1/search", requestOptions)
                .then(response => response.text())
                .then(result => {

                    imgsEl.innerHTML = '';
                    JSON.parse(result).features.forEach((feature) => {
                        Object.entries(feature.assets).forEach(([key, asset]) => {
                            if ("roles" in asset && asset.roles.includes('overview')) {
                                let imgEl = document.createElement('img')
                                let width = parseInt(document.body.clientWidth * 0.75);
                                imgEl.src = asset.href + `&max_size=${width}`
                                imgEl.classList.add('materialboxed', 'row', 'center');
                                imgEl.setAttribute("data-caption", feature.properties.datetime)

                                let imgCompEl = document.createElement('div')
                                imgCompEl.classList.add('imgComp', 'row', 'center');
                                
                                let imgMetaEl = document.createElement('div')
                                imgMetaEl.classList.add('imgMeta');
                                let imgDateEl = document.createElement('span')
                                imgDateEl.innerText = feature.properties.datetime
                                imgDateEl.classList.add('imgSpan', 'row');
                                let imgMapLinkEl = document.createElement('a')
                                imgMapLinkEl.href = `https://planetarycomputer.microsoft.com/api/data/v1/item/map?collection=${feature.collection}&item=${feature.id}`
                                imgMapLinkEl.innerText = 'Map'
                                imgMapLinkEl.setAttribute('target', "_blank")
                                imgMapLinkEl.classList.add('imgSpan', 'row', 'left');
                                
                                imgMetaEl.append(imgDateEl)
                                imgMetaEl.append(imgMapLinkEl)
                                imgCompEl.append(imgEl)
                                imgCompEl.append(imgMetaEl)

                                imgsEl.append(imgCompEl)

                                M.Materialbox.init(imgEl);
                            }
                        })

                    });

                })
                .catch(error => console.log('error', error));
        });
    });
}