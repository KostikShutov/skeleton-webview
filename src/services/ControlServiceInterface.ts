export default interface ControlServiceInterface {
  getKeys(): {
    forward: string;
    backward: string;
    left: string;
    right: string;
    stop: string;
  };

  forward(): void;

  backward(): void;

  left(): void;

  right(): void;

  stop(): void;

  forceStop(): void;

  speedUp(): void;

  speedDown(): void;
}
