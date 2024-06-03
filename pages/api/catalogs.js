import { mongooseConnect } from "@/lib/mongoose";
import { Catalog } from "@/models/Catalog";
import { authOptions, isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import slugify from "slugify";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    res.json(
      await Catalog.find()
        .sort({ _id: -1 })
        .populate("brand")
        .populate("parents")
    );
  }

  if (method === "POST") {
    const { name, description, price, images, parents, brand, properties } = req.body;
    const catalogDoc = await Catalog.create({
      name,
      description,
      price,
      images,
      parents,
      brand,
      properties,
      slug: slugify(name, { lower: true }),
    });
    res.json(catalogDoc);
  }

  if (method === "PUT") {
    const { name, description, images, price, parents, brand, properties, _id } =
      req.body;

    const catalogDoc = await Catalog.updateOne(
      { _id },
      {
        name,
        description,
        images,
        price,
        parents,
        brand,
        properties,
        slug: slugify(name, { lower: true }),
      }
    );
    res.json(catalogDoc);
  }

  if (method === "DELETE") {
    const { _id } = req.query;
    await Catalog.deleteOne({ _id });
    res.json("ok");
  }
}
