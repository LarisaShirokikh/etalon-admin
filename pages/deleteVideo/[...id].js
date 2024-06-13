import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";

export default function DeleteProductVideoPage() {
  const router = useRouter();
  const [videoInfo, setVideoInfo] = useState();
  const { id } = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/api/videos?id=" + id).then((response) => {
      setVideoInfo(response.data);
    });
  }, [id]);
  function goBack() {
    router.push("/videos");
  }
  async function deleteProductVideo() {
    await axios.delete("/api/videos?id=" + id);
    goBack();
  }
  return (
    <Layout>
      <h1 className="text-center">
        Вы уверены что хотите удалить продукт &nbsp;&quot;{videoInfo?.title}
        &quot;?
      </h1>
      <div className="flex gap-2 justify-center">
        <button onClick={deleteProductVideo} className="btn-red">
          Да!
        </button>
        <button className="btn-default" onClick={goBack}>
          Нет!
        </button>
      </div>
    </Layout>
  );
}
