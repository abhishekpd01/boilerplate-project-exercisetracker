const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}));

// In memory storage for users and logs.
var users = [];
var exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Creating a new User.
app.post('/api/users', function(req, res) {
  const newUser = {
    username : req.body.username,
    _id : `${users.length + 1}`
  };
  users.push(newUser);
  res.json(newUser);
});

// Get list of all users.
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Adding Exercise to specific user.
app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  const date = req.body.date;
  const duration = req.body.duration;
  const description = req.body.description;
  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
  
  const user = users.find(u => u._id === id);
  if(!user) {
    return res.status(404).json({error : 'User not found'});
  }

  const newExercise = {
    _id : user._id,
    username: user.username,
    date : exerciseDate,
    duration : parseInt(duration),
    description : description
  };

  exercises.push(newExercise);
  res.json(newExercise);
});

// Get exercise log for a specific User.
app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const user = users.find(u => u._id === id);
  if(!user) {
    return res.status(404).json({error : 'User not found'});
  }

  const { from, to, limit } = req.query;

  var userExercises = exercises.filter(ex => ex._id === id);

  // Apply date filters
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  // Apply limit
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    _id : user._id,
    username : user.username,
    count : userExercises.length,
    log : userExercises.map( ({description, duration, date}) => ({
      description,
      duration,
      date
    }))
  }) ;
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
