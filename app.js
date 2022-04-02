const express = require('express')
const hbs = require('express-handlebars')

const app = express()

app.set('view engine', 'hbs')

app.engine('hbs', hbs.engine({
	extname: '.hbs',
	defaultLayout: 'index',
	//layoutsDir: __dirname + '/views/layouts',
}))

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/render-hbs', (req, res) => {
	res.render('home')
})

app.listen(port, () => {
	console.log(`App is listening to port ${port}`)
})
