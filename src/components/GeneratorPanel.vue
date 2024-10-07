<template>
  <div id="app">
    <div class="flex flex-row">
      <div class="ml-5">
        <div class="button-container">
          <span class="p-float-label">
            <Textarea
              v-model="coordinatesAsJson"
              autoResize
              rows="5"
              cols="40"
            />
            <label>Координаты [json]</label>
          </span>
        </div>
        <div class="button-container">
          <Button
            label="Отправить команды"
            icon="pi pi-check"
            @click.prevent="sendCommands()"
          />
        </div>
      </div>
      <div class="ml-6">
        <div class="button-container">
          <span class="p-float-label">
            <Dropdown
              v-model="selectedModel"
              :options="models"
              optionLabel="name"
              optionValue="value"
              class="w-full md:w-14rem"
            />
            <label>Модель</label>
          </span>
        </div>
        <div class="button-container">
          <span class="p-float-label">
            <InputNumber
              v-model="startYaw"
              inputId="startYaw"
              :min="0"
              :max="360"
            />
            <label for="startYaw">Начальный угол [град]</label>
          </span>
        </div>
        <div class="button-container">
          <span class="p-float-label">
            <InputNumber
              v-model="duration"
              inputId="duration"
              :min="0"
              :max="10"
              :minFractionDigits="1"
              :maxFractionDigits="2"
            />
            <label for="duration">Время команды [с]</label>
          </span>
        </div>
        <div class="button-container">
          <span class="p-float-label">
            <InputNumber
              v-model="errorRate"
              inputId="errorRate"
              :min="0"
              :max="10"
              :minFractionDigits="1"
              :maxFractionDigits="2"
            />
            <label for="errorRate">Приближение [м]</label>
          </span>
        </div>
        <div class="button-container">
          <span class="p-float-label">
            <InputNumber
              v-model="maxIterations"
              inputId="maxIterations"
              :min="1"
              :max="99999"
            />
            <label for="maxIterations">Максимум итераций</label>
          </span>
        </div>
      </div>
    </div>
    <h3 class="text-center">Отправленные команды</h3>
    <DataTable :value="commands" tableStyle="min-width: 50rem" showGridlines>
      <Column field="id" header="Идентификатор"></Column>
      <Column field="steering" header="Угол поворота [град]"></Column>
      <Column field="speed" header="Скорость [м/с]"></Column>
      <Column field="status" header="Статус" style="min-width: 200px">
        <template #body="body">
          <Tag
            :value="getStatusText(body.data.status)"
            :severity="getStatusSeverity(body.data.status)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@1,700&display=swap");
body {
  font-family: "Roboto", sans-serif;
}
.button-container {
  display: flex;
  flex-direction: row;
  margin-top: 25px;
}
</style>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import SocketService from "@/services/SocketService";
import State from "@/store/State";

interface Init {
  config: {
    length: number;
    yaw: number;
  };
  fragments: Array<Array<Coordinate>>;
}

interface Coordinate {
  x: number;
  y: number;
  speed?: number;
}

interface Command {
  id?: string;
  steering: number;
  speed: number;
  status?: string;
}

export default defineComponent({
  data(): {
    coordinatesAsJson: string;
    selectedModel: string;
    models: Array<{ name: string; value: string }>;
    startYaw: number | undefined;
    duration: number;
    errorRate: number;
    maxIterations: number;
  } {
    return {
      coordinatesAsJson: "",
      selectedModel: "static_smoothly",
      models: [
        { name: "Static smoothly", value: "static_smoothly" },
        { name: "Static aggressive", value: "static_aggressive" },
        { name: "Speed dynamic", value: "speed_dynamic" },
        { name: "Speed slow", value: "speed_slow" },
        { name: "Speed weekly", value: "speed_weekly" },
      ],
      startYaw: undefined,
      duration: 0.01,
      errorRate: 0.05,
      maxIterations: 1000,
    };
  },
  setup() {
    const commands: Ref<Command[]> = ref([]);

    const addCommand = (newCommand: Command) => {
      commands.value.push(newCommand);
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

    return {
      commands,
      addCommand,
      modifyCommand,
      clearCommands,
    };
  },
  mounted() {
    SocketService.socket.on("getCommand", (data) => {
      try {
        const parsedData: { id: string; status: string; state: State } =
          JSON.parse(data);

        this.$store.commit("setCurrentAngle", parsedData.state.currentAngle);
        this.$store.commit("setCurrentSpeed", parsedData.state.currentSpeed);
        this.modifyCommand(parsedData.id, parsedData.status);
        console.log(parsedData);
      } catch (error) {
        console.error("Invalid json from get command event:", data);
      }
    });
  },
  methods: {
    sendCommands(): void {
      try {
        const coordinates: Array<Coordinate> = JSON.parse(
          this.coordinatesAsJson,
        );

        console.log("Coordinates via json:");
        console.log(coordinates);

        this.doSendCommands(coordinates);
      } catch (error) {
        alert("Ошибка парсинга JSON");
      }
    },
    doSendCommands(coordinates: Array<Coordinate>): void {
      const predictedCoordinates: Array<Coordinate> = [];

      const doInitAndGenerate = async () => {
        this.clearCommands();

        const response = await fetch(process.env.VUE_APP_INIT_HOST, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(coordinates),
        });

        const init: Init = await response.json();

        let yaw = this.toRadians(
          this.startYaw === undefined || this.startYaw === null
            ? init.config.yaw
            : this.startYaw,
        );

        const length: number = init.config.length;
        const total: number = init.fragments.length;
        let i = 0;

        console.log(`Init yaw: ${this.toDegrees(yaw)}`);
        console.log(`Init length: ${length}`);

        let fromCoordinate: Coordinate | undefined = undefined;

        for (const fragment of init.fragments) {
          i++;

          if (fromCoordinate === undefined) {
            fromCoordinate = { x: fragment[0].x, y: fragment[0].y };
          } else {
            fragment[0] = { x: fromCoordinate.x, y: fromCoordinate.y };
          }

          const fragmentResponse = await fetch(
            process.env.VUE_APP_GENERATOR_HOST,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                coordinates: fragment,
                yaw: this.toDegrees(yaw),
                model: this.selectedModel,
              }),
            },
          );

          const command: Command = await fragmentResponse.json();
          const toCoordinate: Coordinate = fragment[1];

          if (predictedCoordinates.length === 0) {
            predictedCoordinates.push({
              x: fromCoordinate.x,
              y: fromCoordinate.y,
              speed: command.speed,
            });
          }

          for (let j = 0; ; j++) {
            fromCoordinate.x += command.speed * Math.cos(yaw) * this.duration;
            fromCoordinate.y += command.speed * Math.sin(yaw) * this.duration;

            if (!this.needMoveStraight(yaw, fromCoordinate, toCoordinate)) {
              yaw +=
                Math.tan(this.toRadians(command.steering)) *
                (command.speed / length) *
                this.duration;

              yaw = this.normalizeAngle(yaw);
            }

            this.pushCommand(command);

            predictedCoordinates.push({
              x: fromCoordinate.x,
              y: fromCoordinate.y,
              speed: command.speed,
            });

            const distance = this.calculateDistance(
              fromCoordinate,
              toCoordinate,
            );

            if (j === this.maxIterations) {
              console.log("Anomaly distance:");
              console.log(distance);

              break;
            }

            if (distance <= this.errorRate) {
              if (
                i === total &&
                this.needCloserToNextCoordinate(
                  fromCoordinate,
                  toCoordinate,
                  command.speed,
                  yaw,
                  distance,
                )
              ) {
                continue;
              }

              console.log("Distance:");
              console.log(distance);

              break;
            }
          }
        }

        console.log("Predicted coordinates:");
        console.log(predictedCoordinates);
      };

      doInitAndGenerate();
    },
    pushCommand(command: Command) {
      SocketService.socket.timeout(1000).emit(
        "pushCommand",
        {
          algorithmName: "AUTO",
          commandName: "MOVE",
          steering: -command.steering,
          speed: 60,
          duration: this.duration,
        },
        (err: unknown, id: string) => {
          if (err) {
            console.error(err);
          } else {
            this.addCommand({
              id: id,
              steering: command.steering,
              speed: command.speed,
              status: err ? "error" : "sent",
            });
          }
        },
      );
    },
    needCloserToNextCoordinate(
      fromCoordinate: Coordinate,
      toCoordinate: Coordinate,
      speed: number,
      yaw: number,
      distance: number,
    ): boolean {
      const nextDistance = this.calculateDistance(
        {
          x: fromCoordinate.x + speed * Math.cos(yaw) * this.duration,
          y: fromCoordinate.y + speed * Math.sin(yaw) * this.duration,
        },
        toCoordinate,
      );

      return nextDistance < distance && nextDistance <= this.errorRate;
    },
    needMoveStraight(
      currentAngle: number,
      c1: Coordinate,
      c2: Coordinate,
    ): boolean {
      const targetAngle: number = this.normalizeAngle(
        Math.atan2(c2.y - c1.y, c2.x - c1.x),
      );

      return Math.abs(currentAngle - targetAngle) < 0.1;
    },
    calculateDistance(c1: Coordinate, c2: Coordinate): number {
      const deltaX = c2.x - c1.x;
      const deltaY = c2.y - c1.y;
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      return distance;
    },
    toRadians(degrees: number): number {
      return degrees * (Math.PI / 180);
    },
    toDegrees(radians: number): number {
      return radians * (180 / Math.PI);
    },
    normalizeAngle(angle: number): number {
      while (angle > Math.PI) {
        angle -= 2.0 * Math.PI;
      }

      while (angle < -Math.PI) {
        angle += 2.0 * Math.PI;
      }

      return angle;
    },
    getStatusText(status: string): string | undefined {
      switch (status) {
        case "sent":
          return "Отправлено";
        case "success":
          return "Успешно";
        case "cancelled":
          return "Отменено";
        case "error":
          return "Ошибка";
        default:
          return undefined;
      }
    },
    getStatusSeverity(status: string): string | undefined {
      switch (status) {
        case "sent":
          return "info";
        case "success":
          return "success";
        case "cancelled":
          return "warning";
        case "error":
          return "danger";
        default:
          return undefined;
      }
    },
  },
});
</script>
