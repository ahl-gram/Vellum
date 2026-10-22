#!/bin/bash
set -e
# The VM ships Node 20, 21 and 22 (22 on PATH); Vellum needs 24 (package.json engines).
# 24.22.1 was the latest v24 on nodejs.org on 2026-10-22: https://nodejs.org/dist/latest-v24.x/
curl -fsSL https://nodejs.org/dist/latest-v24.x/node-v24.22.1-linux-x64.tar.xz -o /tmp/node24.tar.xz
mkdir -p /opt/node24 && tar -xJf /tmp/node24.tar.xz -C /opt/node24 --strip-components=1
# Put 24 ahead of whatever Node the VM already has on PATH, and over the top of it:
for b in node npm npx; do
  ln -sf "/opt/node24/bin/$b" "$(command -v $b)"
  ln -sf "/opt/node24/bin/$b" "/usr/local/bin/$b"
done
echo 'export PATH=/opt/node24/bin:$PATH' >> /etc/profile.d/node24.sh 2>/dev/null || true
node -v
