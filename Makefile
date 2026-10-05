.PHONY: install build start lint test contract

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

test: build
	npm test

contract:
	npx tsp compile contract
