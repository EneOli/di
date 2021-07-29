import {Constructor} from "../types/constructor";

export type ConstructorProvider<T> = { useConstructor: Constructor<T> };