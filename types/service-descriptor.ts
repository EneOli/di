import {Constructor} from "./constructor";

export type ServiceDescriptor<T> = string | symbol | Constructor<T>


// Helpers

export function isConstructorDescriptor<T>(descriptor: ServiceDescriptor<T>): descriptor is Constructor<T> {
  return typeof descriptor === 'function';
}