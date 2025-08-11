#!/bin/bash
set -e  

OUTPUT_FILE="nxuid.tar.gz"

FILES_TO_PACKAGE="dist package.json node_modules"

echo "Criando o pacote $OUTPUT_FILE com: $FILES_TO_PACKAGE"

tar -czf $OUTPUT_FILE $FILES_TO_PACKAGE

echo "Pacote criado com sucesso: $OUTPUT_FILE"
