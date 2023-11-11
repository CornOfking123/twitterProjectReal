import { Router } from 'express'
import { wrap } from 'module'
import {
  emailVerifyTokenController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  filterMiddleware,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
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

/*
khi người dùng quên mật khẩu, họ gửi email để xin mình tạo cho họ forgot_password_token
path: /users/forgot-password
method: POST
body: (email: string)
*/
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))
/*
khi người dùng nhấp vào link trong email để reset password
họ sẽ gửi 1 req kèm theo forgot_password_token lên sv
sv sẽ kiêm3 tra có hợp lệ hay ko
sau đó chuyển hướng người dùng đến trang reset pswd

*/
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapAsync(verifyForgotPasswordTokenController)
)
/*
des: reset password
path: '/reset-password'
method: POST
Header: không cần, vì  ngta quên mật khẩu rồi, thì sao mà đăng nhập để có authen đc
body: {forgot_password_token: string, password: string, confirm_password: string}
*/
usersRouter.post(
  '/reset-password',
  resetPasswordValidator,
  verifyForgotPasswordTokenValidator,
  wrapAsync(resetPasswordController)
)
/*
des: get profile của user
path: '/me'
method: get
Header: {Authorization: Bearer <access_token>}
body: {}
*/
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  updateMeValidator,
  wrapAsync(updateMeController)
)
/*
des: get profile của user khác bằng unsername
path: '/:username'
method: get
không cần header vì, chưa đăng nhập cũng có thể xem
*/
usersRouter.get('/:username', wrapAsync(getProfileController))
/*
des: Follow someone
path: '/follow'
method: post
headers: {Authorization: Bearer <access_token>}
body: {followed_user_id: string}
*/
usersRouter.post('/follow', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))

//accessTokenValidator dùng dể kiểm tra xem ngta có đăng nhập hay chưa, và có đc user_id của người dùng từ req.decoded_authorization
//verifiedUserValidator dùng để kiễm tra xem ngta đã verify email hay chưa, rồi thì mới cho follow người khác
//trong req.body có followed_user_id  là mã của người mà ngta muốn follow
//followValidator: kiểm tra followed_user_id truyền lên có đúng định dạng objectId hay không
//  account đó có tồn tại hay không
//followController: tiến hành thao tác tạo document vào collection followers
// user id 7: 654ef0ccd1e7ba3d58762906
/*
    des: unfollow someone
    path: '/follow/:user_id'
    method: delete
    headers: {Authorization: Bearer <access_token>}
  g}
    */
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)

export default usersRouter
