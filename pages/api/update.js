import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { authOptions, isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    res.json(
      await Category.find()
        .sort({ _id: -1 })
        .populate("brand")
        .populate("parents")
    );
  }

  if (method === "POST") {
    const { productIds, categoryIds } = req.body;


    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Некорректные идентификаторы продуктов",
      });
    }

    if (
      !categoryIds ||
      !Array.isArray(categoryIds) ||
      categoryIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Некорректные идентификаторы категорий",
      });
    }

    try {
      // Обновляем категории для указанных продуктов
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $addToSet: { category: { $each: categoryIds } } }
      );

      res.json({
        success: true,
        message: "Категории продуктов успешно обновлены",
      });
    } catch (error) {
      console.error("Ошибка при обновлении категорий продуктов:", error);
      res.status(500).json({
        success: false,
        message: "Ошибка при обновлении категорий продуктов",
      });
    }
  }
}
