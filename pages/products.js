import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchCategories,
  fetchCatalogs,
  fetchProducts,
  updateProductsCategories,
} from "@/utils/function";
import Select from "react-select";


export default function Products() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [catalogs, setCatalogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      
          await fetchProducts(setProducts);
          await fetchCategories(setCategories);
          await fetchCatalogs(setCatalogs);
    };

    fetchData();
  }, []);

  // Function to filter catalogs based on search query
  const filterBySearchQuery = (product) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      product.title.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    );
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter((id) => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  const handleSelectAllProducts = () => {
    if (selectAllChecked) {
      setSelectedProducts([]);
    } else {
      const allProductIds = products.map((product) => product._id);
      setSelectedProducts(allProductIds);
    }
    setSelectAllChecked(!selectAllChecked);
  };

   const handleBulkUpdate = async () => {
     if (selectedCategories.length > 0) {
       await updateProductsCategories(selectedProducts, selectedCategories);
       const updatedProducts = products.map((product) => {
         if (selectedProducts.includes(product._id)) {
           return {
             ...product,
             category: [
               ...new Set([...product.category, ...selectedCategories]),
             ],
           };
         }
         return product;
       });
       setProducts(updatedProducts);
       setSelectedProducts([]);
       setSelectedCategories([]);
       setSelectAllChecked(false);
     }
   };

  const handleSearchInputChange = (ev) => {
    setSearchQuery(ev.target.value);
  };

  const handleCategoriesChange = (selectedOptions) => {
    setSelectedCategories(selectedOptions.map((option) => option.value));
  };

  const getCategoryNames = (categoryIds) => {
    return categoryIds
      .map((categoryId) => {
        const category = categories.find((cat) => cat._id === categoryId);
        return category ? category.name : "Неизвестная категория";
      })
      .join(", ");
  };



  return (
    <Layout>
      <Link className="btn-primary" href={"/new"}>
        Добавить новый продукт
      </Link>
      {/* Search input */}
      <input
        type="text"
        placeholder="Поиск по названию или описанию"
        value={searchQuery}
        onChange={handleSearchInputChange}
        className="bg-white w-full border border-gray-300 p-2 rounded-md mb-4"
      />

      <div className="mb-4">
        <Select
          isMulti
          options={categories.map((category) => ({
            value: category._id,
            label: category.name,
          }))}
          onChange={handleCategoriesChange}
          className="bg-white border border-gray-300 p-2 rounded-md"
        />
        <button onClick={handleBulkUpdate} className="btn-primary ml-2">
          Обновить выбранные продукты
        </button>
      </div>

      <table className="basic mt-4">
        <thead>
          <tr>
            <td>
              <input
                type="checkbox"
                checked={selectAllChecked}
                onChange={handleSelectAllProducts}
              />
            </td>
            <td>Название</td>
            <td>Каталог</td>
            <td>Категория</td>
            <td>Цена</td>
            <td>Фото</td>
            <td>Действия</td>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 &&
            products.filter(filterBySearchQuery).map((product) => (
              <tr key={product._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => handleProductSelection(product._id)}
                  />
                </td>
                <td style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {product.title}
                </td>
                <td>
                  {product.catalog && product.catalog.length > 0
                    ? product.catalog.map((catalog) => catalog.name).join(", ")
                    : "Нет  каталога"}
                </td>
                <td>
                  {product.category && product.category.length > 0
                    ? getCategoryNames(product.category)
                    : "Нет категорий"}
                </td>
                <td>{product.price.price}</td>
                <td style={{ display: "flex" }}>
                  {product.images.map((image, index) => (
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
                  <Link
                    className="btn-default mr-1"
                    href={"/edit/" + product._id}
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
                  </Link>
                  <Link className="btn-red" href={"/delete/" + product._id}>
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
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
}
