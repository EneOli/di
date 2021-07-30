import { Constructor } from "../types/constructor";
import { ServiceDescriptor } from "../types/service-descriptor";

export const DI_REFLECT_CUSTOM_INJECTION = 'DI:REFLECT:CUSTOM:REFLECTION';

export function inject<T>(descriptor: ServiceDescriptor<T>) {
    return function (target: Constructor<T>, _propertyKey: string, parameterIndex: number) {

        const customInjectionMap = Reflect.getMetadata(DI_REFLECT_CUSTOM_INJECTION, target) || new Map<number, ServiceDescriptor<unknown>>();

        customInjectionMap.set(parameterIndex, descriptor);

        Reflect.defineMetadata(DI_REFLECT_CUSTOM_INJECTION, customInjectionMap, target);
    }
}