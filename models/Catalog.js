import mongoose, { model, models, Schema } from "mongoose";
import slugify from "slugify";

const CatalogSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number },
  images: [{ type: String }],
  parents: [{ type: mongoose.Types.ObjectId, ref: "Category" }],
  properties: [{ type: Object }],
  slug: { type: String, unique: true },
});

CatalogSchema.pre("save", function (next) {
  // Генерация slug из названия каталога перед сохранением
  this.slug = slugify(this.name, { lower: true });
  next();
});

export const Catalog = models?.Catalog || model("Catalog", CatalogSchema);
