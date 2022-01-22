<template>
  <div id="app">
    <TabView>
      <TabPanel header="Задать json">
        <div class="button-container">
          <span class="p-float-label">
            <Textarea
              v-model="coordinatesAsJson"
              autoResize
              rows="5"
              cols="30"
            />
            <label>Координаты</label>
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
            <label for="startYaw">Курсовой угол</label>
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
            <label for="duration">Дифф времени</label>
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
            <label for="errorRate">Погрешность</label>
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
        <div class="button-container">
          <Button
            label="Отправить команды"
            icon="pi pi-check"
            @click.prevent="sendCommandsViaJson()"
          />
        </div>
      </TabPanel>
      <TabPanel header="Нарисовать координаты">
        <vue-drawing-canvas
          ref="VueCanvasDrawing"
          v-model:image="image"
          :width="maxWidth"
          :height="maxHeight"
          :stroke-type="strokeType"
          :line-cap="lineCap"
          :line-join="lineJoin"
          :fill-shape="fillShape"
          :eraser="eraser"
          :lineWidth="line"
          :color="color"
          :background-color="backgroundColor"
          :watermark="watermark"
          saveAs="png"
          :styles="{
            border: 'solid 1px #000',
          }"
          :lock="disabled"
          @mousemove="getCoordinate($event)"
          :additional-images="additionalImages"
        />
        <p>
          x: <strong>{{ x }}</strong
          >, y: <strong>{{ y }}</strong>
        </p>
        <div class="button-container">
          <Button
            label="Отправить команды"
            icon="pi pi-check"
            @click.prevent="sendCommandsViaDrawer()"
          />
          <Button
            label="Сбросить"
            severity="secondary"
            @click.prevent="resetCommandsViaDrawer()"
          />
        </div>
      </TabPanel>
    </TabView>
    <DataTable :value="commands" tableStyle="min-width: 50rem">
      <Column field="steering" header="Steering [deg]"></Column>
      <Column field="speed" header="Speed [m/s]"></Column>
      <Column field="duration" header="Duration [s]"></Column>
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
import VueDrawingCanvas from "vue-drawing-canvas";
import SocketService from "@/services/SocketService";

interface Stroke {
  coordinates: Array<Coordinate>;
}

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
}

interface Command {
  steering: number;
  speed: number;
  duration: number;
}

const MAX_WIDTH = 200;
const MAX_HEIGHT = 100;

export default defineComponent({
  components: {
    VueDrawingCanvas,
  },
  data(): {
    x: number;
    y: number;
    image: string;
    eraser: boolean;
    disabled: boolean;
    fillShape: boolean;
    line: number;
    color: string;
    strokeType: string;
    lineCap: string;
    lineJoin: string;
    backgroundColor: string;
    watermark:
      | {
          type: string;
          source: string;
          x: number;
          y: number;
          imageStyle: { width: number; height: number };
        }
      | undefined;
    additionalImages: never[];
    maxWidth: number;
    maxHeight: number;
    coordinatesAsJson: string;
    startYaw: number | undefined;
    duration: number;
    errorRate: number;
    maxIterations: number;
  } {
    return {
      x: 0,
      y: 0,
      image: "",
      eraser: false,
      disabled: false,
      fillShape: false,
      line: 2,
      color: "#000000",
      strokeType: "dash",
      lineCap: "round",
      lineJoin: "round",
      backgroundColor: "#FFFFFF",
      watermark: undefined,
      additionalImages: [],
      maxWidth: MAX_WIDTH,
      maxHeight: MAX_HEIGHT,
      coordinatesAsJson: "",
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

    const clearCommands = () => {
      commands.value = [];
    };

    return {
      commands,
      addCommand,
      clearCommands,
    };
  },
  methods: {
    getCoordinate(event: Event): void {
      const drawing = this.$refs.VueCanvasDrawing as typeof VueDrawingCanvas;
      const coordinate: Coordinate = drawing.getCoordinates(event);

      this.x = coordinate.x;
      this.y = MAX_HEIGHT - coordinate.y;
    },
    sendCommands(coordinates: Array<Coordinate>): void {
      let predictedCoordinates: Array<Coordinate> = [];

      const calculateDistance = function (
        c1: Coordinate,
        c2: Coordinate
      ): number {
        const deltaX = c2.x - c1.x;
        const deltaY = c2.y - c1.y;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        return distance;
      };

      const toRadians = function (degrees: number): number {
        return degrees * (Math.PI / 180);
      };

      const toDegrees = function (radians: number): number {
        return radians * (180 / Math.PI);
      };

      const normalizeAngle = function (angle: number): number {
        while (angle > Math.PI) {
          angle -= 2.0 * Math.PI;
        }

        while (angle < -Math.PI) {
          angle += 2.0 * Math.PI;
        }

        return angle;
      };

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

        let yaw = toRadians(
          this.startYaw === undefined || this.startYaw === null
            ? init.config.yaw
            : this.startYaw
        );

        const length: number = init.config.length;
        const total: number = init.fragments.length;
        let i = 0;

        console.log(`Init yaw: ${toDegrees(yaw)}`);
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
                yaw: toDegrees(yaw),
              }),
            }
          );

          const command: Command = await fragmentResponse.json();
          const toCoordinate: Coordinate = fragment[1];

          if (predictedCoordinates.length === 0) {
            predictedCoordinates.push({
              x: fromCoordinate.x,
              y: fromCoordinate.y,
            });
          }

          for (let j = 0; ; j++) {
            fromCoordinate.x += command.speed * Math.cos(yaw) * this.duration;
            fromCoordinate.y += command.speed * Math.sin(yaw) * this.duration;

            yaw +=
              Math.tan(toRadians(command.steering)) *
              (command.speed / length) *
              this.duration;

            yaw = normalizeAngle(yaw);

            SocketService.socket.emit("pushCommands", [
              {
                name: "MOVE",
                steering: -command.steering,
                speed: command.speed,
                duration: this.duration,
              },
            ]);

            this.addCommand({
              steering: command.steering,
              speed: command.speed,
              duration: this.duration,
            });

            predictedCoordinates.push({
              x: fromCoordinate.x,
              y: fromCoordinate.y,
            });

            const distance = calculateDistance(fromCoordinate, toCoordinate);

            if (j === this.maxIterations) {
              console.log("Anomaly distance:");
              console.log(distance);

              break;
            }

            if (distance <= this.errorRate) {
              if (i === total) {
                const nextX =
                  fromCoordinate.x +
                  command.speed * Math.cos(yaw) * this.duration;

                const nextY =
                  fromCoordinate.y +
                  command.speed * Math.sin(yaw) * this.duration;

                const nextDistance = calculateDistance(
                  {
                    x: nextX,
                    y: nextY,
                  },
                  toCoordinate
                );

                if (nextDistance < distance && nextDistance <= this.errorRate) {
                  continue;
                }
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
    sendCommandsViaDrawer(): void {
      const drawing = this.$refs.VueCanvasDrawing as typeof VueDrawingCanvas;
      const strokes: Array<Stroke> = JSON.parse(
        JSON.stringify(drawing.getAllStrokes())
      );

      const fixedCoordinates: Array<Coordinate> = [];

      strokes.forEach((stroke: Stroke) => {
        const coordinates: Array<Coordinate> = stroke.coordinates;

        coordinates.forEach((coordinate: Coordinate) => {
          const fixedCoordinate: Coordinate = {
            x: coordinate.x,
            y: MAX_HEIGHT - coordinate.y,
          };

          fixedCoordinates.push(fixedCoordinate);
        });
      });

      console.log("Coordinates via drawer:");
      console.log(fixedCoordinates);

      this.sendCommands(fixedCoordinates);
    },
    sendCommandsViaJson(): void {
      try {
        const coordinates: Array<Coordinate> = JSON.parse(
          this.coordinatesAsJson
        );

        console.log("Coordinates via json:");
        console.log(coordinates);

        this.sendCommands(coordinates);
      } catch (error) {
        alert("Ошибка парсинга JSON");
      }
    },
    resetCommandsViaDrawer(): void {
      (this.$refs.VueCanvasDrawing as typeof VueDrawingCanvas).reset();
    },
  },
});
</script>
