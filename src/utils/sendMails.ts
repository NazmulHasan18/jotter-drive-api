import nodemailer from "nodemailer";
import AppError from "../errors/AppError";

type SendForgetPassOtpParams = {
   email: string;
   otp: string;
   name: string;
};

const transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
      user: "nazmul182218@gmail.com",
      pass: "ynao mvhd lghm etlh",
   },
});

export const sendForgetPassOtp = async ({ email, otp, name }: SendForgetPassOtpParams): Promise<void> => {
   try {
      if (!email || !otp || !name) {
         throw new AppError(400, "Missing required parameters: email, otp, or name");
      }

      const mailOptions = {
         from: "Jotter<nazmul182218@gmail.com>",
         to: email,
         subject: "Password Reset OTP",
         html: `
         <p style="font-size:16px;">Hello <strong>${name}</strong>,</p>
         <p style="font-size:16px;">Your OTP for password reset is: 
            <strong style="color:red; font-size:20px;">${otp}</strong>
         </p>
         <p style="font-size:14px;">If you didn't request this, please ignore this email.</p>
      `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
      return;
   } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send OTP email");
   }
};
