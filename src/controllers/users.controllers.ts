import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
export const loginController = async (req: Request, res: Response) => {
  // nếu nó vào dc đây, tức là nó đã đăng nhập thành công
  const { user }: any = req
  const user_id = user._id // objectID
  // server phải tạo ra access_token và refesh_token để sau này khỏi đăng nhập nữa
  const result = await usersService.login(user_id.toString())
  return res.json({
    message: 'Login successfully',
    result
  })
}
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: 'Register successfully',
    result
  })
}