// src/mailer/mailer.ts  

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,   
    pass: process.env.EMAIL_PASS    
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function sendVerificationEmail(email: string, code: string) {
  console.log('\n');
  console.log('..............................................');
  console.log('EXPENSEPRO CODE FOR:', email);
  console.log('YOUR 6-DIGIT CODE IS → → →', code);
  console.log('...............................................');
  console.log('\n');

  try {
    await transporter.sendMail({
      from: `"ExpensePro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your ExpensePro Verification / Reset Code',
      text: `Your verification code is ${code}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px; background: #f9f9f9; max-width: 500px; margin: auto; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h1 style="color: #764ba2; font-size: 32px;">ExpensePro</h1>
          <h2 style="color: #333; margin: 30px 0 10px;">Your Verification Code</h2>
          <div style="font-size: 52px; font-weight: bold; color: #667eea; letter-spacing: 12px; background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(102,126,234,0.2);">
            ${code}
          </div>
          <p style="margin-top: 30px; color: #555; font-size: 16px;">
            This code expires in <strong>10 minutes</strong>.<br>
            If you didn't request this, you can safely ignore it.
          </p>
        </div>
      `,
      // fixing gmail from blocking me emails or returning the to spam or dissapearing them
      list: {
        unsubscribe: 'https://expensepro.com/unsubscribe'
      }
    });

    console.log('EMAIL SENT SUCCESSFULLY VIA GMAIL →', email);
    console.log('Check your inbox (not spam!) — it will be there in 3 seconds');

  } catch (err: any) {
    console.log('GMAIL SEND FAILED — BUT CODE IS PRINTED ABOVE ↑↑↑');
    console.error('Error:', err.message);
  }
}