let map // Здесь храним карту

// Метод рисует карту
export function mapInit(dataArrays) {
  // Создаём карту
  map = L.map('map', { zoomControl: false }) // Привязываем элемент #map к картам, отключаем лишний интерфейс

  // Подгружаем тайлы
  let stamenToner = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png', { detectRetina: true })
  stamenToner.addTo(map)

  // Добавляем копирайты
  map.attributionControl.addAttribution('&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about/" target="_blank">OpenStreetMap contributors</a>')

  // Проверка на Firefox (он не поддерживает backdrop-filter)
  if ('navigator' in window && navigator.userAgent.indexOf('Firefox') != -1) {
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

  // Переменные для фокуса на карте, чтобы все маркеры были видны
  let maxLatitude
  let minLatitude
  let maxLongitude
  let minLongitude

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

  maxLatitude = 45.141714
  minLatitude = 44.975828
  maxLongitude = 38.79086
  minLongitude = 39.228815

  let bounds = L.latLngBounds([
    [maxLatitude, minLongitude],
    [minLatitude, maxLongitude],
  ])
  map.fitBounds(bounds) // Масштабируем
}

let firstCallOfFunction = false // Маркер первого вызова функции
let transportMarkerArray = [] // Массив маркеров

// Метод расставляет маркеры движущегося транспорта
export function reloadMarkers(dataArrays) {
  // Цикл удалений старых маркеров (только после второго вызова функции)
  if (firstCallOfFunction) {
    transportMarkerArray.map((marker) => map.removeLayer(marker))
    transportMarkerArray.length = 0
  }

  // Создаём новые маркеры
  // Если номер маршрута трёхзначный, то это не номер маршрута, а номер салона, тогда пропускаем
  for (let i = 0; i < dataArrays.latitude.length; i++) {
    if (dataArrays.route[i].toString().length != 3) {
      // В зависимости от типа транспорта раскрашиваем маркеры
      let typeOfTransport = ``
      if (dataArrays.typeOfTransport[i] == 1) {
        typeOfTransport = `red`
      }
      if (dataArrays.typeOfTransport[i] == 2) {
        typeOfTransport = `green`
      }
      if (dataArrays.typeOfTransport[i] == 3) {
        typeOfTransport = `blue`
      }

      transportMarkerArray.push(
        new L.Marker([dataArrays.latitude[i], dataArrays.longitude[i]], {
          icon: new L.DivIcon({
            html: `
            <div class="marker ${typeOfTransport}">
              <span class="routeNumberOnMarker">${dataArrays.route[i]}</span>
              <span class="azimuthOnMarker" style="transform: rotate(${dataArrays.azimuth[i]}deg); ${dataArrays.azimuth[i] == 0 ? 'display: none;' : ''}"></span>
            </div>
          `,
          }),
        })
      )
    }
  }

  transportMarkerArray.map((marker) => map.addLayer(marker)) // Добавляем маркеры на карту
  firstCallOfFunction = true

  // Перерисовываем маркеры по каждому событию zoom, чтобы азимуты и номера маршрутов правильней центрировались
  map.on('zoomend', () => {
    reloadMarkers(dataArrays)
  })
}
