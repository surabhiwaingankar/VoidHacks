const nodemailer = require('nodemailer');
const fs = require('fs');
const welcome = fs.readFileSync(`${__dirname}/../data/html/welcome.html`);
const passwordReset = fs.readFileSync(`${__dirname}/../data/html/passwordReset.html`);

module.exports = class Email{
  constructor(user, url, otp)
  {
    this.otp = otp;
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Surabhi Waingankar <${process.env.EMAIL_FROM}>`;
  }

  newTransport(){
    if(process.env.NODE_ENV==='production')
    {
        return nodemailer.createTransport({
            service: 'gmail',
            // port: 587,
            // secure: false,
            // requireTLS: true,
            // logger: true,
            // debug: true,
            auth: {
              user: process.env.EMAIL_FROM,
              pass: process.env.EMAIL_PASS
            }
        }); 
    }

    // else if env is dev 
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    }); 
  }
 
  async send(template, subject){ 
    let html; 
    if(template==='welcome')
    {
        html = String(welcome);
        html = html.replace('[Username]', this.firstName);
        html = html.replace('[OTP]', this.otp);
    }
    else
    {
      html = String(passwordReset);
      
      html = html.replace('[Username]', this.firstName);
      html = html.replace('[Password_Reset_URL]', this.url);
    }

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html
      }
      //console.log("Mail msg "+ html)
      await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome()
  {
    await this.send('welcome', 'Welcome!');
  }

  async sendPasswordReset()
  {
    await this.send('passwordReset', 'Your password reset token (valid for only 10 mins)');
  }
}