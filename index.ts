import 'reflect-metadata';
import { inject } from './decorators/inject';

import { Service } from "./decorators/service";
import { Container } from './service-container';

@Service()
class Fun {
    public makeFun() {
        console.log('._.');
    }
}

@Service()
class App {
    public constructor(
        @inject('test')
        private testString: string
    ) {
    }

    public sayHello(): void {
        console.log(this.testString);
    }
}

Container.register(App, {useConstructor: App});

Container.register('test', {useValue: 'It works!'});

const app = Container.resolve(App);

app.sayHello();