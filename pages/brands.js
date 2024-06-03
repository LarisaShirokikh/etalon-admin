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

function Brands({ swal }) {
  const [editedBrand, setEditedBrand] = useState(null);
  const [name, setName] = useState("");
  const [brands, setBrands] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const [images, setImages] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  function fetchBrands() {
    axios.get("/api/brands").then((result) => {
      setBrands(result.data);
    });
  }
  async function saveBrands(ev) {
    ev.preventDefault();

    const finalImages = [...images];
    if (imageUrl.trim() !== "") {
      finalImages.push(imageUrl);
    }

    const data = {
      name,
      images: finalImages,
    };
    if (editedBrand) {
      data._id = editedBrand._id;
      await axios.put("/api/brands", data);
      setEditedBrand(null);
    } else {
      await axios.post("/api/brands", data);
    }
    setName("");
    setImages([]);
    setImagePreviewUrl("");
    fetchBrands();
  }

  function editBrand(brand) {
    setEditedBrand(brand);
    setName(brand.name);
    setImages(brand.images || []);
  }

  function deleteBrand(brand) {
    swal
      .fire({
        title: "Вы уверены?",
        text: `Вы хотите удалить ${brand.name}?`,
        showCancelButton: true,
        cancelButtonText: "Отменить",
        confirmButtonText: "Да! Удалить!",
        confirmButtonColor: "#d55",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete("/api/brands?_id=" + _id);
          fetchBrands();
        }
      });
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

  return (
    <Layout>
      <h1>Бренды</h1>
      <label>
        {editedBrand
          ? `Редактировать ${editedBrand.name}`
          : "Создать новый бренд"}
      </label>
      <form onSubmit={saveBrands}>
        <div className="mb-2 flex flex-wrap gap-1">
          <input
            type="text"
            onChange={(ev) => setName(ev.target.value)}
            value={name}
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
          {editedBrand && (
            <button
              type="button"
              onClick={() => {
                setEditedBrand(null);
                setName("");
                setImages([]);
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
      {!editedBrand && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Бренд</td>
              <td>Фото</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {brands.length > 0 &&
              brands.map((brand) => (
                <tr key={brand._id}>
                  <td>{brand.name}</td>
                  <td style={{ display: "flex" }}>
                    {brand.images.map((image, index) => (
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
                      onClick={() => editBrand(brand)}
                      className="btn-default mr-1"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => deleteBrand(brand)}
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
export default withSwal(({ swal }, ref) => <Brands swal={swal} />);
