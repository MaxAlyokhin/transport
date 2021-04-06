// Метод рисует карту и расставляет маркеры движущегося транспорта

import { latitude } from './transportSupervisor.js'
import { longitude } from './transportSupervisor.js'
import { routesArray } from './transportSupervisor.js'
import { azimuth } from './transportSupervisor.js'
import { typeOfTransportArray } from './transportSupervisor.js'
import { updateFrequency } from './main.js'

let map // Здесь храним карту

export function mapDrawer() {
  // Создаём карту
  map = L.map('map', { zoomControl: false }) // Привязываем элемент #map к картам, отключаем лишний интерфейс

  // Подгружаем тайлы
  let stamenToner = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', { detectRetina: true })
  stamenToner.addTo(map)

  // Добавляем копирайты
  map.attributionControl.addAttribution('<a href="https://stamen.com">Stamen Design</a> | <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://github.com/MaxAlyokhin/transport">Github</a>')

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

  // Массив маркеров
  let transportMarkerArray = []

  // Переменные для фокуса на карте, чтобы все маркеры были видны
  let maxLatitude
  let minLatitude
  let maxLongitude
  let minLongitude

  let oneCallOfFunction = 0 // Маркер первого вызова функции

  // Создаём прямоугольник с координатами двух точек и масштабируем так, чтобы обе были видны
  maxLatitude = Math.max.apply(null, latitude)
  minLatitude = Math.min.apply(null, latitude)
  maxLongitude = Math.max.apply(null, longitude)
  minLongitude = Math.min.apply(null, longitude)

  let bounds = L.latLngBounds([
    [maxLatitude - 0.008, minLongitude + 0.008],
    [minLatitude - 0.008, maxLongitude + 0.008],
  ])
  map.fitBounds(bounds) // Масштабируем

  // По каждому обновлению данных обновляем маркеры
  function reloadMarkers() {
    // Цикл удалений старых маркеров (только после второго вызова функции)
    if (oneCallOfFunction) {
      for (let i = 0; i < transportMarkerArray.length; i++) {
        map.removeLayer(transportMarkerArray[i])
      }
      transportMarkerArray.length = 0
    }

    // Создаём новые маркеры
    // Если номер маршрута трёхзначный, то это не номер маршрута, а номер салона, тогда пропускаем
    for (let i = 0; i < latitude.length; i++) {
      if (routesArray[i].toString().length != 3) {
        // В зависимости от типа транспорта раскрашиваем маркеры
        let typeOfTransport = ``
        if (typeOfTransportArray[i] == 1) {
          typeOfTransport = `red`
        }
        if (typeOfTransportArray[i] == 2) {
          typeOfTransport = `green`
        }
        if (typeOfTransportArray[i] == 3) {
          typeOfTransport = `blue`
        }

        transportMarkerArray.push(
          new L.Marker([latitude[i], longitude[i]], {
            icon: new L.DivIcon({
              html: `
              <div class="marker ${typeOfTransport}">
                <span class="routeNumberOnMarker">${routesArray[i]}</span>
                <span class="azimuthOnMarker" style="transform: rotate(${azimuth[i]}deg)"></span>
              </div>
            `,
            }),
          })
        )
      }
    }

    for (let i = 0; i < transportMarkerArray.length; i++) {
      map.addLayer(transportMarkerArray[i]) // Добавляем на карту
    }
    oneCallOfFunction = 1
  }

  reloadMarkers() // Вызываем функцию первый раз
  setInterval(reloadMarkers, updateFrequency) // И далее повторяем

  // Перерисовываем маркеры по каждому событию zoom, чтобы азимуты и номера маршрутов правильней центрировались
  map.on('zoomend', () => {
    reloadMarkers()
  })
}
