const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const Task = require('../models/Task');


exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    res.status(201).redirect('/login');
  } catch (error) {
    const errors = validationResult(req);
    console.log(errors);
    console.log(errors.array()[0].msg);
    // for (let i = 0; i < errors.array().length; i++) {
    //   req.flash('error', `${errors.array()[i].msg}`);
    // }
    res.status(400).redirect('/register');
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    await User.findOne({ email: email }, (err, user) => {
      if (user) {
        bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            // User Session
            req.session.userID = user._id;
            res.status(200).redirect('/');
          } else {
            req.flash('error', 'Your password is not correct!');
            res.status(400).redirect('/login');
          }
        });
      } else {
        req.flash('error', 'User is not exist!');
        res.status(400).redirect('/login');
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.getCreatePage = async (req, res) => {
  res.status(200).render('create', {
    page_name: 'create'
  });
};

exports.createTask = async(req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      author: req.session.userID
    });
    res.status(200).redirect('/users/create');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
}

exports.readTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ author: req.session.userID });
    tasks.sort((a, b) => b.date - a.date);
    tasks.reverse();
    res.status(200).render('read', {
      page_name: 'read',
      tasks
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.getSingleTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(200).render('single', {
      page_name: 'single',
      task
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndRemove({ _id: req.params.id });
    res.status(200).redirect('/users/read');
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};

exports.filterTasks = async (req, res) => {
  try {
    let tasks = await Task.find({ author: req.session.userID });
    let date = new Date().toISOString().split('T')[0];

    // Filter for day
    if(req.params.slug == 'day') {
      let tasksFilter = tasks.filter((element) => {
        return element.date.toISOString().split('T')[0] == date;
      });
      res.status(200).render('read', {
        page_name: 'read',
        tasks: tasksFilter
      });
    }
    // Filter for week
    else if (req.params.slug == 'week') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      let tasksFilter = tasks.filter((element) => {
        return (date <= element.date.toISOString().split('T')[0] && element.date.toISOString().split('T')[0] < d.toISOString().split('T')[0]);
      });
      tasksFilter.sort((a, b) => b.date - a.date);
      tasksFilter.reverse();
      res.status(200).render('read', {
        page_name: 'read',
        tasks: tasksFilter
      });
    }
    // Filter for month
    else {
      let tasksFilter = tasks.filter((element) => {
        if(`${element.date.toISOString().split('T')[0]}`.substring(0,7) == `${date}`.substring(0, 7)) {
          return `${element.date.toISOString().split('T')[0]}`.substring(8) <= 31;
        }
      });
      tasksFilter.sort((a, b) => b.date - a.date);
      tasksFilter.reverse();
      res.status(200).render('read', {
        page_name: 'read',
        tasks: tasksFilter
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      error,
    });
  }
};