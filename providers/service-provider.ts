import {ConstructorProvider} from "./constructor-provider";
import {FactoryProvider} from "./factory-provider";
import {ValueProvider} from "./value-provider";

export type ServiceProvider<T> = ConstructorProvider<T> | FactoryProvider<T> | ValueProvider<T>;

// Helpers

export function isConstructorProvider<T>(provider: ServiceProvider<T>): provider is ConstructorProvider<T> {
  return 'useConstructor' in provider;
}

export function isFactoryProvider<T>(provider: ServiceProvider<T>): provider is FactoryProvider<T> {
  return 'useFactory' in provider;
}

export function isValueProvider<T>(provider: ServiceProvider<T>): provider is ValueProvider<T> {
  return 'useValue' in provider;
}