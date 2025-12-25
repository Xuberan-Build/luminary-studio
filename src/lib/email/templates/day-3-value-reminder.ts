export interface Day3EmailData {
  name: string;
  product_name: string;
  gpt_link: string;
  unsubscribe_link: string;
}

export function getDay3Template(data: Day3EmailData) {
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
    .use-case {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 24px 0;
      border-left: 4px solid #6C5CE7;
    }
    .use-case h3 {
      margin: 0 0 12px 0;
      color: #030048;
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
      <h1>Here's what others are discovering ✨</h1>
    </div>

    <div class="content">
      <p>Hi ${data.name},</p>

      <p>It's been a few days since you got access to <strong>${data.product_name}</strong>. I wanted to share what other members are discovering when they use it.</p>

      <div class="use-case">
        <h3>🎯 Clarity on Positioning</h3>
        <p>"I've been trying to figure out my niche for months. The GPT helped me see patterns in my work I never noticed before. Now my messaging feels authentic and clear." – Sarah, Brand Strategist</p>
      </div>

      <div class="use-case">
        <h3>💡 Strategic Confidence</h3>
        <p>"Having my blueprint mapped to my actual design gave me permission to build my business MY way. I'm not following someone else's formula anymore." – Marcus, Business Coach</p>
      </div>

      <div class="use-case">
        <h3>🚀 Aligned Action</h3>
        <p>"I finally know WHAT to focus on and WHY. No more shiny object syndrome. I have a filter for every decision now." – Jen, Course Creator</p>
      </div>

      <hr>

      <p><strong>Pro Tips for Getting the Most Value:</strong></p>

      <ul>
        <li><strong>Go deep:</strong> Answer questions thoroughly, not just surface-level</li>
        <li><strong>Be honest:</strong> The more real you are, the better your blueprint</li>
        <li><strong>Take notes:</strong> Screenshot or copy your results for reference</li>
        <li><strong>Revisit it:</strong> Your GPT is always available – use it whenever you need clarity</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.gpt_link}" class="button">Access Your GPT</a>
      </div>

      <p>Have questions or want to share what you discovered? Just reply to this email – I read every response.</p>

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
Here's what others are discovering...

Hi ${data.name},

It's been a few days since you got access to ${data.product_name}. I wanted to share what other members are discovering when they use it.

CLARITY ON POSITIONING:
"I've been trying to figure out my niche for months. The GPT helped me see patterns in my work I never noticed before. Now my messaging feels authentic and clear." – Sarah, Brand Strategist

STRATEGIC CONFIDENCE:
"Having my blueprint mapped to my actual design gave me permission to build my business MY way. I'm not following someone else's formula anymore." – Marcus, Business Coach

ALIGNED ACTION:
"I finally know WHAT to focus on and WHY. No more shiny object syndrome. I have a filter for every decision now." – Jen, Course Creator

---

PRO TIPS FOR GETTING THE MOST VALUE:

- Go deep: Answer questions thoroughly, not just surface-level
- Be honest: The more real you are, the better your blueprint
- Take notes: Screenshot or copy your results for reference
- Revisit it: Your GPT is always available – use it whenever you need clarity

Access Your GPT: ${data.gpt_link}

Have questions or want to share what you discovered? Just reply to this email – I read every response.

– Austin
Quantum Strategies

---
Quantum Strategies by Xuberan Digital
quantumstrategies.online

Unsubscribe: ${data.unsubscribe_link}
  `.trim();

  return {
    subject: `Here's what others are discovering with ${data.product_name}`,
    html,
    text,
  };
}
