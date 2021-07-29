import {ServiceDescriptor} from "./service-descriptor";
import {ServiceProvider} from "../providers/service-provider";

export interface ServiceRegistration<T> {
  descriptor: ServiceDescriptor<T>;
  provider: ServiceProvider<T>;
  isSingleton: boolean;
}