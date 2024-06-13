import mongoose, { model, Schema, models } from "mongoose";
import slugify from "slugify";

const PriceSchema = new Schema({
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
});

const VariantSchema = new Schema({
  name: { type: String, required: true },
  options: [{ type: String, required: true }],
});

const ProductOptionSchema = new Schema({
  name: { type: String, required: true },
  values: [{ type: String, required: true }],
});

const AdditionalInfoSectionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, required: true },
    description: String,
    price: { type: PriceSchema, required: true },
    images: [{ type: String }],
    // parents: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    category: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    catalog: [{ type: Schema.Types.ObjectId, ref: "Catalog" }],
    design: { type: String },
    contours: { type: String },
    insulation: { type: String },
    thickness: { type: String },
    mainLock: { type: String },
    additionalLock: { type: String },
    exterior: { type: String },
    interior: { type: String },
    loops: { type: String },
    protection: { type: String },
    variants: [VariantSchema],
    productOptions: [ProductOptionSchema],
    additionalInfoSections: [AdditionalInfoSectionSchema],
  },
  {
    timestamps: true,
  }
);

ProductSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("title")) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

export const Product = models.Product || model("Product", ProductSchema);
