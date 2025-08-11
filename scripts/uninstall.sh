#!/bin/bash
set -e

APP_NAME="nxuid"

echo "Parando serviço..."
sudo systemctl stop $APP_NAME || true
sudo systemctl disable $APP_NAME || true

echo "Removendo arquivos..."
sudo rm -f /etc/systemd/system/$APP_NAME.service
sudo rm -rf /opt/$APP_NAME

echo "Limpando systemd..."
sudo systemctl daemon-reload

echo "✅ $APP_NAME removido com sucesso."
