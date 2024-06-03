import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import {
  fetchCategories,
  uploadImages,
  handleImageUrlChange,
  handleRemoveImage,
  updateImagesOrder,
  fetchCatalogs,
  fetchBrands,
} from "@/utils/function";

function Catalogs({ swal }) {
  const [editedCatalog, setEditedCatalog] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [parents, setParentCategories] = useState([]);
  const [catalogs, setCatalogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [properties, setProperties] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [brands, setBrands] = useState([]); // Состояние для брендов
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      await fetchCatalogs(setCatalogs);
      await fetchCategories(setCategories);
      await fetchBrands(setBrands);
    };

    fetchData();
  }, []);

  async function saveCatalog(ev) {
    ev.preventDefault();

    const finalImages = [...images];
    if (imageUrl.trim() !== "") {
      finalImages.push(imageUrl);
    }

    const data = {
      name,
      images: finalImages,
      description,
      price: parseFloat(price),
      brand: selectedBrand,
      parents,
      properties: properties.map((p) => ({
        name: p.name.trim(),
        values: p.values
          .trim()
          .split(",")
          .map((value) => value.trim()),
      })),
    };
    console.log("data", data);
    if (editedCatalog) {
      data._id = editedCatalog._id;
      await axios.put("/api/catalogs", data);
      setEditedCatalog(null);
    } else {
      await axios.post("/api/catalogs", data);
    }
    setName("");
    setDescription("");
    setImages([]);
    setPrice("");
    setSelectedBrand("");
    setImagePreviewUrl("");
    setParentCategories([]);
    setProperties([]);
    fetchCatalogs(setCatalogs);
  }

  function editCatalog(catalog) {
    setEditedCatalog(catalog);
    setName(catalog.name);
    setDescription(catalog.description || "");
    setImages(catalog.images || []);
    setParentCategories(
      catalog.parents ? catalog.parents.map((category) => category._id) : []
    );
    setProperties(
      catalog.properties.map(({ name, values }) => ({
        name,
        values: values.join(","),
      }))
    );
  }

  function deleteCatalog(catalog) {
    swal
      .fire({
        title: "Вы уверены?",
        text: `Вы хотите удалить ${catalog.name}?`,
        showCancelButton: true,
        cancelButtonText: "Отменить",
        confirmButtonText: "Да! Удалить!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = catalog;
          await axios.delete("/api/catalogs?_id=" + _id);
          fetchCatalogs();
        }
      });
  }

  function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  }

  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties((prev) => {
      return [...prev].filter((p, pIndex) => {
        return pIndex !== indexToRemove;
      });
    });
  }

  useEffect(() => {
    if (imageUrl.trim() !== "") {
      setTimeout(() => {
        setImages((oldImages) => [...oldImages, imageUrl]);
        setImageUrl("");
        setImagePreviewUrl("");
      }, 500); // Add a delay to avoid flickering
    }
  }, [imageUrl]);

  const handleCategoryChange = (ev) => {
    const selectedOptions = Array.from(
      ev.target.selectedOptions,
      (option) => option.value
    );
    setParentCategories(selectedOptions);
  };

  return (
    <Layout>
      <h1>Каталоги</h1>
      <label>
        {editedCatalog
          ? `Редактировать ${editedCatalog.name}`
          : "Создать новую категорию"}
      </label>
      <form onSubmit={saveCatalog}>
        <div className="mb-2 flex flex-wrap gap-1">
          <input
            type="text"
            placeholder="Название каталога"
            onChange={(ev) => setName(ev.target.value)}
            value={name}
          />
        </div>
        <label>Описание</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <textarea
            placeholder="Description"
            onChange={(ev) => setDescription(ev.target.value)}
            value={description}
          />
        </div>
        <label>Стоимость от..</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <input
            type="number"
            onChange={(ev) => setPrice(ev.target.value)}
            value={price}
          />
        </div>

        <label>Фотографии</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <ReactSortable
            list={images}
            className="flex flex-wrap gap-1"
            setList={(newImages) => updateImagesOrder(newImages, setImages)}
          >
            {!!images?.length &&
              images.map((link, index) => (
                <div
                  key={index}
                  className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200 relative"
                >
                  <img src={link} alt="" className="rounded-lg" />
                  <button
                    onClick={() => handleRemoveImage(index, setImages)}
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
            <input
              type="file"
              onChange={(ev) => uploadImages(ev, setIsUploading, setImages)}
              className="hidden"
            />
          </label>
        </div>
        <label>URL изображения</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <input
            type="text"
            placeholder="Image URL"
            onChange={(ev) =>
              handleImageUrlChange(ev, setImageUrl, setImagePreviewUrl)
            }
            value={imageUrl}
          />
        </div>

        {imagePreviewUrl && (
          <div className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
            <img src={imagePreviewUrl} alt="Preview" className="rounded-lg" />
          </div>
        )}
        <div className="mb-2 flex flex-wrap gap-1">
          <label>Категории</label>
          <select multiple onChange={handleCategoryChange} value={parents}>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <label>Бренд</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <select
            onChange={(ev) => setSelectedBrand(ev.target.value)}
            value={selectedBrand}
          >
            <option value="">Выберите бренд</option>
            {brands.length > 0 &&
              brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
          </select>
        </div>
        <label className="block">Параметры</label>
        <div className="mb-2 flex flex-wrap gap-1">
          <button
            onClick={addProperty}
            type="button"
            className="btn-default text-sm mb-2"
          >
            Добавить еще параметры
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div key={property.name} className="flex gap-1 mb-2">
                <input
                  type="text"
                  value={property.name}
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyNameChange(index, property, ev.target.value)
                  }
                  placeholder="property name (example: color)"
                />
                <input
                  type="text"
                  className="mb-0"
                  onChange={(ev) =>
                    handlePropertyValuesChange(index, property, ev.target.value)
                  }
                  value={property.values}
                  placeholder="values, comma separated"
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-red"
                >
                  Удалить
                </button>
              </div>
            ))}
        </div>
        <div className="mb-2 flex flex-wrap gap-1">
          {editedCatalog && (
            <button
              type="button"
              onClick={() => {
                setEditedCatalog(null);
                setName("");
                setDescription("");
                setImages("");
                setParentCategories([]);
                setProperties([]);
              }}
              className="btn-default"
            >
              Отменить
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Сохранить
          </button>
        </div>
      </form>
      {!editedCatalog && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Категория</td>
              <td>Бренд</td>
              <td>Каталоги</td>
              <td>Фото</td>
            </tr>
          </thead>
          <tbody>
            {catalogs.length > 0 &&
              catalogs.map((catalog) => (
                <tr key={catalog._id}>
                  <td>{catalog.name}</td>
                  <td>{catalog.brand ? catalog.brand.name : "No brand"}</td>
                  <td>
                    {catalog.parents && catalog.parents.length > 0
                      ? catalog.parents.map((parent) => parent.name).join(", ")
                      : "Нет  категорий"}
                  </td>
                  <td style={{ display: "flex" }}>
                    {catalog.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Фото ${index + 1}`}
                        style={{
                          width: "30px",
                          height: "auto",
                          marginRight: "10px",
                        }}
                      />
                    ))}
                  </td>
                  <td>
                    <button
                      onClick={() => editCatalog(catalog)}
                      className="btn-default mr-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                      Редактировать
                    </button>
                    <button
                      onClick={() => deleteCatalog(catalog)}
                      className="btn-red"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Catalogs swal={swal} />);
