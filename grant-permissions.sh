#!/bin/bash

# Grant Editor role to Drive service account
gcloud projects add-iam-policy-binding quantum-gpt-assistant \
  --member="serviceAccount:quantum-drive-assist@quantum-gpt-assistant.iam.gserviceaccount.com" \
  --role="roles/editor"

echo "✅ Permissions granted!"
