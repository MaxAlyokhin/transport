// Метод получает данные о городском транспорте и парсит их в массивы

import { mapDrawer } from './mapDrawer.js' // Генерирует карту и массив маркеров

export let speedsArray = [] // Глобально объявляем массив скоростей
export let typeOfTransportArray = [] // Глобально объявляем массив типов транспорта
export let routesArray = [] // Глобально объявляем массив маршрутов
export let latitude = [] // Глобально объявляем массив широт
export let longitude = [] // Глобально объявляем массив долгот
export let azimuth = [] // Глобально объявляем массив азимутов

export function transportSupervisor(updateFrequency) {
  let oneCallOfFunction = 0

  async function getTransportData() {
    let transportServerResponse = await fetch('https://stops.lt/krasnodar/gps.txt')

    if (transportServerResponse.ok) {
      // Если HTTP-статус в диапазоне 200-299
      let allTransportData = await transportServerResponse.text() // Прочитать тело ответа как текст
      let allTransportDataArray = allTransportData.split(',') // Парсим текст в массив

      // Собираем по массиву данные, исходя из наличия скорости
      // В каждой строке 7 элементов, начиная с 4ого каждый 7ой элемент это скорость
      // Если скорость == '', то пропускаем всю строку
      // По пути собираем типы транспорта (каждый нулевой элемент)
      // И номера маршрутов (каждый первый элемент в строке), исключая 4 - это служебные салоны
      let i = 4
      let j = 0

      // Проходиим по всем салонам и собираем данные в массивы
      for (i; i < allTransportDataArray.length; i += 7) {
        if (allTransportDataArray[i] != '' && allTransportDataArray[i - 4] != 4) {
          speedsArray[j] = allTransportDataArray[i]
          typeOfTransportArray[j] = allTransportDataArray[i - 4]
          routesArray[j] = allTransportDataArray[i - 3]
          latitude[j] = allTransportDataArray[i - 1] / 1000000 // Делим на миллион, так как исходно данные представлены без запятой
          longitude[j] = allTransportDataArray[i - 2] / 1000000
          azimuth[j] = allTransportDataArray[i + 1]
          j++
        }
      }

      // По первому приходу данных генерим карту
      if (oneCallOfFunction == 0) {
        oneCallOfFunction = 1
        mapDrawer(updateFrequency)
      }
    } else {
      console.log('Ошибка HTTP: ' + transportServerResponse.status)
    }
  }

  getTransportData() // Вызываем функцию первый раз
  setInterval(getTransportData, updateFrequency) // И далее повторяем
}
