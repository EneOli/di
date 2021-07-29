import {ServiceFactory} from "../types/service-factory";


export type FactoryProvider<T> = { useFactory: ServiceFactory<T> }