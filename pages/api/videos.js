import { mongooseConnect } from "@/lib/mongoose";
import { Video } from "@/models/Video";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import slugify from "slugify";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Video.findOne({ _id: req.query.id }).populate("catalog"));
    } else {
      res.json(await Video.find().sort({ _id: -1 }).populate("catalog"));
    }
  }

  if (method === "POST") {
    const {
      title,
      description,
      price,
      video,
      parents,
      category,
      catalog,
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

    const videoDoc = await Video.create({
      title,
      description,
      price,
      video,
      parents,
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
    res.json(videoDoc);
  }

  if (method === "PUT") {
    const {
      title,
      description,
      price,
      video,
      parents,
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

    await Video.updateOne(
      { _id },
      {
        title,
        description,
        price,
        video,
        parents,
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
      await Video.deleteOne({ _id: req.query?.id });
      res.json(true);
    }
  }
}
