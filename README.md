## Веб-приложение для отслеживания движения краснодарского транспорта

![](https://transport.stranno.su/design.png)

https://transport.stranno.su

Стек: HTML5, Sass, JS, Leaflet, Workbox, Gulp

Приложение реализовано как PWA. Service Worker генерируется библиотекой Workbox.

## Установка

Установка зависимостей:

```bash
$ npm i
```

Компиляция и запуск livereload-сервера:

```bash
$ gulp
```

Сборка:

```bash
$ gulp build
```

Генерация service worker:

```bash
$ gulp serviceWorker
```
