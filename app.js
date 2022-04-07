const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const {v4 : uuid } = require('uuid')

const app = express()

app.set('view engine', 'hbs')

app.engine('hbs', hbs.engine({
	extname: '.hbs',
	defaultLayout: 'index',
	//layoutsDir: __dirname + '/views/layouts',
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const port = 3000

const state = {
	todos: [
		{
			id: uuid(),
			name: 'Taste htmx',
			done: true,
		},
		{
			id: uuid(),
			name: 'Buy a unicorn',
			done: false,
		},
	],
	
	count: {
			all: 2,
			active: 1,
			complete: 1,
	},
}

//const actions = state =>({
const actions = {

	updateCounts: function(){
		state.count.all = state.todos.length
		state.count.active = state.todos.filter(todo => !todo.done).length
		state.count.complete = state.todos.filter(todo => todo.done).length
	},

}

app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/render-hbs', (req, res) => {
	res.render('home')
})

app.get('/todos', (req, res) => {

	//const header = req.headers

	const {filter}  = req.query

	let filteredTodos = []

	switch(filter){
		case 'all':
			filteredTodos = state.todos
			break

		case 'active':
			filteredTodos = state.todos.filter(todo => !todo.done)
			break

		case 'completed':
			filteredTodos = state.todos.filter(todo => todo.done)
			break

		default:
			filteredTodos = state.todos
	}

	res.render('todos', { todos: filteredTodos, count: state.count }) 

})

app.post('/todos', (req, res) => {

	//onsole.log(JSON.stringify(req.headers))
	const { todo } = req.body

	const newTodo = {
		id: uuid(),
		name: todo,
		done: false,
	}
	
	state.todos.push(newTodo)

	actions.updateCounts()

	if (req.headers["hx-request"]){
		res.set("HX-Trigger", "itemAdded")
		res.render('partials/todo-item', { todo: newTodo, layout: false}) //todo

	} else {
		//redirect
		res.send('')
	}
})

app.get('/todos/edit/:id', (req, res) => {

	const {id} = req.params
	const todo = todos.find(item => item.id === id)

	res.send('todo get ') // todo

})

app.patch('/todos/:id', (req, res) => {

	if (req.headers["hx-request"]){
		const {id} = req.params
		const todo = state.todos.find(item => item.id === id)

		todo.done = !todo.done
		actions.updateCounts()

		res.set("HX-Trigger", "itemCompletionToggled")
		res.render('partials/todo-item', { todo: todo, layout: false}) 

	}

})

app.delete('/todos/:id', (req, res) => {

	if (req.headers["hx-request"]){
		const {id} = req.params
		const todo = state.todos.find(item => item.id === id)

		state.todos.splice(todo, 1)
		actions.updateCounts()

		res.set("HX-Trigger", "itemDeleted")

		res.send('') 
	}

})

app.get('/items-count', (req, res) => {

	res.render('partials/items-count', 
	{
		count: state.count, 
		layout: false
	})
})

app.listen(port, () => {
	console.log(`App is listening to port ${port}`)
})
