<template>
  <div class="timelines-container-mini">
    <div
      v-for="(commands, algorithm) in groupedCommands"
      :key="algorithm"
      class="timeline-column"
    >
      <h3 class="algorithm-title rotate">{{ algorithm }}</h3>
      <Timeline :value="syncedCommands(algorithm)">
        <template #opposite="body">
          <small class="text-surface-500 dark:text-surface-400 rotate-right">
            {{ body.item.commandName }}
          </small>
        </template>
        <template #content="body">
          <Tag
            v-if="
              getStatusText(body.item.status) &&
              getStatusSeverity(body.item.status)
            "
            :value="getStatusText(body.item.status)"
            :severity="getStatusSeverity(body.item.status)"
            class="rotate-left"
          />
        </template>
      </Timeline>
    </div>
  </div>
</template>

<style>
.timelines-container-mini {
  display: flex;
  gap: 20px;
  justify-content: flex-start;
}
.timelines-container-mini .timeline-column {
  display: flex;
  flex-direction: column;
  width: 280px;
}
.timelines-container-mini .algorithm-title {
  font-weight: bold;
  margin-bottom: 10px;
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 5px 10px;
  text-align: center;
  font-size: 10px;
}
.timelines-container-mini .rotate {
  display: inline-block;
  transform: rotate(30deg);
}
.timelines-container-mini .rotate-right {
  display: inline-block;
  transform-origin: right bottom;
  transform: rotate(30deg);
}
.timelines-container-mini .rotate-left {
  display: inline-block;
  transform-origin: left bottom;
  transform: rotate(30deg);
}
.timelines-container-mini .p-timeline-event {
  min-height: 30px;
}
.timelines-container-mini .p-timeline-event-content {
  display: flex;
  align-items: flex-start;
}
.timelines-container-mini .p-tag {
  padding: 0.1rem;
  border-radius: 3px;
  font-size: 10pxж;
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
