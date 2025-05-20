import {
  commonHeaders,
  handleErrorsDecorator,
} from "@ejfdelgado/ejflab-back/srv/Network.mjs";
import * as multer from "multer";

const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024;
const upload = multer.default({
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    fieldSize: MAX_FILE_SIZE_BYTES,
  },
});

export class FeedbackSrv {
  static configure(app) {
    //app.get("/srv/rac/index", [commonHeaders, handleErrorsDecorator(RACServices.index),]);
  }
}
