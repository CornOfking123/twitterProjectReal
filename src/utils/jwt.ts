import { resolve4 } from 'dns'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '~/models/requests/User.requests'

// làm hàm nhận vào payload, privateKey, options từ đó kí tên

export const signToken = ({
  payload,
  privateKey,
  options = { algorithm: 'HS256' }
}: {
  payload: string | object | Buffer
  privateKey: string
  options: jwt.SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) throw reject(err) // reject vì nó phục vụ cho mình
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretOrPublicKey }: { token: string; secretOrPublicKey: string }) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey, (err, decoded) => {
      //decode là payload
      if (err) throw reject(err)
      resolve(decoded as TokenPayload)
    })
  })
}
