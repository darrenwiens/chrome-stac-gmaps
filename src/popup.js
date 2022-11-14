btnEl = document.getElementById("queryBtn")
btnEl.addEventListener("click", query);

let imgsEl = document.getElementById("imgs")

var dateSlider = document.getElementById('date-slider');

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
                "bbox": bbox,
                "datetime": `${startFormattedDate}/${endFormattedDate}`,
                "intersects": null,
                "query": {
                    "eo:cloud_cover": {
                        "lt": 50
                    }
                },
                "sort": [
                    {
                        "field": "eo:cloud_cover",
                        "direction": "desc"
                    }
                ]
            });

            var requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("https://earth-search.aws.element84.com/v0/search", requestOptions)
                .then(response => response.text())
                .then(result => {
                    
                    imgsEl.innerHTML = '';
                    JSON.parse(result).features.forEach((feature) => {
                        let imgEl = document.createElement('img')
                        imgEl.src = feature.assets.thumbnail.href
                        imgEl.classList.add('materialboxed', 'row', 'center');
                        imgEl.setAttribute("data-caption", feature.properties.datetime)
                        

                        let imgCompEl = document.createElement('div')
                        imgCompEl.classList.add('imgComp', 'row', 'center');
                        let imgCaptionEl = document.createElement('span')
                        imgCaptionEl.innerText = feature.properties.datetime
                        imgCaptionEl.classList.add('imgSpan', 'row', 'center');
                        imgCompEl.append(imgEl)
                        imgCompEl.append(imgCaptionEl)
                        
                        imgsEl.append(imgCompEl)

                        M.Materialbox.init(imgEl);
                    });

                })
                .catch(error => console.log('error', error));
        });
    });
}