import type { Badge } from "../types";

export const ADMIN_EMAIL = "nomurakengo@gmail.com";
export const DAILY_USER_LIMIT = 100;
export const DAILY_GLOBAL_LIMIT = 500;
export const PLANTNET_CONFIDENCE_THRESHOLD = 0.5;
export const MAX_CANDIDATES = 3;
export const INDEXEDDB_NAME = "flower_shot_db";
export const INDEXEDDB_VERSION = 1;
export const INDEXEDDB_STORE_NAME = "images";
export const STORAGE_WARNING_THRESHOLD_MB = 800;

export const BADGES: Badge[] = [
  {
    id: "beginner",
    name: "はじめての はっけん",
    description: "はじめて おはなを みつけたよ！",
    requiredCount: 1,
    icon: "🌱",
  },
  {
    id: "explorer",
    name: "はじめての ぼうけんしゃ",
    description: "5しゅるいの おはなを みつけたよ！",
    requiredCount: 5,
    icon: "🌼",
  },
  {
    id: "collector",
    name: "おはな コレクター",
    description: "10しゅるいの おはなを みつけたよ！",
    requiredCount: 10,
    icon: "💐",
  },
  {
    id: "master",
    name: "はな マスター",
    description: "20しゅるいの おはなを みつけたよ！",
    requiredCount: 20,
    icon: "🏆",
  },
  {
    id: "expert",
    name: "はな はかせ",
    description: "50しゅるいの おはなを みつけたよ！",
    requiredCount: 50,
    icon: "🎓",
  },
];
