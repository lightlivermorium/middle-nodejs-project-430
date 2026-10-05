install:
	npm ci

build:
	rm -rf public/assets public/index.html
	mkdir -p public
	cp -R node_modules/@hexlet/js-flight-booking-frontend/dist/. public/
	npm run generate

start:
	npm start

lint:
	npm run lint
	npm run typecheck
