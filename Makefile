SASS = sass --no-cache

all: require es6

require:
	yarn install
	git submodule update

sass:
	${SASS} src/assets/scss/app.scss src/assets/css/site.css

es6:
	browserify player.js -t babelify -o bundle.js
