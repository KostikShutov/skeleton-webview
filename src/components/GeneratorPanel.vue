<template>
  <div class="flex flex-row">
    <div>
      <div class="button-container">
        <span class="p-float-label">
          <Textarea v-model="coordinatesAsJson" autoResize rows="5" cols="40" />
          <label>Координаты [json]</label>
        </span>
      </div>
      <div class="button-container mt-3">
        <Button
          label="Отправить команды"
          icon="pi pi-check"
          @click.prevent="sendCommands()"
        />
      </div>
    </div>
    <div class="ml-3">
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
      <div class="button-container" style="margin-top: 25px">
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
      <div class="button-container" style="margin-top: 25px">
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
      <div class="button-container" style="margin-top: 25px">
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
      <div class="button-container" style="margin-top: 25px">
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
</template>

<style scoped>
.button-container {
  display: flex;
  flex-direction: row;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import SocketService from "@/services/SocketService";

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
  steering: number;
  speed: number;
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

            SocketService.socket.emit(
              "pushCommand",
              {
                commandName: "MOVE",
                steering: -command.steering,
                speed: 60,
                duration: this.duration,
              },
              "TRAJECTORY",
            );

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
  },
});
</script>
