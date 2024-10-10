// Метод получает данные о городском транспорте и парсит их в массивы

import { mapInit } from './mapDrawer.js' // Инициализация карты
import { reloadMarkers } from './mapDrawer.js' // Генерирует карту и массив маркеров

export function transportSupervisor(updateFrequency) {
    let isMapInit = false // Маркер инициализации карты

    async function getTransportData() {
        // Получаем данные
        const transportServerResponse = await fetch('https://proxy.stranno.su/orchestra')

        // Если HTTP-статус в диапазоне 200-299
        if (transportServerResponse.ok) {
            const allTransportData = await transportServerResponse.text() // Прочитать тело ответа как текст
            const dataMap = new Map()

            // Собираем по массиву данные
            // В каждой строке 7 элементов:
            // 1 - тип транспорта
            // 2 - номер маршрута
            // 3 - широта
            // 4 - долгота
            // 5 - скорость
            // 6 - азимут
            // 7 - номер салона
            allTransportData
                .split('\n') // Каждая строка это салон
                .map((transport) => {
                    return transport.split(',')
                })
                .filter((transport) => {
                    transport.pop() // Отрезаем символ \r

                    // 4 это служебные салоны, их исключаем
                    // Также исключаем салоны с неизвестным номером маршрута
                    return transport.length && transport[0] !== 4 && transport[1] !== '' && transport[1].toString().length < 3
                })
                .forEach((transport) => {
                    dataMap.set(transport[6], {
                        typeOfTransport: transport[0],
                        route: transport[1],
                        longitude: transport[2] / 1000000,
                        latitude: transport[3] / 1000000,
                        azimuth: Number(transport[5]),
                    })
                })

            // Инициализируем карту
            if (!isMapInit) {
                mapInit()
                isMapInit = true
            }

            // И далее обновляем маркеры по каждому обновлению данных
            reloadMarkers(dataMap)
        } else {
            console.log('Ошибка HTTP: ' + transportServerResponse.status)
        }
    }

    getTransportData() // Вызываем функцию первый раз
    let getTransportDataInterval = setInterval(getTransportData, updateFrequency) // И далее повторяем

    // Кнопка информации
    let isInfo = 0 // Маркер отслеживания геопозиции

    const panelElement = document.querySelector('.panel')
    const infoElement = document.querySelector('.info')

    infoElement.addEventListener('click', () => {
        if (!isInfo) {
            infoElement.classList.add('info--active')
            panelElement.classList.add('panel--active')
            isInfo = 1
        } else {
            infoElement.classList.remove('info--active')
            panelElement.classList.remove('panel--active')
            isInfo = 0
        }
    })
}
