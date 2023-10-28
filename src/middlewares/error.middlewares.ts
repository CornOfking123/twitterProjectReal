import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

export const defaultErrorHandle = (err: any, req: Request, res: Response, next: NextFunction) => {
  // nơi tất mà tất cả các lỗi trên hệ thống dồn về
  // console.log('error handler tổng')
  if (err instanceof ErrorWithStatus) {
    return res.status(err.status).json(omit(err, ['status']))
  }
  // nếu ko lọt vào if ở trên thì err là lỗi mặc định
  // name, message, stack cả 3 đều có enumerable = false
  Object.getOwnPropertyNames(err).forEach((key) => {
    Object.defineProperty(err, key, { enumerable: true })
  })
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    message: err.message,
    errorInfor: omit(err, ['stack'])
  })
}
