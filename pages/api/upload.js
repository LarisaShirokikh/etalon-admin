import multiparty from "multiparty";
import fs from "fs";
import path from "path";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (req.method === "POST") {
    const form = new multiparty.Form();
    console.log("form", form);
    const { fields, files, url } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const links = [];

    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (files?.file?.length > 0) {
      for (const file of files.file) {
        const ext = file.originalFilename.split(".").pop();
        const newFilename = `${Date.now()}.${ext}`;
        const filePath = path.join(uploadDir, newFilename);

        const readStream = fs.createReadStream(file.path);
        const writeStream = fs.createWriteStream(filePath);
        readStream.pipe(writeStream);

        await new Promise((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        const link = `/uploads/${newFilename}`;
        links.push(link);
      }
    }

    if (fields.imageUrl?.length > 0) {
      for (const url of fields.imageUrl) {
        if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });
          const ext = url.split(".").pop().split("?")[0];
          const newFilename = `${Date.now()}.${ext}`;
          const filePath = path.join(uploadDir, newFilename);

          fs.writeFileSync(filePath, response.data);

          const link = `/uploads/${newFilename}`;
          links.push(link);
        }
      }
    }
    console.log("Links generated: ", links);
    return res.json({ links });
  }

  res.status(405).end();
}

export const config = {
  api: { bodyParser: false },
};
