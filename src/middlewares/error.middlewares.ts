import { NextFunction, Request, Response } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'

export const defaultErrorHandle = (err: any, req: Request, res: Response, next: NextFunction) => {
  // nơi tất mà tất cả các lỗi trên hệ thống dồn về
  console.log('error handler tổng')
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).json(omit(err, ['status']))
}
