import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (file) => {
  const parser = new DataUriParser();
  // remove the dot from extension
  const extName = path.extname(file.originalname).slice(1);
  return parser.format(extName, file.buffer);
};

export default getDataUri;
