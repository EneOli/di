import {ServiceContainer} from "../service-container";

export type ServiceFactory<T> = (container: ServiceContainer) => T;