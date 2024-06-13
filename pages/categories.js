import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import {
  uploadImages,
  handleImageUrlChange,
  handleRemoveImage,
  updateImagesOrder,
} from "@/utils/function";

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [images, setImages] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }
  async function saveCategory(ev) {
    ev.preventDefault();

    const finalImages = [...images];
    if (imageUrl.trim() !== "") {
      finalImages.push(imageUrl);
    }

    const data = {
      name,
      images: finalImages,
      url,
      description,
      parentCategory,
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      await axios.post("/api/categories", data);
    }
    setName("");
    setDescription("");
    setUrl("");
    setImages([]);
    setImagePreviewUrl("");
    setParentCategory("");
    fetchCategories();
  }

  

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
    setDescription(category.description || "");
    setUrl(category.url || "");
    setImages(category.images || []);
    setParentCategory(category.parent?._id);
  }

  function deleteCategory(category) {
    swal
      .fire({
        title: "Вы уверены?",
        text: `Вы хотите удалить ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: "Отменить",
        confirmButtonText: "Да! Удалить!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/categories?_id=" + _id);
          fetchCategories();
        }
      });
  }

  // function addProperty() {
  //   setProperties((prev) => {
  //     return [...prev, { name: "", values: "" }];
  //   });
  // }

  

  // function removeProperty(indexToRemove) {
  //   setProperties((prev) => {
  //     return [...prev].filter((p, pIndex) => {
  //       return pIndex !== indexToRemove;
  //     });
  //   });
  // }

  

  useEffect(() => {
    if (imageUrl.trim() !== "") {
      setTimeout(() => {
        setImages((oldImages) => [...oldImages, imageUrl]);
        setImageUrl("");
        setDescription("");
        setImagePreviewUrl("");
      }, 500); 
    }
  }, [imageUrl]);

  

  return (
    <Layout>
      <h1>Категории</h1>
      <label>
        {editedCategory
          ? `Редактировать ${editedCategory.name}`
          : "Создать новую категорию"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="mb-2 flex flex-wrap gap-1">
          <input
            type="text"
            placeholder="Category name"
            onChange={(ev) => setName(ev.target.value)}
            value={name}
          />
        </div>

        <div className="mb-2 flex flex-wrap gap-1">
          <input
            type="text"
            placeholder="Ссылка на страницу сайта"
            onChange={(ev) => setUrl(ev.target.value)}
            value={url}
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

        {/* <div className="mb-2 flex flex-wrap gap-1">
          <select
            onChange={(ev) => setParentCategory(ev.target.value)}
            value={parentCategory}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div> */}
        {/* <label className="block">Параметры</label>
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
        </div> */}
        <div className="mb-2 flex flex-wrap gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setDescription("");
                setImages([]);
                setParentCategory("");
                //setProperties([]);
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
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Категория</td>
              {/* <td>Parent category</td> */}
              <td>Фото</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category._id}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td style={{ display: "flex" }}>
                    {category.images.map((image, index) => (
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
                      onClick={() => editCategory(category)}
                      className="btn-default mr-1"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
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

export default withSwal(({ swal }, ref) => <Categories swal={swal} />);
