import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions, isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import slugify from "slugify";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    res.json(await Category.find().sort({ _id: -1 }));
  }

  if (method === "POST") {
    const { name, url, description, images, parentCategory, properties } =
      req.body;
    const categoryDoc = await Category.create({
      name,
      url,
      description,
      images,
      parent: parentCategory || undefined,
      properties,
      slug: slugify(name, { lower: true }),
    });
    res.json(categoryDoc);
  }

  if (method === "PUT") {
    const { name, url, description, images, parentCategory, properties, _id } =
      req.body;
    const categoryDoc = await Category.updateOne(
      { _id },
      {
        name,
        images,
        url,
        description,
        parent: parentCategory || undefined,
        properties,
        slug: slugify(name, { lower: true }),
      }
    );
    res.json(categoryDoc);
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    await Category.deleteOne({ _id });
    res.json("ok");
  }
}
