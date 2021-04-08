import { transportSupervisor } from './transportSupervisor.js'

function main() {
  const updateFrequency = 5000 // Частота обновления данных
  transportSupervisor(updateFrequency)
}

window.addEventListener('load', () => {
  main()
})
