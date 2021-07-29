import {isConstructorDescriptor, ServiceDescriptor} from "./types/service-descriptor";
import {ServiceRegistration} from "./types/service-registration";
import {isConstructorProvider, isFactoryProvider, isValueProvider, ServiceProvider} from "./providers/service-provider";
import {ConstructorProvider} from "./providers/constructor-provider";
import {FactoryProvider} from "./providers/factory-provider";
import {ValueProvider} from "./providers/value-provider";
import {Constructor} from "./types/constructor";
import {ParameterRegistry} from "./parameter-registry";

interface RegistrationOptions {
  isSingleton: boolean;
}

export class ServiceContainer {

  private serviceRegistry: Map<ServiceDescriptor<unknown>, ServiceRegistration<unknown>> = new Map();

  private instanceRegistry: Map<ServiceDescriptor<unknown>, any> = new Map();

  private parameterRegistry: Map<Constructor<unknown>, unknown[]> = new Map();

  public has(descriptor: ServiceDescriptor<unknown>): boolean {
    return this.serviceRegistry.has(descriptor);
  }

  public remove(descriptor: ServiceDescriptor<unknown>): void {
    if (this.serviceRegistry.has(descriptor)) {
      this.serviceRegistry.delete(descriptor);
    }

    if (this.instanceRegistry.has(descriptor)) {
      this.serviceRegistry.delete(descriptor);
    }

    if (isConstructorDescriptor(descriptor) && ParameterRegistry.has(descriptor)) {
      ParameterRegistry.delete(descriptor);
    }
  }

  public register<T>(descriptor: ServiceDescriptor<T>, provider: ServiceProvider<T>, options?: RegistrationOptions): this {

    if (this.serviceRegistry.has(descriptor)) {
      throw new Error(`Service with descriptor ${String(descriptor)} already registered`);
    }

    this.serviceRegistry.set(descriptor, {descriptor: descriptor, provider: provider, ...options});

    return this;
  }

  public resolve<T>(descriptor: ServiceDescriptor<T>): T {

    if (!this.serviceRegistry.has(descriptor)) {

      // autowire if constructor descriptor
      if (isConstructorDescriptor(descriptor)) {
        this.register(descriptor, {useConstructor: descriptor});
      } else {
        throw new Error(`Service ${String(descriptor)} not registered`);
      }
    }

    const registration = this.serviceRegistry.get(descriptor);
    const provider = registration.provider;

    if (registration.isSingleton) {
      if (this.instanceRegistry.has(registration.descriptor)) {
        return this.instanceRegistry.get(registration.descriptor) as T;
      }
    }

    let instance = null;

    switch (true) {
      case isConstructorProvider(provider):
        instance = this.construct(provider as ConstructorProvider<T>);
        break;
      case isFactoryProvider(provider):
        instance = this.fabricate(provider as FactoryProvider<T>);
        break;
      case isValueProvider(provider):
        instance = this.getValue(provider as ValueProvider<T>);
        break;
      default:
        throw new Error('No suitable provider provided');
    }
  }

  private construct<T>(provider: ConstructorProvider<T>): T {
    const ctr = provider.useConstructor;

    if (!ParameterRegistry.has(ctr)) {
      throw new Error('Serivce not known. Did you forget to use @Service?');
    }

    const parameterTypes = ParameterRegistry.get(ctr) || [];
    const parameters = [];

    for (const parameterType in parameterTypes) {
      parameters.push(this.resolve(parameterType));
    }

    return Reflect.construct(ctr, parameters);
  }

  private fabricate<T>(provider: FactoryProvider<T>): T {
    return provider.useFactory(this);
  }

  private getValue<T>(provider: ValueProvider<T>): T {
    return provider.useValue;
  }
}