import jwt from 'jsonwebtoken'

// làm hàm nhận vào payload, privateKey, options từ đó kí tên

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey?: string
  options: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err) // reject vì nó phục vụ cho mình
      resolve(token as string)
    })
  })
}
