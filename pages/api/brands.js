import { Brand } from "@/models/Brand";
import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import slugify from "slugify";


export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    res.json(await Brand.find().sort({ _id: -1 }));
  }

  if (method === "POST") {
    const { name, images } = req.body;
    const brandDoc = await Brand.create({
      name,
      images,
      slug: slugify(name, { lower: true }),
    });
    res.json(brandDoc);
  }

  if (method === "PUT") {
    const { name, images,  _id } = req.body;
    const brandDoc = await Brand.updateOne(
      { _id },
      {
        name,
        images,
        slug: slugify(name, { lower: true }),
      }
    );
    res.json(brandDoc);
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    await Brand.deleteOne({ _id });
    res.json("ok");
  }
}