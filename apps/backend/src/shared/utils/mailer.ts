import { Resend } from "resend";

export const sendTeacherWelcomeEmail = async (
    to: string,
    name: string,
    password: string
) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: process.env.FROM_EMAIL as string,
        to,
        subject: "Welcome to Gradewise 🎓",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Welcome to Gradewise, ${name}!</h2>
        <p>Your account has been created by the admin.</p>
        <div style="background: #f4f4f4; padding: 16px; border-radius: 8px;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
          Please change your password after first login.
        </p>
      </div>
    `,
    });
};

export const sendStudentWelcomeEmail = async (
    to: string,
    name: string,
    password: string
) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: process.env.FROM_EMAIL as string,
        to,
        subject: "Welcome to Gradewise 🎓",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Welcome to Gradewise, ${name}!</h2>
        <p>Your student account has been created.</p>
        <div style="background: #f4f4f4; padding: 16px; border-radius: 8px;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
          Please change your password after first login.
        </p>
      </div>
    `,
    });
};