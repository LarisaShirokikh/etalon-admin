import mongoose, { model, models, Schema } from "mongoose";
import slugify from "slugify";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: String,
  images: [{ type: String }],
  properties: [{ type: Object }],
});

CategorySchema.pre("save", function (next) {
  // Генерация slug из названия каталога перед сохранением
  this.slug = slugify(this.name, { lower: true });
  next();
});

export const Category = models?.Category || model("Category", CategorySchema);
