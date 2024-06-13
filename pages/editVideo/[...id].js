import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import VideoForm from "@/components/VideoForm";

export default function EditProductVideoPage() {
  const [videoInfo, setVideoInfo] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/api/videos?id=" + id).then((response) => {
      setVideoInfo(response.data);
    });
  }, [id]);
  return (
    <Layout>
      <h1>Редактировать продукт с видео</h1>
      {videoInfo && <VideoForm {...videoInfo} />}
    </Layout>
  );
}
