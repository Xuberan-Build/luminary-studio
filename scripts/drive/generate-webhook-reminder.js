const fs = require('fs');
const path = require('path');

const expirationMs = Number(process.argv[2]);
if (!Number.isFinite(expirationMs)) {
  console.error('Usage: npm run drive:reminder -- <expirationMs>');
  process.exit(1);
}

const reminderMs = expirationMs - 7 * 24 * 60 * 60 * 1000;
const reminderDate = new Date(reminderMs);
const endDate = new Date(reminderMs + 30 * 60 * 1000);

const pad = (n) => String(n).padStart(2, '0');
const formatDate = (d) => {
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
};

const uid = `drive-webhook-renewal-${expirationMs}@quantumstrategies.online`;
const now = formatDate(new Date());
const dtStart = formatDate(reminderDate);
const dtEnd = formatDate(endDate);

const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Quantum Strategies//Drive Webhook Renewal//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${now}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:Renew Drive Webhook (Quantum Strategies)
DESCRIPTION:Renew the Google Drive webhook before expiration.\\nRun: npm run drive:register-webhook -- 0AO3cbp3lyACtUk9PVA https://quantumstrategies.online/api/webhooks/drive
END:VEVENT
END:VCALENDAR
`;

const outDir = path.resolve(__dirname, 'output');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, `drive-webhook-reminder-${expirationMs}.ics`);
fs.writeFileSync(outPath, ics);

console.log('Calendar reminder created:');
console.log(outPath);
