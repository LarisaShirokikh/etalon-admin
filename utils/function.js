import axios from "axios";

export async function fetchCategories(setCategories) {
  try {
    const result = await axios.get("/api/categories");
    setCategories(result.data);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}

export async function fetchCatalogs(setCatalogs) {
  try {
    const result = await axios.get("/api/catalogs");
    setCatalogs(result.data);
  } catch (error) {
    console.error("Error fetching catalogs:", error);
  }
}

export async function uploadImages(ev, setIsUploading, setImages) {
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
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  }
}

export async function handleImageUrlChange(
  ev,
  setImageUrl,
  setImagePreviewUrl
) {
  const url = ev.target.value;
  setImageUrl(url);
  setImagePreviewUrl(url);
}

export async function handleRemoveImage(indexToRemove, setImages) {
  setImages((prevImages) => {
    const updatedImages = prevImages.filter(
      (_, index) => index !== indexToRemove
    );
    return updatedImages;
  });
}

export function updateImagesOrder(images, setImages) {
  setImages(images);
}
