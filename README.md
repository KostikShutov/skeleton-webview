# skeleton-webview

## Другие компоненты общей системы

[Car control](https://github.com/KostikShutov/skeleton-car)

[Autonomous command generator](https://github.com/KostikShutov/skeleton-autonomous)

## Docker

Поднять docker контейнеры

```bash
make d-up
```

Остановить docker контейнеры

```bash
make d-down
```

Перезапустить docker контейнеры

```bash
make d-restart
```

Зайти в контейнер с Node.js

```bash
make d-node
```

## Webview

Установить зависимости

```bash
make install
```

Запустить сборку проекта

```bash
make build
```

Поднять сервер в `dev` режиме (<http://localhost:1001>)

```bash
make dev
```

Поднять сервер в `prod` режиме (<http://localhost:1001>)

```bash
make prod
```
