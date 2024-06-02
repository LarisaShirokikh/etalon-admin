import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import { fetchCategories, fetchCatalogs } from "@/utils/function";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  catalog: assignedCatalog,
  category: assignedCategory,
  design: existingDesign,
  contours: existingContours,
  insulation: existingInsulation,
  thickness: existingThickness,
  mainLock: existingMainLock,
  additionalLock: existingAdditionalLock,
  exterior: existingExterior,
  interior: existingInterior,
  loops: existingLoops,
  protection: existingProtection,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [catalog, setCatalog] = useState(assignedCatalog || "");
  const [selectedCategories, setSelectedCategories] = useState(
    assignedCategory || []
  );
  const [price, setPrice] = useState(existingPrice?.price || "");
  const [discountedPrice, setDiscountedPrice] = useState(
    existingPrice?.discountedPrice || ""
  );
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [catalogs, setCatalogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [design, setDesign] = useState(existingDesign || "");
  const [contours, setContours] = useState(existingContours || "");
  const [insulation, setInsulation] = useState(existingInsulation || "");
  const [thickness, setThickness] = useState(existingThickness || "");
  const [mainLock, setMainLock] = useState(existingMainLock || "");
  const [additionalLock, setAdditionalLock] = useState(
    existingAdditionalLock || ""
  );
  const [exterior, setExterior] = useState(existingExterior || "");
  const [interior, setInterior] = useState(existingInterior || "");
  const [loops, setLoops] = useState(existingLoops || "");
  const [protection, setProtection] = useState(existingProtection || "");
  const [parents, setParentCategories] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      await fetchCatalogs(setCatalogs);
      await fetchCategories(setCategories);
    };

    fetchData();
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();

    const finalImages = [...images];
    if (imageUrl.trim() !== "") {
      finalImages.push(imageUrl);
    }

    const priceData = {
      price: parseFloat(price),
      discountedPrice: parseFloat(discountedPrice),
    };

    const data = {
      title,
      description,
      price: priceData,
      images: finalImages,
      parents,
      category: selectedCategories,
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
    };

    try {
      if (_id) {
        await axios.put("/api/products", { ...data, _id });
      } else {
        await axios.post("/api/products", data);
      }
      setGoToProducts(true);
    } catch (error) {
      console.error("Failed to save product:", error);
      // Add user feedback for error
    }
  }

  if (goToProducts) {
    router.push("/products");
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append("file", file);
      }
      try {
        const res = await axios.post("/api/upload", data);
        setImages((oldImages) => [...oldImages, ...res.data.links]);
      } catch (error) {
        console.error("Image upload failed:", error);
        // Add user feedback for error
      } finally {
        setIsUploading(false);
      }
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function handleImageUrlChange(ev) {
    const url = ev.target.value;
    setImageUrl(url);
    setImagePreviewUrl(url);
  }

  useEffect(() => {
    if (imageUrl.trim() !== "") {
      setTimeout(() => {
        setImages((oldImages) => [...oldImages, imageUrl]);
        setImageUrl("");
        setImagePreviewUrl("");
      }, 500);
    }
  }, [imageUrl]);

  function handleRemoveImage(indexToRemove) {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
  }

  const handleCategoryChange = (ev) => {
    const selectedOptions = Array.from(
      ev.target.selectedOptions,
      (option) => option.value
    );
    setParentCategories(selectedOptions);
  };

  return (
    <form onSubmit={saveProduct}>
      <label>Название</label>
      <input
        type="text"
        placeholder="название"
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      />
      <label>Каталог</label>
      <select value={catalog} onChange={(ev) => setCatalog(ev.target.value)}>
        <option value="">Без каталога</option>
        {catalogs.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>

      <label>Категории</label>
      <select 
      multiple 
      onChange={handleCategoryChange} 
      value={parents}>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <label>Фотографии</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}
        >
          {images.map((link, index) => (
            <div
              key={index}
              className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200 relative"
            >
              <img src={link} alt="" className="rounded-lg" />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 6.707a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414L11.414 12l3.293 3.293a1 1 0 01-1.414 1.414L10 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L8.586 12 5.293 8.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Добавить фото</div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <label>URL изображения</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <input
          type="text"
          placeholder="Image URL"
          onChange={handleImageUrlChange}
          value={imageUrl}
        />
      </div>

      {imagePreviewUrl && (
        <div className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
          <img src={imagePreviewUrl} alt="Preview" className="rounded-lg" />
        </div>
      )}
      <label>Описание</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(ev) => setDescription(ev.target.value)}
      />
      <label>Старая цена</label>
      <input
        type="number"
        placeholder="price"
        value={price}
        onChange={(ev) => setPrice(ev.target.value)}
      />
      <label>Цена со скидкой</label>
      <input
        type="number"
        value={discountedPrice}
        onChange={(ev) => setDiscountedPrice(ev.target.value)}
      />

      <label>Конструкция</label>
      <input
        type="text"
        value={design}
        onChange={(ev) => setDesign(ev.target.value)}
      />
      <label>Контуры</label>
      <input
        type="text"
        value={contours}
        onChange={(ev) => setContours(ev.target.value)}
      />
      <label>Изоляция</label>
      <input
        type="text"
        value={insulation}
        onChange={(ev) => setInsulation(ev.target.value)}
      />
      <label>Толщина, вес</label>
      <input
        type="text"
        value={thickness}
        onChange={(ev) => setThickness(ev.target.value)}
      />
      <label>Основной замок</label>
      <input
        type="text"
        value={mainLock}
        onChange={(ev) => setMainLock(ev.target.value)}
      />
      <label>Дополнительный замок</label>
      <input
        type="text"
        value={additionalLock}
        onChange={(ev) => setAdditionalLock(ev.target.value)}
      />
      <label>Внешний вид</label>
      <input
        type="text"
        value={exterior}
        onChange={(ev) => setExterior(ev.target.value)}
      />
      <label>Внутренний вид</label>
      <input
        type="text"
        value={interior}
        onChange={(ev) => setInterior(ev.target.value)}
      />
      <label>Петли</label>
      <input
        type="text"
        value={loops}
        onChange={(ev) => setLoops(ev.target.value)}
      />
      <label>Защита</label>
      <input
        type="text"
        value={protection}
        onChange={(ev) => setProtection(ev.target.value)}
      />

      <button type="submit" className="btn-primary">
        Сохранить
      </button>
    </form>
  );
}
