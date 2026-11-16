#!/bin/bash
# ดับเบิลคลิกเพื่อสร้างและเปิดเว็บ MVM Group จาก build/ บนเครื่องนี้
# เปิดหน้าต่าง Terminal นี้ค้างไว้ระหว่างดูเว็บ กด Ctrl+C หรือปิดหน้าต่างเมื่อดูเสร็จ
fail() {
  printf '%s\n' "$1"
  if [ -t 0 ]; then read -r -p "กด Enter เพื่อปิด"; fi
  exit 1
}
MVM_PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)" || fail "ไม่พบโฟลเดอร์เว็บไซต์"
command -v node >/dev/null 2>&1 || fail "ไม่พบ Node.js กรุณาติดตั้ง Node.js พร้อม npm แล้วลองอีกครั้ง"
command -v npm >/dev/null 2>&1 || fail "ไม่พบ npm กรุณาติดตั้ง Node.js พร้อม npm แล้วลองอีกครั้ง"
cd "$MVM_PROJECT_DIR" || fail "เปิดโฟลเดอร์เว็บไซต์ไม่สำเร็จ"
exec node "$MVM_PROJECT_DIR/scripts/serve-local.mjs" "$@"
