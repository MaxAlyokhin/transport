import { transportSupervisor } from './transportSupervisor.js'

function main() {
    const updateFrequency = 5000 // Частота обновления данных
    transportSupervisor(updateFrequency)
}

window.addEventListener('load', () => {
    main()

    caches.keys().then(names => names.forEach(name => caches.delete(name)));

    navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
            if (registration.active.scriptURL === 'https://transport.stranno.su/serviceWorkerForTransport.js') {
                registration.unregister()
            }
        }
    });
})
