export interface Day7EmailData {
  name: string;
  product_name: string;
  next_product_name: string;
  next_product_link: string;
  unsubscribe_link: string;
}

export function getDay7Template(data: Day7EmailData) {
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
    .comparison {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
    }
    .comparison h3 {
      margin: 0 0 16px 0;
      color: #030048;
      font-size: 18px;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 16px;
    }
    .comparison-item {
      text-align: center;
      padding: 16px;
      background: white;
      border-radius: 8px;
    }
    .comparison-item h4 {
      margin: 0 0 8px 0;
      color: #6C5CE7;
      font-size: 16px;
    }
    .comparison-item p {
      margin: 0;
      font-size: 14px;
      color: #666;
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
    .highlight {
      background: #fff8e1;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #f57c00;
      margin: 24px 0;
      text-align: center;
    }
    .highlight p {
      margin: 0;
      font-size: 18px;
      color: #f57c00;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Ready to take it to the next level? 🚀</h1>
    </div>

    <div class="content">
      <p>Hi ${data.name},</p>

      <p>It's been a week since you completed the <strong>${data.product_name}</strong>. I hope you found clarity in your brand blueprint!</p>

      <p>If you're ready to go deeper and map your complete business structure, profit paths, and expansion strategy, the next step is here:</p>

      <div class="comparison">
        <h3>How the Products Work Together:</h3>

        <div class="comparison-grid">
          <div class="comparison-item">
            <h4>✅ You Completed</h4>
            <p>${data.product_name}</p>
            <p style="margin-top: 8px; font-size: 13px;">Brand positioning & energetic alignment</p>
          </div>

          <div class="comparison-item">
            <h4>🎯 Next Step</h4>
            <p>${data.next_product_name}</p>
            <p style="margin-top: 8px; font-size: 13px;">Business structure & profit strategy</p>
          </div>
        </div>
      </div>

      <p><strong>What You'll Get:</strong></p>

      <ul>
        <li><strong>Clarity on your anchor business</strong> – What should you focus on first?</li>
        <li><strong>Your profit paths</strong> – How you'll earn within the Quantum ecosystem</li>
        <li><strong>Expansion strategy</strong> – How to prioritize multiple ideas without chaos</li>
        <li><strong>Disciplined scale plan</strong> – Sequence over speed, contribution before opportunity</li>
      </ul>

      <hr>

      <p><strong>This is for you if:</strong></p>

      <ul>
        <li>You have multiple business ideas and need to prioritize</li>
        <li>You're unsure how to monetize within the Quantum Network</li>
        <li>You want a strategic roadmap, not just inspiration</li>
        <li>You're ready to build with discipline, not distraction</li>
      </ul>

      <div class="highlight">
        <p>20-30 minute guided orientation • $14 one-time access</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.next_product_link}" class="button">Map Your Complete Strategy</a>
      </div>

      <p style="font-size: 14px; color: #666; text-align: center;">
        <em>Requires ChatGPT Plus ($20/mo from OpenAI)</em>
      </p>

      <p style="margin-top: 30px;">
        Questions? Just reply to this email.
      </p>

      <p style="margin-top: 24px;">
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
Ready to take it to the next level?

Hi ${data.name},

It's been a week since you completed the ${data.product_name}. I hope you found clarity in your brand blueprint!

If you're ready to go deeper and map your complete business structure, profit paths, and expansion strategy, the next step is here:

HOW THE PRODUCTS WORK TOGETHER:

✅ You Completed: ${data.product_name}
   Brand positioning & energetic alignment

🎯 Next Step: ${data.next_product_name}
   Business structure & profit strategy

---

WHAT YOU'LL GET:

- Clarity on your anchor business – What should you focus on first?
- Your profit paths – How you'll earn within the Quantum ecosystem
- Expansion strategy – How to prioritize multiple ideas without chaos
- Disciplined scale plan – Sequence over speed, contribution before opportunity

---

THIS IS FOR YOU IF:

- You have multiple business ideas and need to prioritize
- You're unsure how to monetize within the Quantum Network
- You want a strategic roadmap, not just inspiration
- You're ready to build with discipline, not distraction

20-30 minute guided orientation • $14 one-time access

Map Your Complete Strategy: ${data.next_product_link}

(Requires ChatGPT Plus - $20/mo from OpenAI)

Questions? Just reply to this email.

– Austin
Quantum Strategies

---
Quantum Strategies by Xuberan Digital
quantumstrategies.online

Unsubscribe: ${data.unsubscribe_link}
  `.trim();

  return {
    subject: 'Ready to map your complete strategy?',
    html,
    text,
  };
}
