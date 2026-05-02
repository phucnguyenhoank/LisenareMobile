#!/bin/bash

# 1. Lấy địa chỉ IP (dùng hostname -I cho Linux hoặc ipconfig cho Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
  IP=$(ipconfig getifaddr en0) # Cho Mac
else
  IP=$(hostname -I | awk '{print $1}') # Cho Linux/WSL
fi

if [ -z "$IP" ]; then
  echo "❌ Không tìm thấy địa chỉ IP."
  exit 1
fi

echo "✅ Detected IP: $IP"

FILE=".env"

if [ ! -f "$FILE" ]; then
  echo "❌ File $FILE không tồn tại!"
  exit 1
fi

# 2. Thay thế IP trong biến EXPO_PUBLIC_API_BASE_URL
# -E: dùng regex mở rộng
# s/old/new/g
# Tìm mẫu: http:// + dãy số IP + : + số port
sed -i -E "s|(EXPO_PUBLIC_API_BASE_URL=http://)[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(:[0-9]+)|\1${IP}\2|" "$FILE"

echo "🚀 Updated API_BASE_URL to http://${IP} in $FILE"

# 3. Khởi động Expo và xóa cache để đảm bảo nhận biến môi trường mới
npx expo start -c
