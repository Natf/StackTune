SASS = sass --no-cache

sass:
	${SASS} src/assets/scss/app.scss src/assets/css/site.css

es6:
	browserify player.js -t babelify -o bundle.js