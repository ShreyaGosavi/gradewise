import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendTeacherWelcomeEmail = async (
    to: string,
    name: string,
    password: string
) => {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL as string,
        subject: "Welcome to Gradewise 🎓",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Welcome to Gradewise, ${name}!</h2>
        <p>Your account has been created by the admin.</p>
        <p>Here are your login credentials:</p>
        <div style="background: #f4f4f4; padding: 16px; border-radius: 8px;">
          <p><strong>Email:</strong> ${to}</p>
          <p><strong>Password:</strong> ${password}</p>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 24px;">
          Please change your password after first login.
        </p>
      </div>
    `,
    };

    await sgMail.send(msg);
};

export const sendStudentWelcomeEmail = async (
    to: string,
    name: string,
    password: string
) => {
    const msg = {
        to,
        from: process.env.SENDGRID_FROM_EMAIL as string,
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
    };
    await sgMail.send(msg);
};