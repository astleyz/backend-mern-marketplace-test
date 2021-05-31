import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport(
  {
    host: 'NL101.vfemail.net',
    port: 465,
    secure: true,
    auth: {
      user: 'no.reply@openmail.cc',
      pass: 'Internet_Fly_Days123',
    },
  },
  { from: 'no reply<no.reply@openmail.cc>' }
);

const mailer = async (email: string, password: string): Promise<void> => {
  const message = {
    to: email,
    subject: 'You successfully registered',
    html: `
      <h6>Поздравляем, вы успешно зарегистрировались на нашем сайте!</h6>
      <p>Данные вашей учетной записи:</p>
      <ul>
        <li>Логин - ${email}</li>
        <li>Пароль - ${password}</li>
      </ul>
    `,
  };

  try {
    await transporter.sendMail(message);
  } catch (e) {
    console.log(e);
  }
};

export default mailer;
