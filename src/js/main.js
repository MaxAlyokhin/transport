import { transportSupervisor } from './transportSupervisor.js' // Генерирует массив скоростей

export const updateFrequency = 5000 // Частота обновления данных о скоростях

function main() {
  transportSupervisor(updateFrequency)
}

main()
