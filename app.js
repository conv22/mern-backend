const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

require('dotenv').config();

const app = express();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(passport.initialize());
require('./middleware/auth')(passport);

app.use('/auth', require('./routes/authRoute'));
app.use('/main', require('./routes/mainRoute'));

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log('Connected to DB');
    app.listen(process.env.PORT, () => {
      console.log('The server has been started');
    });
  } catch (e) {
    console.log('Server error', e.message);
    process.exit(1);
  }
}
start();
