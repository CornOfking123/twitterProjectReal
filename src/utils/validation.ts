import { Request, Response, NextFunction } from 'express'
import { body, validationResult, ValidationChain } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  // nhận vào 1 checkschema và return ra 1 middlewares

  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req) // lấy từng kết quả check lỗi

    const errors = validationResult(req)
    if (errors.isEmpty()) {
      return next()
    }
    const errorObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorObject) {
      //lấy msg của từng lỗi ra
      const { msg } = errorObject[key]
      if (msg instanceof ErrorWithStatus && msg.status !== 422) {
        return next(msg)
      }
      // nếu xuống dc đây là lỗi 422
      entityError.errors[key] = msg
    }
    // xử lý lỗi
    next(entityError)
  }
}
