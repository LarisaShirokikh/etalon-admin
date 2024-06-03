import { model, models, Schema } from "mongoose";
import slugify from "slugify";

const BrandSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  images: [{ type: String }],
});

BrandSchema.pre("save", function (next) {
  // Генерация slug из названия каталога перед сохранением
  this.slug = slugify(this.name, { lower: true });
  next();
});

export const Brand = models?.Brand || model("Brand", BrandSchema);
