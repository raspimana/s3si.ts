import { DeepReadonly } from "../deps.ts";
import { DEFAULT_ENV, Env } from "./env.ts";

export type LoginState = {
  sessionToken?: string;
  gToken?: string;
  bulletToken?: string;
};
export type RankState = {
  // generated by gameId(battle.id)
  gameId: string;
  // extract from battle.id
  timestamp?: number;
  // C-, B, A+, S, S+0, S+12
  rank: string;
  rankPoint: number;
};
export type State = {
  loginState?: LoginState;
  fGen: string;
  appUserAgent?: string;
  userLang?: string;
  userCountry?: string;

  rankState?: RankState;

  cacheDir: string;

  // Exporter config
  statInkApiKey?: string;
  fileExportPath: string;
  monitorInterval: number;
  splashcatApiKey?: string;
};

export const DEFAULT_STATE: State = {
  cacheDir: "./cache",
  fGen: "https://api.imink.app/f",
  fileExportPath: "./export",
  monitorInterval: 500,
};

export type StateBackend = {
  read: () => Promise<State>;
  write: (newState: State) => Promise<void>;
};

export class InMemoryStateBackend implements StateBackend {
  state: State;

  constructor(state?: State) {
    this.state = state ?? DEFAULT_STATE;
  }

  read() {
    return Promise.resolve(this.state);
  }

  write(newState: State) {
    this.state = newState;
    return Promise.resolve();
  }
}

export class FileStateBackend implements StateBackend {
  constructor(private path: string) {}

  async read(): Promise<DeepReadonly<State>> {
    const data = await Deno.readTextFile(this.path);
    const json = JSON.parse(data);
    return json;
  }

  async write(newState: State): Promise<void> {
    const data = JSON.stringify(newState, undefined, 2);
    const swapPath = `${this.path}.swap`;
    await Deno.writeTextFile(swapPath, data);
    await Deno.rename(swapPath, this.path);
  }
}

export class Profile {
  protected _state?: State;
  protected stateBackend: StateBackend;
  protected env: Env;

  constructor(
    { stateBackend, env = DEFAULT_ENV }: {
      stateBackend: StateBackend;
      env?: Env;
    },
  ) {
    this.stateBackend = stateBackend;
    this.env = env;
  }

  get state(): DeepReadonly<State> {
    if (!this._state) {
      throw new Error("state is not initialized");
    }
    return this._state;
  }

  async writeState(newState: State) {
    this._state = newState;
    await this.stateBackend.write(newState);
  }
  async readState() {
    try {
      const json = await this.stateBackend.read();
      this._state = {
        ...DEFAULT_STATE,
        ...json,
      };
    } catch (e) {
      this.env.logger.warn(
        `Failed to read config file, create new config file. (${e})`,
      );
      await this.writeState(DEFAULT_STATE);
    }
  }
}
