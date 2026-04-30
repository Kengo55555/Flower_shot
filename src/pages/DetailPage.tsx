import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Loading from "../components/common/Loading";
import { getRecordById, deleteRecord } from "../lib/firestore";
import { getImage, deleteImage } from "../lib/indexeddb";
import { getFlowerInfo } from "../lib/wikipedia";
import type { FlowerRecord, WikipediaResult } from "../types";

function formatDate(date: Date): string {
  return `${date.getFullYear()}ねん ${date.getMonth() + 1}がつ ${date.getDate()}にち`;
}

export default function DetailPage() {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<FlowerRecord | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [wiki, setWiki] = useState<WikipediaResult | null>(null);
  const [wikiLoading, setWikiLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!recordId) return;
    let url: string | null = null;

    (async () => {
      const rec = await getRecordById(recordId);
      if (!rec) {
        navigate("/collection", { replace: true });
        return;
      }
      setRecord(rec);
      setLoading(false);

      const blob = await getImage(rec.photoLocalKey);
      if (blob) {
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      }

      const info = await getFlowerInfo(rec.flowerName, rec.flowerNameOriginal);
      setWiki(info);
      setWikiLoading(false);
    })();

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [recordId, navigate]);

  const handleDelete = async () => {
    if (!recordId) return;
    await deleteRecord(recordId);
    await deleteImage(recordId);
    navigate("/collection", { replace: true });
  };

  if (loading) {
    return <Loading message="よみこみちゅう..." />;
  }

  if (!record) return null;

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title={record.flowerName} onBack={() => navigate(-1)} />

      <div className="px-4 py-6">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={record.flowerName}
            className="w-full h-64 object-cover rounded-2xl mb-4"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center">
            <span className="text-6xl">🌸</span>
          </div>
        )}

        <h2 className="text-2xl font-bold mb-2">{record.flowerName}</h2>
        <p className="text-sm text-gray-500 mb-1">
          {formatDate(record.capturedAt)}
        </p>
        <p className="text-sm text-green font-bold mb-4">
          {Math.round(record.confidence * 100)}% の かくりつ
        </p>

        <hr className="my-4 border-gray-200" />

        {wikiLoading ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">くわしい じょうほうを さがしているよ...</p>
          </div>
        ) : wiki ? (
          <div>
            <h3 className="text-lg font-bold mb-2">{wiki.title}</h3>
            {wiki.thumbnailUrl && (
              <img
                src={wiki.thumbnailUrl}
                alt={wiki.title}
                className="w-32 h-32 object-cover rounded-xl float-right ml-3 mb-2"
              />
            )}
            <p className="text-base leading-relaxed">{wiki.extract}</p>
            {wiki.pageUrl && (
              <a
                href={wiki.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-sky underline text-sm"
              >
                Wikipedia で もっと しらべる
              </a>
            )}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">
            くわしい じょうほうが みつからなかったよ
          </p>
        )}

        <hr className="my-6 border-gray-200" />

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-red-400 text-sm py-2"
        >
          この きろくを けす
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
            <p className="text-lg font-bold mb-4">
              この きろくを けしても いい？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 rounded-full py-3 font-bold"
              >
                やめる
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-400 text-white rounded-full py-3 font-bold"
              >
                けす
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
