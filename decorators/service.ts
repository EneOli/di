import { ParameterRegistry } from "../parameter-registry";
import { Constructor } from "../types/constructor";
import { ServiceDescriptor } from "../types/service-descriptor";
import { DI_REFLECT_CUSTOM_INJECTION } from "./inject";

export function Service<T>() {
  return function (constructor: Constructor<T>) {
    const paramTypes = Reflect.getMetadata("design:paramtypes", constructor) || [];

    const customInjectionMap: Map<number, ServiceDescriptor<unknown>> = Reflect.getMetadata(DI_REFLECT_CUSTOM_INJECTION, constructor);


    if (customInjectionMap) {
      for (const key of customInjectionMap.keys()) {
        paramTypes[key] = customInjectionMap.get(key);
      }
    }

    ParameterRegistry.set(constructor, paramTypes);
  }
}