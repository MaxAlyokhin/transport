let map // Здесь храним карту
let duration = 1 // Скорость анимации маркеров

// Метод рисует карту
export function mapInit() {
    // Создаём карту
    map = L.map('map', {
        zoomControl: false,
        center: [45.028379, 38.971788],
        zoom: 15
    }) // Привязываем элемент #map к картам, отключаем лишний интерфейс

    // Подгружаем тайлы
    let stamenToner = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', { detectRetina: true })
    stamenToner.addTo(map)

    // Добавляем копирайты
    map.attributionControl.addAttribution('&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about/" target="_blank">OpenStreetMap contributors</a>')

    // Проверка на Firefox (он не поддерживает backdrop-filter)
    if ('navigator' in window && navigator.userAgent.indexOf('Firefox') !== -1) {
        document.querySelector('.panel').style.background = '#ffffffed'
        document.querySelector('.locate').style.background = '#ffffffed'
        document.querySelector('.info').style.background = '#ffffffed'
    }

    // Кнопка обнаружения геолокации
    let isLocate = 0 // Маркер отслеживания геопозиции
    document.querySelector('.locate').addEventListener('click', () => {
        if (!isLocate) {
            map.locate({ setView: true, watch: true })
            document.querySelector('.locate img').style.transform = 'scale(0.8)'
            isLocate = 1
        } else {
            map.stopLocate()
            document.querySelector('.locate img').style.transform = 'scale(1)'
            isLocate = 0
        }
    })

    let isAnimate = false
    const animateElement = document.querySelector('.animate')
    const mapElement = document.querySelector('#map')

    animateElement.addEventListener('click', function() {
        if (!isAnimate) {
            duration = 10000
            isAnimate = true

            this.querySelector('.icon').textContent = 'Анимация движения: on'
            mapElement.classList.add('animation')
        } else {
            duration = 1
            isAnimate = false

            this.querySelector('.icon').textContent = 'Анимация движения: off'
            mapElement.classList.remove('animation')
        }
    })

    // Переменные для фокуса на карте, чтобы все маркеры были видны
    // let maxLatitude
    // let minLatitude
    // let maxLongitude
    // let minLongitude

    // Создаём прямоугольник с координатами двух точек и масштабируем так, чтобы обе были видны
    // В связи с тем, что иногда салоны перегоняют в Москву, лучше сделать фиксированный масштаб

    // Хотя в идеале карта должна масштабироваться динамически вот так:
    // maxLatitude = Math.max(...dataArrays.latitude)
    // minLatitude = Math.min(...dataArrays.latitude)
    // maxLongitude = Math.max(...dataArrays.longitude)
    // minLongitude = Math.min(...dataArrays.longitude)

    // let bounds = L.latLngBounds([
    //   [maxLatitude - 0.008, minLongitude + 0.008],
    //   [minLatitude - 0.008, maxLongitude + 0.008],
    // ])

    // maxLatitude = 45.141714
    // minLatitude = 44.975828
    // maxLongitude = 38.79086
    // minLongitude = 39.228815

    // let bounds = L.latLngBounds([
    //     [maxLatitude, minLongitude],
    //     [minLatitude, maxLongitude],
    // ])
    // map.fitBounds(bounds) // Масштабируем
}

let firstCallOfFunction = false // Маркер первого вызова функции
const transportMarkerMap = new Map()

// Метод расставляет маркеры движущегося транспорта
export function reloadMarkers(dataMap) {

    // Один раз рисуем маркеры, далее их двигаем
    if (!firstCallOfFunction) {

        for (let key of dataMap.keys()) {
            const transport = dataMap.get(key)

            let typeOfTransport = ``
            if (transport.typeOfTransport === '1') {
                typeOfTransport = `red`
            }
            if (transport.typeOfTransport === '2') {
                typeOfTransport = `green`
            }
            if (transport.typeOfTransport === '3') {
                typeOfTransport = `blue`
            }

            transportMarkerMap.set(key,
                new L.Marker([transport.latitude, transport.longitude], {
                    icon: new L.DivIcon({
                        html: `
                            <div class="marker ${typeOfTransport}">
                                <span class="routeNumberOnMarker">${transport.route}</span>
                                <span class="azimuthOnMarker" style="transform: rotate(${transport.azimuth}deg); ${transport.azimuth === 0 ? 'display: none;' : ''}"></span>
                            </div>
                        `,
                    }),
                })
            )
        }

        transportMarkerMap.forEach((marker) => map.addLayer(marker)) // Добавляем маркеры на карту
        firstCallOfFunction = true
    }

    if (firstCallOfFunction) {
        for (let key of dataMap.keys()) {
            const transport = dataMap.get(key)
            if (transportMarkerMap.get(key)) {
                // Если пришла слишком большая разница в координатах, то чтобы анимация не поломалась
                // сразу ставим маркер в новое место
                if (Math.abs(transport.latitude - transportMarkerMap.get(key)._latlng.lat) >= 0.02) {
                    transportMarkerMap.get(key).slideTo([transport.latitude, transport.longitude], { duration: 1 })
                } else {
                    transportMarkerMap.get(key).slideTo([transport.latitude, transport.longitude], { duration: duration })
                }
            }
        }
    }
}
