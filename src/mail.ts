import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com', // QQ邮箱SMTP服务器
  port: 465, // QQ邮箱SMTP服务端口
  secure: true, // 使用SSL
  auth: {
    user: process.env.QQ_EMAIL, // 发送方邮箱
    pass: process.env.QQ_AUTH_CODE // 不是QQ密码，是前面获取的授权码
  }
});

export async function sendEmail (params: {
  subject: string;
  html:string;
}) {
  const mailOptions = {
    from: `"jesse ding" <${process.env.QQ_EMAIL}>`, // 发件人地址和名称
    to: `dingxj7788@gmail.com`, // 收件人，多个用逗号分隔
    subject: params.subject, // 主题
    html: params.html
  };

  try {
    // 发送邮件
    const info = await transporter.sendMail(mailOptions)

    console.log('邮件已发送: %s', info.messageId);
  } catch (error) {
    console.log('发送失败:', error);
  }
}