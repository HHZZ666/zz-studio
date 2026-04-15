#!/bin/zsh
cd "$(dirname "$0")"
PORT=8891
URL="http://127.0.0.1:${PORT}"

echo "Starting SU light-agent at ${URL}"
python3 -m http.server ${PORT} >/tmp/su-light-agent-server.log 2>&1 &
SERVER_PID=$!
sleep 1
open "${URL}"

echo "Server PID: ${SERVER_PID}"
echo "Log: /tmp/su-light-agent-server.log"
echo "If page not correct, open: ${URL}/index.html"
wait ${SERVER_PID}
