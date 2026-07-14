import path from "path";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vanillaExtractPlugin()],
  server: {
    port: 7131,
    proxy: {
      "/api": { target: "http://localhost:7130" },
    },
  },
  resolve: {
    // SengenUI の package.json は dist を指すがビルド成果物はコミットされていないため、
    // ソース（index.ts）へ直接エイリアスする（AgentRoom packages/ui踏襲）
    alias: [
      {
        find: /^sengen-ui$/,
        replacement: path.resolve(__dirname, "../../submodules/SengenUI/index.ts"),
      },
      {
        find: /^sengen-ui\//,
        replacement: path.resolve(__dirname, "../../submodules/SengenUI") + "/",
      },
    ],
  },
  build: {
    rollupOptions: {
      output: {
        // 日本語ファイル名由来のチャンク/アセット名はURLエンコード問題を踏むため、
        // ASCIIのハッシュベース名に固定する
        entryFileNames: "assets/entry-[hash].js",
        chunkFileNames: "assets/chunk-[hash].js",
        assetFileNames: "assets/asset-[hash][extname]",
      },
    },
  },
});
