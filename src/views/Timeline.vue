<template>
  <div class="timelines-container">
    <div
      v-for="(commands, algorithm, index) in groupedCommands"
      :key="algorithm"
      class="timeline-column"
    >
      <h3 class="algorithm-title">{{ algorithm }}</h3>
      <Timeline :value="syncedCommands(algorithm)">
        <template #opposite="body">
          <div style="display: flex; justify-content: space-between">
            <small v-if="index === 0" class="text-gray-500 mr-2">
              {{ formatTime(body.item.timestamp) }}
            </small>
            <small v-else></small>
            <small class="text-surface-500 dark:text-surface-400">
              {{ body.item.commandName }}
            </small>
          </div>
        </template>
        <template #content="body">
          <Tag
            v-if="
              getStatusText(body.item.status) &&
              getStatusSeverity(body.item.status)
            "
            :value="getStatusText(body.item.status)"
            :severity="getStatusSeverity(body.item.status)"
          />
        </template>
      </Timeline>
    </div>
  </div>
</template>

<style scoped>
.timelines-container {
  display: flex;
  gap: 20px;
  justify-content: flex-start;
}
.timeline-column {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.algorithm-title {
  font-weight: bold;
  margin-bottom: 10px;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 5px 10px;
  text-align: center;
}
</style>

<script lang="ts">
import { defineComponent, ref, computed, Ref } from "vue";
import SocketService from "@/services/SocketService";

interface Command {
  id: string;
  status: string;
  algorithmName: string;
  commandName: string;
  timestamp: number;
}

export default defineComponent({
  setup() {
    const commands: Ref<Command[]> = ref([]);

    const addCommand = (
      id: string,
      status: string,
      algorithmName: string,
      commandName: string,
    ) => {
      commands.value.push({
        id,
        status,
        algorithmName,
        commandName,
        timestamp: Date.now(),
      });
    };

    const modifyCommand = (id: string, status: string) => {
      const index = commands.value.findIndex((row) => row.id === id);

      if (index !== -1) {
        commands.value[index].status = status;
      }
    };

    const clearCommands = () => {
      commands.value = [];
    };

    const groupedCommands = computed(() => {
      return commands.value.reduce(
        (groups, command) => {
          const key = command.algorithmName || "Без алгоритма";

          if (!groups[key]) {
            groups[key] = [];
          }

          groups[key].push(command);

          return groups;
        },
        {} as Record<string, Command[]>,
      );
    });

    const uniqueTimestamps = computed(() => {
      return Array.from(new Set(commands.value.map((c) => c.timestamp))).sort(
        (a, b) => a - b,
      );
    });

    const syncedCommands = (algorithm: string) => {
      const commandsList = groupedCommands.value[algorithm] || [];

      return uniqueTimestamps.value.map((timestamp) => {
        return (
          commandsList.find((c) => c.timestamp === timestamp) || {
            id: `placeholder-${timestamp}`,
            status: "",
            algorithmName: algorithm,
            commandName: "",
            timestamp,
          }
        );
      });
    };

    return {
      commands,
      addCommand,
      modifyCommand,
      clearCommands,
      groupedCommands,
      syncedCommands,
    };
  },
  mounted() {
    SocketService.socket.on("addCommand", (data) => {
      try {
        const parsedData: Omit<Command, "timestamp"> = JSON.parse(data);

        this.addCommand(
          parsedData.id,
          parsedData.status,
          parsedData.algorithmName,
          parsedData.commandName,
        );

        console.log(parsedData);
      } catch (error) {
        console.error("Invalid json from get command event:", data);
      }
    });

    SocketService.socket.on("updateCommand", (data) => {
      try {
        const parsedData: Omit<Command, "timestamp"> = JSON.parse(data);

        this.modifyCommand(parsedData.id, parsedData.status);

        console.log(parsedData);
      } catch (error) {
        console.error("Invalid json from get command event:", data);
      }
    });

    SocketService.socket.on("purgeCommands", () => {
      this.commands.forEach(function (command: Command) {
        if (command.status === "received" || command.status === "started") {
          command.status = "revoked";
        }
      });
    });
  },
  methods: {
    getStatusText(status: string): string | undefined {
      const statuses: Record<string, string> = {
        received: "Получена",
        started: "Запущена",
        succeeded: "Успешно",
        revoked: "Аннулирована",
        failed: "Неудача",
      };

      return statuses[status];
    },
    getStatusSeverity(status: string): string | undefined {
      const severities: Record<string, string> = {
        received: "secondary",
        started: "info",
        succeeded: "success",
        revoked: "warning",
        failed: "danger",
      };

      return severities[status];
    },
    formatTime(timestamp: number): string {
      const date = new Date(timestamp);

      return date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
});
</script>
