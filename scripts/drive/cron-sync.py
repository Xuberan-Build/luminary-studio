import json
import os
import urllib.request

cron_secret = os.environ.get('CRON_SECRET')
base_url = os.environ.get('NEXT_PUBLIC_SITE_URL')

if not cron_secret:
    raise SystemExit('Missing CRON_SECRET')
if not base_url:
    raise SystemExit('Missing NEXT_PUBLIC_SITE_URL')

url = base_url.rstrip('/') + '/api/cron/drive-index'

req = urllib.request.Request(url)
req.add_header('Authorization', f'Bearer {cron_secret}')

with urllib.request.urlopen(req) as resp:
    data = resp.read().decode('utf-8')
    print(data)
