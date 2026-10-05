.PHONY: install build start lint contract

install:
	npm ci

build:
	rm -rf public/assets public/index.html
	mkdir -p public
	cp -R node_modules/@hexlet/js-flight-booking-frontend/dist/. public/

start:
	npm start

lint:
	npm run lint
	npm run typecheck

contract:
	npx tsp compile contract
