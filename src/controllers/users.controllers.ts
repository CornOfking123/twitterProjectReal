import { NextFunction, Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  FollowReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnfollowReqParams,
  UpdateMeReqBody,
  VerifyEmailReqBody
} from '~/models/requests/User.requests'
import { ErrorWithStatus } from '~/models/Errors'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { UserVerifyStatus } from '~/constants/enums'
export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  // nếu nó vào dc đây, tức là nó đã đăng nhập thành công
  const user = req.user as User
  const user_id = user._id as ObjectId
  // server phải tạo ra access_token và refresh_token để sau này khỏi đăng nhập nữa
  const result = await usersService.login({ user_id: user_id.toString(), verify: user.verify })
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  // lấy refresh_token từ req.body
  const { refresh_token } = req.body
  // và vào database xóa refresh_token này
  const result = await usersService.logout(refresh_token)
  res.json(result)
}

export const emailVerifyTokenController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  //nếu mà code vào dc đây nghĩa là email_verify_token hợp lệ
  // và mình đã lấy dc decoded_email_verify_token
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  // dựa vào user_id tìm uer và xem thử nó đã verify chưa
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  if (user.email_verify_token === '' && user.verify !== UserVerifyStatus.Unverified) {
    //mặc định là status 200
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  // nếu mà ko khớp với email_verify_token
  if (user.email_verify_token !== (req.body.email_verify_token as string)) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_INCORRECT,
      status: HTTP_STATUS.UNAUTHORIZED
    })
  }
  // nếu mà xuống dc đây có nghĩa là chưa verify
  // mình sẽ update lại user đó
  const result = await usersService.verifyEmail(user_id)
  res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendEmailVerifyController = async (req: Request, res: Response) => {
  // nếu vào dc đây có nghĩa là access_token hợp lệ
  // và mình đã lấy dc decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload

  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  if (user === null) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  // nếu đã verify_email rồi
  if (user.email_verify_token === '' && user.verify !== UserVerifyStatus.Verified) {
    //mặc định là status 200
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }

  if (user.verify === UserVerifyStatus.Banned) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.USER_BANNED,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  const result = await usersService.resendEmailVerify(user_id)
  //result chứa message nên ta chỉ cần trả  result về cho client
  return res.json(result)
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  // lấy user_id từ user của req
  const { _id, verify } = req.user as User
  // dùng cái _id tìm và cập nhật lại user thêm vào forgot_password_token
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify })
  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_CUCCESS
    //
  })
}
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  // xài body nên phải định nghĩa
  //vào database tìm user thông qua user_id này và cập nhật lại password mới
  const result = await usersService.resetPassword({ user_id, password })
  return res.json(result)
}
export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  // vào database tìm user_id này đưa cho client
  const result = await usersService.getMe(user_id)
  return res.json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result
  })
}
export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>,
  res: Response,
  next: NextFunction
) => {
  //middleware accessTokenValidator đã chạy rồi, nên ta có thể lấy đc user_id từ decoded_authorization
  const { user_id } = req.decoded_authorization as TokenPayload
  //user_id để biết phải cập nhật ai
  //lấy thông tin mới từ req.body
  const { body } = req
  //lấy các property mà client muốn cập nhật
  //ta sẽ viết hàm updateMe trong user.services
  //nhận vào user_id và body để cập nhật
  const result = await usersService.updateMe(user_id, body)
  return res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS, //meesage.ts thêm  UPDATE_ME_SUCCESS: 'Update me success'
    result
  })
}
export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response, next: NextFunction) => {
  const { username } = req.params //lấy username từ query params
  const result = await usersService.getProfile(username)
  return res.json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS, //message.ts thêm  GET_PROFILE_SUCCESS: 'Get profile success',
    result
  })
}
export const followController = async (
  req: Request<ParamsDictionary, any, FollowReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { followed_user_id } = req.body //lấy followed_user_id từ req.body
  const result = await usersService.follow(user_id, followed_user_id) //chưa có method này
  return res.json(result)
}
export const unfollowController = async (req: Request<UnfollowReqParams>, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload //lấy user_id từ decoded_authorization của access_token
  const { user_id: followed_user_id } = req.params //lấy user_id từ req.params là user_id của người mà ngta muốn unfollow
  const result = await usersService.unfollow(user_id, followed_user_id) //unfollow chưa làm
  return res.json(result)
}
