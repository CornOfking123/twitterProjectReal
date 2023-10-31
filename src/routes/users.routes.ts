import { Router } from 'express'
import {
  emailVerifyTokenController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'
const usersRouter = Router()
// controller
usersRouter.get('/login', loginValidator, wrapAsync(loginController))
usersRouter.post('/register', registerValidator, wrapAsync(registerController))
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
des: verify email token
khi người dùng đăng ký họ sẽ nhận dc mail có link dang5

nếu mà em nhấp vào link thì sẽ tạo ra req gửi lên email_verify_token lên server
server kiểm tra email_verify_token có hợp lệ hay không
thì từ decoded_email_verify_token lấy ra user_id
và vào user_id đó để update email_verify_token thành ''. verify = 1, update_at
path: /users/verify_email
method: POST
body: {email_verify_token: string}
*/
usersRouter.post('/verify_email', emailVerifyTokenValidator, wrapAsync(emailVerifyTokenController))
/*
des: resend email verify token
khi mail thất lạc, hoặc email_verify_token hết hạn, thì người dùng có
nhu cấu resend email_verify_token
method: POST
path: /users/resend-email-verify-token
headers: {authorization: "Bearer <access_token>" } // đăng nhập mới dcc resend
*/
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))
export default usersRouter
