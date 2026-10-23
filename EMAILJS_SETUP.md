# EmailJS setup for the portfolio contact form

The form uses EmailJS because this portfolio is hosted on GitHub Pages and has no backend. It will remain in setup-pending mode until you configure the three public identifiers in js/email-config.js and create the matching EmailJS service and template.

## 1. Connect Gmail

1. Sign in to https://www.emailjs.com/ and open Email Services.
2. Add Gmail and authorize the Gmail inbox that should receive portfolio messages.
3. Send a test message from the EmailJS dashboard before continuing.

## 2. Create the email template

Create a template named "Portfolio Contact Form".

- To Email: enter your own receiving Gmail address directly in the dashboard. Do not use a visitor-provided value.
- From Name: Portfolio Contact Form
- From Email: use the connected email service's default sender address.
- Reply-To: {{reply_to}}
- Subject: Portfolio message: {{subject}}

Use this HTML template as the message body:

```html
<div style="margin:0;padding:32px;background:#101219;font-family:Arial,sans-serif;color:#e9eaf2">
  <div style="max-width:620px;margin:auto;padding:28px;border:1px solid #343044;border-radius:16px;background:#171a23">
    <p style="margin:0 0 8px;color:#a78bfa;font-size:12px;font-weight:bold;letter-spacing:2px">PORTFOLIO CONTACT</p>
    <h1 style="margin:0 0 22px;font-size:24px;color:#fff">You have a new message</h1>
    <p style="margin:0 0 18px;color:#c4cad7;line-height:1.7">Someone contacted you through your portfolio website.</p>
    <div style="padding:14px;margin:0 0 12px;border-radius:10px;background:#20232e"><strong style="color:#a78bfa">Name</strong><p style="margin:6px 0 0;color:#fff">{{from_name}}</p></div>
    <div style="padding:14px;margin:0 0 12px;border-radius:10px;background:#20232e"><strong style="color:#a78bfa">Email</strong><p style="margin:6px 0 0;color:#fff">{{reply_to}}</p></div>
    <div style="padding:14px;margin:0 0 12px;border-radius:10px;background:#20232e"><strong style="color:#a78bfa">Subject</strong><p style="margin:6px 0 0;color:#fff">{{subject}}</p></div>
    <div style="padding:14px;border-radius:10px;background:#20232e"><strong style="color:#a78bfa">Message</strong><p style="margin:8px 0 0;color:#e9eaf2;line-height:1.8;white-space:pre-wrap">{{message}}</p></div>
    <p style="margin:22px 0 0;color:#8f97aa;font-size:12px">Sent from the Saif Ul Rehman portfolio contact form.</p>
  </div>
</div>
```

Set the template's reply-to field to `{{reply_to}}`. Keep the recipient fixed to your own Gmail address in the dashboard. Do not map the recipient to a public form field.

## 3. Configure the portfolio

Open `js/email-config.js` and replace:
- `YOUR_EMAILJS_PUBLIC_KEY` with the account's Public Key
- `YOUR_EMAILJS_SERVICE_ID` with the Gmail service ID
- `YOUR_EMAILJS_TEMPLATE_ID` with the template ID

The public key is designed for browser use. Never add the EmailJS Private Key, Gmail password, or any app password to this repository.

## 4. Security checks before enabling

- In EmailJS account security, whitelist the exact published portfolio origin. For this GitHub Pages site, use `https://saifii007.github.io` if EmailJS origin restrictions accept host origins; also test from the published project page.
- Enable the strongest available anti-bot protection for the account/template, such as reCAPTCHA if supported by your plan.
- Review EmailJS rate limits and usage regularly. The form has basic client-side validation, a hidden honeypot field, and a local cooldown, but client-side checks alone cannot stop abuse.
- Send a real test from the deployed portfolio and confirm the message arrives. Check Spam if needed.

Official docs: https://www.emailjs.com/docs/user-guide/connecting-email-services/ and https://www.emailjs.com/docs/tutorial/creating-contact-form/

## Current status

The front-end integration is ready, but real delivery will not work until the Gmail service and template exist in EmailJS and the three identifiers are configured. The contact page keeps a direct email fallback visible.
