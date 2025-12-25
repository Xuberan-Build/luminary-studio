export interface Day1EmailData {
  name: string;
  product_name: string;
  gpt_link: string;
  unsubscribe_link: string;
}

export function getDay1Template(data: Day1EmailData) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #030048 0%, #1a0066 100%);
      color: #F8F5FF;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      background: #6C5CE7;
      color: white !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
    }
    .button:hover {
      background: #5b4bc4;
    }
    .tip-box {
      background: #fff8e1;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #f57c00;
      margin: 24px 0;
    }
    .tip-box h3 {
      margin: 0 0 12px 0;
      color: #f57c00;
      font-size: 18px;
    }
    .footer {
      background: #f8f9fa;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .footer a {
      color: #6C5CE7;
      text-decoration: none;
    }
    hr {
      border: none;
      border-top: 1px solid #eee;
      margin: 30px 0;
    }
    ul {
      margin: 16px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Just checking in... 👋</h1>
    </div>

    <div class="content">
      <p>Hi ${data.name},</p>

      <p>You purchased <strong>${data.product_name}</strong> yesterday, and I wanted to make sure you were able to access your custom GPT successfully.</p>

      <p><strong>Did you run into any issues?</strong></p>

      <ul>
        <li>Can't find the email with your access link?</li>
        <li>Don't have ChatGPT Plus yet?</li>
        <li>Need help getting started?</li>
      </ul>

      <p>Just reply to this email and I'll personally help you get set up.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.gpt_link}" class="button">Access Your GPT Now</a>
      </div>

      <hr>

      <div class="tip-box">
        <h3>💡 Quick Tip:</h3>
        <p style="margin: 0;">The GPT works best when you answer thoughtfully. Don't rush through the questions—your responses shape the quality of your blueprint.</p>
      </div>

      <p style="margin-top: 30px;">
        – Austin<br>
        <em>Quantum Strategies</em>
      </p>
    </div>

    <div class="footer">
      <p><strong>Quantum Strategies</strong> by Xuberan Digital</p>
      <p>
        <a href="https://www.quantumstrategies.online">quantumstrategies.online</a>
      </p>
      <p style="margin-top: 16px;">
        <a href="${data.unsubscribe_link}">Unsubscribe from follow-up emails</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Just checking in...

Hi ${data.name},

You purchased ${data.product_name} yesterday, and I wanted to make sure you were able to access your custom GPT successfully.

Did you run into any issues?

- Can't find the email with your access link?
- Don't have ChatGPT Plus yet?
- Need help getting started?

Just reply to this email and I'll personally help you get set up.

Access Your GPT: ${data.gpt_link}

QUICK TIP:
The GPT works best when you answer thoughtfully. Don't rush through the questions—your responses shape the quality of your blueprint.

– Austin
Quantum Strategies

---
Quantum Strategies by Xuberan Digital
quantumstrategies.online

Unsubscribe: ${data.unsubscribe_link}
  `.trim();

  return {
    subject: `Quick question: Did you access your ${data.product_name} yet?`,
    html,
    text,
  };
}
