const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  
  const user = users.find((user) => user.username === username);
  if(!user){
    return response.status(404).json({error:'User not found!'})
  }
  request.user = user;
  return next();
}

app.post("/users",(request, response) => {
  const { name, username } = request.body;
  
  const userExist = users.find((user) => user.username === username);
 
  if (userExist) {
    return response.status(400).json({ error: "User already exist" });
  }

  const user = {
    id:uuidv4(),
    name, 
    username,
    todos:[]
  }

    users.push(user);
  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const todos = user.todos;
  
  response.status(200).json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title,deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at:new Date(),

  };
  user.todos.push(todo);

  console.log(todo)
  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
   const { title, deadline } = request.body;
   const id = request.params.id;
   const { user } = request;

   const updatedTodo = user.todos.map((todo) => {
     if (todo.id == id) {
       todo.deadline = new Date(deadline);
       todo.title = title;

     return response.status(201).json(todo);
     }
   });

  return response.status(400).json({ error: "invalid operation" });
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
   const { id,deadline } = request.params;
   const { user } = request;
   const finalizeTodo = user.todos.map((todo) => {
     if (todo.id == id) {
       todo.deadline = new Date(deadline);
       todo.done = true;

       return response.status(200).json(todo);
     }
   })
   return response.status(404).json({ error: "Invalid Operation" });
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
     const {id} = request.params;
     const {user} = request;

     console.log(id)

     const filterTodo = user.todos.filter((todo)=> todo.id == id);
     if(!filterTodo){
      return response.status(400).json({error:"Todo não encontrado"});
     }
     user.todos.splice(filterTodo,1)
     return response.status(200).json(user.todos);
});

module.exports = app;
