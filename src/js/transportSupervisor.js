// Метод получает данные о городском транспорте и парсит их в массивы

import { mapInit } from './mapDrawer.js' // Инициализация карты
import { reloadMarkers } from './mapDrawer.js' // Генерирует карту и массив маркеров

export function transportSupervisor(updateFrequency) {
  let isMapInit = false // Маркер инициализации карты

  async function getTransportData() {
    // Получаем данные
    let transportServerResponse = await fetch('https://stops.lt/krasnodar/gps.txt')

    // Если HTTP-статус в диапазоне 200-299
    if (transportServerResponse.ok) {
      let allTransportData = await transportServerResponse.text() // Прочитать тело ответа как текст
      let allTransportDataArray = allTransportData.split(',') // Парсим текст в массив

      // Собираем по массиву данные
      // В каждой строке 7 элементов:
      // 1 - тип транспорта
      // 2 - номер маршрута
      // 3 - широта
      // 4 - долгота
      // 5 - скорость
      // 6 - азимут
      // 7 - номер салона

      let typeOfTransportArray = [] // Массив типов транспорта
      let routesArray = [] // Массив маршрутов
      let latitudeArray = [] // Массив широт
      let longitudeArray = [] // Массив долгот
      let azimuthArray = [] // Массив азимутов

      for (let i = 0; i < allTransportDataArray.length - 1; i += 7) {
        // 4 это служебные салоны, их исключаем
        // Также исключаем салоны с неизвестным номером маршрута
        if (allTransportDataArray[i] != 4 && allTransportDataArray[i + 1] != '') {
          typeOfTransportArray.push(allTransportDataArray[i])
          routesArray.push(allTransportDataArray[i + 1])
          longitudeArray.push(allTransportDataArray[i + 2] / 1000000) // Делим на миллион, так как исходно данные представлены без запятой
          latitudeArray.push(allTransportDataArray[i + 3] / 1000000)
          azimuthArray.push(allTransportDataArray[i + 5])
        }
      }

      // Упаковываем массивы в объект
      let dataArrays = {
        typeOfTransport: typeOfTransportArray,
        route: routesArray,
        latitude: latitudeArray,
        longitude: longitudeArray,
        azimuth: azimuthArray,
      }

      // Инициализируем карту
      if (!isMapInit) {
        mapInit(dataArrays)
        isMapInit = true
      }

      // И далее обновляем маркеры по каждому обновлению данных
      reloadMarkers(dataArrays)
    } else {
      console.log('Ошибка HTTP: ' + transportServerResponse.status)
    }
  }

  getTransportData() // Вызываем функцию первый раз
  setInterval(getTransportData, updateFrequency) // И далее повторяем
}
