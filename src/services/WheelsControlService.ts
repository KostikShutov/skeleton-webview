import ControlServiceInterface from "./ControlServiceInterface";
import SocketService from "./SocketService";
import { useStore, Store } from "vuex";
import State from "@/store/State";

export default class WheelsControlService implements ControlServiceInterface {
  private store: Store<State>;

  constructor() {
    this.store = useStore();
  }

  public getKeys(): {
    forward: string;
    backward: string;
    left: string;
    right: string;
    stop: string;
  } {
    return {
      forward: "w",
      backward: "s",
      left: "a",
      right: "d",
      stop: "space",
    };
  }

  public forward(): void {
    SocketService.socket.emit("pushCommand", {
      name: "FORWARD",
      speed: this.store.state.currentSpeed,
    });

    console.log("[Wheels] forward");
  }

  public backward(): void {
    SocketService.socket.emit("pushCommand", {
      name: "BACKWARD",
      speed: this.store.state.currentSpeed,
    });

    console.log("[Wheels] backward");
  }

  public left(): void {
    SocketService.socket
      .timeout(1000)
      .emit("state", (err: unknown, json: string) => {
        if (err) {
          console.log("[Wheels] left (error)");
        } else {
          const state: State = JSON.parse(json);
          const currentAngle = state.currentAngle;
          const minAngle = this.store.state.minAngle;
          let newAngle: number = currentAngle - 15;

          newAngle = newAngle < minAngle ? minAngle : newAngle;

          this.doTurn(newAngle);

          console.log(
            `[Wheels] left (oldAngle: ${currentAngle}, newAngle: ${newAngle})`
          );
        }
      });
  }

  public right(): void {
    SocketService.socket
      .timeout(1000)
      .emit("state", (err: unknown, json: string) => {
        if (err) {
          console.log("[Wheels] right (error)");
        } else {
          const state: State = JSON.parse(json);
          const currentAngle = state.currentAngle;
          const maxAngle = this.store.state.maxAngle;
          let newAngle: number = currentAngle + 15;

          newAngle = newAngle > maxAngle ? maxAngle : newAngle;

          this.doTurn(newAngle);

          console.log(
            `[Wheels] right (oldAngle: ${currentAngle}, newAngle: ${newAngle})`
          );
        }
      });
  }

  public stop(): void {
    SocketService.socket.emit("pushCommand", {
      name: "STOP",
    });

    console.log("[Wheels] stop");
  }

  private doTurn(newAngle: number): void {
    SocketService.socket.emit("pushCommand", {
      name: "TURN",
      steering: newAngle,
    });

    this.store.state.currentAngle = newAngle;
  }
}
