import { createHash } from 'crypto'
import { config } from 'dotenv'
// tạo 1 hàm nhận vào chuỗi là mã háo theo chuẩn sha256

function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

// hàm nhận vào password và trả về pw đã mã hóa
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
