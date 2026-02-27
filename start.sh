#!/bin/bash

# 1. Get first IP address
IP=$(hostname -I | awk '{print $1}')

if [ -z "$IP" ]; then
  echo "Could not determine IP address."
  exit 1
fi

echo "Detected IP: $IP"

FILE="config/env.ts"

if [ ! -f "$FILE" ]; then
  echo "File $FILE not found!"
  exit 1
fi

# 2. Replace the IP inside the URL (keep protocol and port)
# This assumes format: export const API_BASE_URL = "http://<ip>:<port>";
sed -i -E "s#(http://)[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(:[0-9]+)#\1${IP}\2#" "$FILE"

echo "Updated API_BASE_URL in $FILE"

# 3. Start Expo
npx expo start