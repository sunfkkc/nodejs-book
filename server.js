const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');

const { sequelize } = require('./models');
const indexRouter = require('./routes');
const usersRouter = require('./routes/users');
const commentsRouter = require('./routes/comments');

const server = express();
server.set('port', process.env.PORT || 3001);
server.set('view engine', 'html');

nunjucks.configure('views', {
  express: server,
  watch: true,
});

sequelize
  .sync({ force: false })
  .then(() => {
    console.log('db connect successful');
  })
  .catch((err) => {
    console.log(err);
  });

server.use(morgan('dev'));
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.use('/', indexRouter);
server.use('/users', usersRouter);
server.use('/comments', commentsRouter);

server.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다`);
  error.status = 404;
  next(error);
});

server.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

server.listen(server.get('port'), () => {
  console.log(server.get('port'), '번 포트에서 대기 중');
});
