<template>
  <div>
    <input type="file" @change="onFileChange" />
    <button @click="uploadFile">Загрузить</button>
    <h3>Список файлов:</h3>
    <ul>
      <li v-for="file in files" :key="file">
        {{ file }}
        <button @click="downloadFile(file)">Скачать</button>
        <button @click="deleteFile(file)">Удалить</button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SocketService from "@/services/SocketService";

export default defineComponent({
  data(): { selectedFile: File | null; files: string[] } {
    return {
      selectedFile: null,
      files: [],
    };
  },
  mounted() {
    this.fetchFiles();
  },
  methods: {
    onFileChange(event: Event) {
      const target = event.target as HTMLInputElement;
      this.selectedFile = target.files ? target.files[0] : null;
    },
    uploadFile() {
      if (!this.selectedFile) return;

      const reader = new FileReader();

      reader.onload = () => {
        if (!this.selectedFile) return;

        const base64String = (reader.result as string).split(",")[1];

        SocketService.socket.timeout(2000).emit(
          "uploadFile",
          {
            name: this.selectedFile.name,
            data: base64String,
          },
          (err: unknown) => {
            if (err) {
              console.log("Can not upload file");
              console.error(err);

              return;
            }

            this.fetchFiles();
          },
        );
      };

      reader.readAsDataURL(this.selectedFile);
    },
    downloadFile(filename: string) {
      SocketService.socket
        .timeout(2000)
        .emit("downloadFile", filename, (err: unknown, data: ArrayBuffer) => {
          if (err) {
            console.log("Can not download file");
            console.error(err);

            return;
          }

          const blob = new Blob([data], { type: "application/octet-stream" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
        });
    },
    deleteFile(filename: string) {
      SocketService.socket.emit("deleteFile", filename);
      this.fetchFiles();
    },
    fetchFiles() {
      SocketService.socket
        .timeout(2000)
        .emit("getFiles", (err: unknown, data: string[]) => {
          if (err) {
            console.log("Can not get files");
            console.error(err);

            return;
          }

          this.files = data;
        });
    },
  },
});
</script>
