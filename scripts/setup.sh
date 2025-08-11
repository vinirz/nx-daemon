#!/bin/bash
set -e

APP_NAME="nxuid"
INSTALL_DIR="/opt/$APP_NAME"
SERVICE_FILE="/etc/systemd/system/$APP_NAME.service"
NODE_PATH=$(which node)

cd ../

echo "[1/5] Instalando dependências do sistema..."
if ! command -v node &> /dev/null; then
  sudo apt update && sudo apt install -y nodejs npm
fi

echo "[2/5] Localizando arquivo de instalação..."
if [ -n "$1" ]; then
  # Se o usuário passar o caminho como argumento
  TARBALL="$1"
else
  # Busca o .tar.gz mais recente
  TARBALL=$(find . -type f -name '*.tar.gz' -printf "%T@ %p\n" | sort -nr | head -n1 | cut -d' ' -f2-)
fi

if [ -z "$TARBALL" ]; then
  echo "❌ Nenhum arquivo .tar.gz encontrado. Passe o caminho como argumento."
  exit 1
fi

echo "Arquivo de instalação: $TARBALL"

echo "[3/5] Instalando aplicação..."
sudo mkdir -p "$INSTALL_DIR"
sudo tar -xzf "$TARBALL" -C "$INSTALL_DIR"

echo "[4/5] Criando serviço systemd..."
sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=$APP_NAME Service
After=network.target

[Service]
ExecStart=$NODE_PATH $INSTALL_DIR/dist/server/websocket.js
Restart=always
Environment=NODE_ENV=production
User=$USER
WorkingDirectory=$INSTALL_DIR

[Install]
WantedBy=multi-user.target
EOF

echo "[5/5] Ativando serviço..."
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable "$APP_NAME"
sudo systemctl restart "$APP_NAME"

echo "✅ Serviço $APP_NAME instalado e rodando."
