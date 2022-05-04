import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'ss3qpbwlgcscv6vs@ethereal.email',
      pass: 'SSj3jK7aynegBm2k7q',
    },
  });

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject: 'Change password',
    html,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
