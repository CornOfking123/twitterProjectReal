import fs from 'fs' //thư viện giúp handle các đường dẫn
import path from 'path'
import { Request } from 'express'
import formidable from 'formidable'
import { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'

export const initFolder = () => {
  //nếu không có đường dẫn 'TwitterProject/uploads' thì tạo ra
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //cho phép tạo folder nested vào nhau
        //uploads/image/bla bla bla
      }) //mkdirSync: giúp tạo thư mục
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_TEMP_DIR), //lưu ở đâu
    maxFiles: 4, //tối đa bao nhiêu
    keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg
    maxFileSize: 300 * 1024, //tối đa bao nhiêu byte, 300kb
    //xài option filter để kiểm tra file có phải là image không
    filter: function ({ name, originalFilename, mimetype }) {
      //name: name|key truyền vào của <input name = bla bla>
      //originalFilename: tên file gốc
      //mimetype: kiểu file vd: image/png
      console.log(name, originalFilename, mimetype) //log để xem, nhớ comment

      const valid = name === 'image' && Boolean(mimetype?.includes('image/'))
      //mimetype? nếu là string thì check, k thì thôi
      //ép Boolean luôn, nếu k thì valid sẽ là boolean | undefined

      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      //nếu đúng thì return valid
      return valid
    }
  })
  //form.parse về thành promise
  //files là object có dạng giống hình test code cuối cùng
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err) //để ý dòng này
      if (!files.image) {
        return reject(new Error('Image is empty'))
      }
      return resolve(files.image as File[])
    })
  })
}
export const getNameFromFullname = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop() //xóa phần tử cuối cùng, tức là xóa đuôi .png
  return nameArr.join('') //nối lại thành chuỗi
}
export const getExtension = (filename: string) => {
  const nameArr = filename.split('.')
  return nameArr[nameArr.length - 1]
}

export const handleUploadVideo = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_VIDEO_DIR), //vì video nên mình không đi qua bước xử lý trung gian nên mình sẽ k bỏ video vào temp
    maxFiles: 1, //tối đa bao nhiêu
    // keepExtensions: true, //có lấy đuôi mở rộng không .png, .jpg "nếu file có dạng asdasd.app.mp4 thì lỗi, nên mình sẽ xử lý riêng
    maxFileSize: 50 * 1024 * 1024, //tối đa bao nhiêu byte, 50MB
    //xài option filter để kiểm tra file có phải là video không
    filter: function ({ name, originalFilename, mimetype }) {
      const valid = name === 'video' && Boolean(mimetype?.includes('video/'))
      //nếu sai valid thì dùng form.emit để gữi lỗi
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid') as any)
        //as any vì bug này formidable chưa fix, khi nào hết thì bỏ as any
      }
      return valid
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      //files.video k phải image nha
      if (!files.video) {
        return reject(new Error('video is empty'))
      }
      //vì k xài keepExtensions nên file sau khi xử lý xong
      // của mình sẽ k có đuôi mở rộng, mình sẽ rename nó để lắp đuôi cho nó
      const videos = files.video as File[]
      videos.forEach((video) => {
        const ext = getExtension(video.originalFilename as string) //lấy đuôi mở rộng của file cũ
        //filepath là đường dẫn đến tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        fs.renameSync(video.filepath, video.filepath + '.' + ext) //rename lại đường dẫn tên file để thêm đuôi
        video.newFilename = video.newFilename + '.' + ext //newFilename là tên file mới đã mất đuôi mở rộng do k dùng keepExtensions
        //lưu lại tên file mới để return ra bên ngoài, thì method uploadVideo khỏi cần thêm đuôi nữa
      })
      resolve(files.video as File[])
    })
  })
}
