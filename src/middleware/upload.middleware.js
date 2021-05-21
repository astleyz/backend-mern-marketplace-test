import multer from 'multer';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import config from '../config.js';

const { UPLOAD_DESTIONATION, ALLOWED_MIME_TYPES } = config.constant;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, `${UPLOAD_DESTIONATION}/`);
  },
  filename(req, file, cb) {
    const ext = ALLOWED_MIME_TYPES[file.mimetype];
    const date = moment().format('DDMMYYYY-HHmmss-SSS');
    const filename = `${date}_${uuid()}.${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = ALLOWED_MIME_TYPES[file.mimetype];
  if (!ext) return cb('Not allowed Mime-Type', null);
  cb(null, true);
};

const limits = {
  fileSize: 1024 * 1024 * 5, // 5mb
};

const upload = multer({ storage, fileFilter, limits });

export default upload;
