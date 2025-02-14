import ControlServiceInterface from "./ControlServiceInterface";
import SocketService from "./SocketService";

export default class CameraControlService implements ControlServiceInterface {
  public getKeys(): {
    forward: string;
    backward: string;
    left: string;
    right: string;
    stop: string;
  } {
    return {
      forward: "2",
      backward: "x",
      left: "q",
      right: "e",
      stop: "",
    };
  }

  public forward(): void {
    SocketService.socket.emit(
      "pushCommand",
      {
        commandName: "CAMERA_UP",
      },
      "MANUAL",
    );

    console.log("[Camera] up");
  }

  public backward(): void {
    SocketService.socket.emit(
      "pushCommand",
      {
        commandName: "CAMERA_DOWN",
      },
      "MANUAL",
    );

    console.log("[Camera] down");
  }

  public left(): void {
    SocketService.socket.emit(
      "pushCommand",
      {
        commandName: "CAMERA_LEFT",
      },
      "MANUAL",
    );

    console.log("[Camera] left");
  }

  public right(): void {
    SocketService.socket.emit(
      "pushCommand",
      {
        commandName: "CAMERA_RIGHT",
      },
      "MANUAL",
    );

    console.log("[Camera] right");
  }

  public stop(): void {
    throw new Error("Stop is not available for camera");
  }

  public forceStop(): void {
    throw new Error("Stop is not available for camera");
  }

  public speedUp(): void {
    throw new Error("Speed is not available for camera");
  }

  public speedDown(): void {
    throw new Error("Speed is not available for camera");
  }
}
