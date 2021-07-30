import {isConstructorDescriptor, ServiceDescriptor} from "./types/service-descriptor";
import {ServiceRegistration} from "./types/service-registration";
import {isConstructorProvider, isFactoryProvider, isValueProvider, ServiceProvider} from "./providers/service-provider";
import {ConstructorProvider} from "./providers/constructor-provider";
import {FactoryProvider} from "./providers/factory-provider";
import {ValueProvider} from "./providers/value-provider";
import {ParameterRegistry} from "./parameter-registry";
import { Constructor } from "./types/constructor";

interface RegistrationOptions {
    isSingleton: boolean;
}

export class ServiceContainer {

    private serviceRegistry: Map<ServiceDescriptor<unknown>, ServiceRegistration<unknown>> = new Map();

    private instanceRegistry: Map<ServiceDescriptor<unknown>, any> = new Map();

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

        if (options) {
            this.serviceRegistry.set(descriptor, {descriptor: descriptor, provider: provider, ...options});
        } else {
            this.serviceRegistry.set(descriptor, {descriptor: descriptor, provider: provider, isSingleton: false});
        }

        return this;
    }

    public resolve<T>(descriptor: ServiceDescriptor<T>): T {

        if (!this.serviceRegistry.has(descriptor)) {

            // autowire if constructor descriptor
            if (isConstructorDescriptor(descriptor)) {

                if (this.isPrimitive(descriptor)) {
                    throw new Error('Primitive types cannot be injected automatically. Please use @inject or register a service for them explicitly (not recommended)')
                }

                this.register(descriptor, {useConstructor: descriptor});
            } else {
                throw new Error(`Service ${String(descriptor)} not registered`);
            }
        }

        const registration: ServiceRegistration<unknown> = this.serviceRegistry.get(descriptor)!;
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
            throw new Error("No suitable provider found");
        }

        if (registration.isSingleton) {
            this.instanceRegistry.set(descriptor, instance);
        }

        return instance;
    }

    private isPrimitive<T>(descriptor: Constructor<T>): boolean {

        const ctr = descriptor as Function;

        return (
            ctr === Number ||
            ctr === String ||
            ctr === Boolean ||
            ctr === Object
        );
    }

    private construct<T>(provider: ConstructorProvider<T>): T {
        const ctr = provider.useConstructor;

        if (!ParameterRegistry.has(ctr)) {
            throw new Error("Serivce not known. Did you forget to use @Service?");
        }

        const parameterTypes = ParameterRegistry.get(ctr) || [];

        const parameters = [];

        for (const parameterType of parameterTypes) {
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

export const Container = new ServiceContainer();