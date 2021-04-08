import gulp from 'gulp'
import sass from 'gulp-sass' // Sass компиллятор
import sourcemaps from 'gulp-sourcemaps' // Sourcemaps
import autoprefixer from 'gulp-autoprefixer' // Автопрефиксер CSS
import imagemin from 'gulp-imagemin' // Компрессия изображений
import imageminPngquant from 'imagemin-pngquant' // Дополнение для .png
import rimraf from 'rimraf' // Удаление файлов
import concat from 'gulp-concat' // Конкатенация
import rigger from 'gulp-rigger' // Подключение шаблонов
import webpack from 'webpack-stream' // Сборка JS
import workboxBuild from 'workbox-build' // Генератор service worker для PWA
import browserSync from 'browser-sync' // Сервер

const { src, dest, watch, series, parallel } = gulp
const reload = browserSync.reload

// Здесь хранятся пути до всех файлов
const path = {
  // Брать исходники здесь:
  src: {
    html: 'src/html/*.html',
    sass: 'src/sass/**/*.sass',
    js: 'src/js/**/*.js',
    img: 'src/images/**/*.*',
    fonts: 'src/fonts/**/*.*',
    libs: 'src/libs/**/*.*',
  },
  // За изменением каких файлов мы хотим наблюдать:
  watch: {
    html: 'src/html/*.html',
    sass: 'src/sass/**/*.sass',
    js: 'src/js/**/*.js',
    img: 'src/images/**/*.*',
    fonts: 'src/fonts/**/*.*',
    libs: 'src/libs/**/*.*',
  },
  // Готовые после сборки файлы переносим сюда:
  dist: {
    html: 'dist/',
    css: 'dist/styles/',
    js: 'dist/scripts/',
    img: 'dist/img/',
    fonts: 'dist/fonts/',
    libs: 'dist/libs/',
  },
  clean: 'dist',
}

// Здесь настройки сервера
const config = {
  server: {
    baseDir: 'dist',
  },
  tunnel: false,
  host: 'localhost',
  port: 8000,
  logPrefix: 'DevServer',
  open: true, // Браузер автоматом открываем
}

// Сборка html
function html() {
  return src(path.src.html) // Путь до исходных файлов в src
    .pipe(rigger()) // Rigger позволяет использовать шаблоны и подключать их в документы
    .pipe(dest(path.dist.html)) // Вывод готового в dist
    .pipe(reload({ stream: true })) // Обновляем сервер
}

// Сборка css
function style() {
  return src([path.src.sass]) // Путь до исходных файлов в src
    .pipe(sourcemaps.init()) // Инициализируем sourcemaps
    .pipe(
      sass({
        // Параметры gulp-sass
        sourceMap: true, // sourcemaps включены
        errLogToConsole: true, // Пишем логи
        outputStyle: 'compressed', // Минифицируем
      })
    )
    .pipe(concat('style.min.css'))
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ['last 10 versions'],
      })
    ) // Добавляем вендорные префиксы
    .pipe(sourcemaps.write()) // Прописываем sourcemaps
    .pipe(dest(path.dist.css)) // Вывод готового в dist
    .pipe(reload({ stream: true })) // Обновляем сервер
}

// Сборка js
function js() {
  return src('src/js/main.js')
    .pipe(
      webpack({
        module: {
          rules: [
            {
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env'],
                },
              },
            },
          ],
        },
        output: { filename: 'main.min.js' },
        devtool: 'source-map',
      })
    )
    .pipe(dest(path.dist.js)) // Вывод готового в dist
    .pipe(reload({ stream: true })) // Обновляем сервер
}

// Оптимизация изображений
function image() {
  return src(path.src.img) // Путь до исходных файлов в src
    .pipe(imagemin({ plugins: [imageminPngquant()] })) // Оптимизация изображений + плагин для png
    .pipe(dest(path.dist.img)) // Вывод готового в dist
    .pipe(reload({ stream: true })) // Обновляем сервер
}

// Шрифты (перенос из src в dist)
function fonts() {
  return src(path.src.fonts) // Вход
    .pipe(dest(path.dist.fonts)) // Выход
    .pipe(reload({ stream: true })) // Обновляем сервер
}

// Перенос библиотек
function libs() {
  return src(path.src.libs) // Вход
    .pipe(dest(path.dist.libs)) // Выход
    .pipe(reload({ stream: true })) // Обновляем сервер
}

// Очистка
function clean(cb) {
  rimraf(path.clean, cb)
}

// Команды:

// Генерация service worker
export function serviceWorker() {
  return workboxBuild.generateSW({
    globDirectory: 'dist',
    globPatterns: ['**/*.{html,js,css}'],
    swDest: 'dist/serviceWorkerForTransport.js',
    runtimeCaching: [
      {
        urlPattern: /\.(?:html|css|js)$/,
        handler: 'NetworkFirst',
      },
    ],
  })
}

// Собрать проект
export const build = series(clean, html, style, js, image, fonts, libs, serviceWorker)

// По дефолту всё собираем и запускаем сервер
const _default = series(html, style, image, fonts, libs, js, function () {
  browserSync(config)
  watch(path.watch.html, html)
  watch(path.src.sass, style)
  watch(path.src.js, js)
  watch(path.src.img, image)
  watch(path.src.fonts, fonts)
  watch(path.src.libs, libs)
})

export { _default as default }
