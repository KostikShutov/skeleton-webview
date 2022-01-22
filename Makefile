##########
# Docker #
##########

.PHONY: d-up
d-up:
	docker compose up -d

.PHONY: d-down
d-down:
	docker compose down

.PHONY: d-restart
d-restart:
	docker compose restart

.PHONY: d-node
d-node:
	docker compose exec skeleton-node bash

###########
# Webview #
###########

.PHONY: install
install:
	docker compose run --rm -w /skeleton skeleton-node npm install

.PHONY: build
build:
	docker compose run --rm -w /skeleton skeleton-node npm run build

.PHONY: dev
dev:
	docker compose run --rm -p 1001:1001 -w /skeleton skeleton-node npm run serve

.PHONY: prod
prod:
	docker compose run --rm -p 1001:1001 -w /skeleton skeleton-node npm run prod
