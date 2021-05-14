import express from 'express';
import auth from '../middleware/auth.middleware';

const app = express();

app.get('/', (req, res) => {
  // отдать все курсы
});

app
  .route('/:id')
  .get((req, res) => {
    // отдать курс по айди
  })
  .post(auth, (req, res) => {
    // создать новый курс, юзер должен быть авторизован
  })
  .patch(auth, (req, res) => {
    // юзер редактирует свой курс
  })
  .delete(auth, (req, res) => {
    // юзер удаляет свой курс
  });

app.get('/:id/:lesson/comments', auth, (req, res) => {
  // получить все комменты к занятию
});

app.post('/:id/:lesson/comment', auth, (req, res) => {
  // оставить коммент к занятию
});

export default app;
