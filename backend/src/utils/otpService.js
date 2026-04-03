import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'queuelesscampus@gmail.com',
    pass: process.env.EMAIL_PASS || 'oqmf olcg qaxw nnby',
  },
});

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"QueueLess Campus" <${process.env.EMAIL_USER || 'queuelesscampus@gmail.com'}>`,
    to: email,
    subject: 'Your QueueLess Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #1C1917; color: #FAFAF9; padding: 20px; border-radius: 10px;">
        <h2 style="color: #9A3412; text-align: center;">QueueLess Campus Office</h2>
        <div style="background-color: #292524; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="font-size: 16px;">Hello,</p>
          <p style="font-size: 16px;">Your verification code for signing up / resetting password is:</p>
          <h1 style="color: #C2410C; font-size: 36px; letter-spacing: 5px;">${otp}</h1>
          <p style="font-size: 14px; color: #D6D3D1;">This code will expire in 10 minutes.</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #78716C; margin-top: 20px;">
          &copy; 2026 QueueLess Campus Office. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendSuccessEmail = async (email, message) => {
  const mailOptions = {
    from: `"QueueLess Campus" <${process.env.EMAIL_USER || 'queuelesscampus@gmail.com'}>`,
    to: email,
    subject: 'Action Successful - QueueLess Campus',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #1C1917; color: #FAFAF9; padding: 20px; border-radius: 10px;">
        <h2 style="color: #9A3412; text-align: center;">QueueLess Campus Office</h2>
        <div style="background-color: #292524; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="font-size: 18px; color: #C2410C;">SUCCESS!</p>
          <p style="font-size: 16px;">${message}</p>
        </div>
        <p style="text-align: center; font-size: 12px; color: #78716C; margin-top: 20px;">
          If you did not perform this action, please contact support immediately.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending success email:', error);
    return false;
  }
};
