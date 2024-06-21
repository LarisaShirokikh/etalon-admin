import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import slugify from "slugify";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(
        await Product.findOne({ _id: req.query.id }).populate("catalog")
      );
    } else {
      res.json(await Product.find().sort({ _id: -1 }).populate("catalog"));
    }
  }

  if (method === "POST") {
    const {
      title,
      description,
      price,
      images,
      category,
      catalog, // добавьте это поле
      design,
      contours,
      insulation,
      thickness,
      mainLock,
      additionalLock,
      exterior,
      interior,
      loops,
      protection,
    } = req.body;

    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category,
      catalog, // добавьте это поле
      design,
      contours,
      insulation,
      thickness,
      mainLock,
      additionalLock,
      exterior,
      interior,
      loops,
      protection,
      slug: slugify(title, { lower: true }),
    });
    res.json(productDoc);
  }

  if (method === "PUT") {
    const {
      title,
      description,
      price,
      images,
      category,
      catalog, // добавьте это поле
      design,
      contours,
      insulation,
      thickness,
      mainLock,
      additionalLock,
      exterior,
      interior,
      loops,
      protection,
      _id,
    } = req.body;

    await Product.updateOne(
      { _id },
      {
        title,
        description,
        price,
        images,
        category,
        catalog, // добавьте это поле
        design,
        contours,
        insulation,
        thickness,
        mainLock,
        additionalLock,
        exterior,
        interior,
        loops,
        protection,
        slug: slugify(title, { lower: true }),
      }
    );
    res.json(true);
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query?.id });
      res.json(true);
    }
  }
}
