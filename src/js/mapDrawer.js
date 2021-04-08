let map // Здесь храним карту

// Метод рисует карту
export function mapInit(dataArrays) {
  // Создаём карту
  map = L.map('map', { zoomControl: false }) // Привязываем элемент #map к картам, отключаем лишний интерфейс

  // Подгружаем тайлы
  let stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', { detectRetina: true })
  stamenToner.addTo(map)

  // Добавляем копирайты
  map.attributionControl.addAttribution('<a href="https://stamen.com">Stamen Design</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')

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

  // Кнопка информации
  let isInfo = 0 // Маркер отслеживания геопозиции
  document.querySelector('.info').addEventListener('click', () => {
    if (!isInfo) {
      document.querySelector('.info').style.fontSize = '17px'
      document.querySelector('.panel').style.display = 'flex'
      setTimeout(() => {
        document.querySelector('.panel').style.opacity = 1
        document.querySelector('.panel').style.transform = 'scale(1) translateY(0)'
      }, 100)

      isInfo = 1
    } else {
      document.querySelector('.info').style.fontSize = '22px'
      document.querySelector('.panel').style.opacity = 0
      document.querySelector('.panel').style.transform = 'scale(0.98) translateY(5px)'
      setTimeout(() => {
        document.querySelector('.panel').style.display = 'none'
      }, 1000)
      isInfo = 0
    }
  })

  // Переменные для фокуса на карте, чтобы все маркеры были видны
  let maxLatitude
  let minLatitude
  let maxLongitude
  let minLongitude

  // Создаём прямоугольник с координатами двух точек и масштабируем так, чтобы обе были видны
  maxLatitude = Math.max(...dataArrays.latitude)
  minLatitude = Math.min(...dataArrays.latitude)
  maxLongitude = Math.max(...dataArrays.longitude)
  minLongitude = Math.min(...dataArrays.longitude)

  let bounds = L.latLngBounds([
    [maxLatitude - 0.008, minLongitude + 0.008],
    [minLatitude - 0.008, maxLongitude + 0.008],
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
