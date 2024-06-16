type ReactiveData<T> = {
    [Property in keyof T]: T[Property];
  };
  
  export class Reactive<T extends object> {
    private _data: ReactiveData<T>;
    private _subscribers: { [K in keyof T]?: Set<() => void> };
    private static proxyMap = new WeakMap();
  
    constructor(data: T) {
      this._subscribers = {};
      this._data = this._makeReactive(data);
  
      return new Proxy(this, {
        get: (target, property: string | symbol, receiver: any) => {
          if (property in target._data) {
            this.track(property as keyof T);
            // console.log('Get:', property, target._data);
            return Reflect.get(target._data, property, receiver);
          }
          return undefined;
        },
        set: (target, property: string | symbol, value: any, receiver: any) => {
          // console.log('Set:', property, value, target._data);
          if (property in target._data) {
            const oldValue = target._data[property as keyof T];
            if (oldValue !== value) {
              target._data[property as keyof T] = this._makeReactive(value);
              this.trigger(property as keyof T);
            }
            return true;
          }
          return false;
        }
      }) as Reactive<T>;
    }
  
    private static activeEffect: (() => void) | null = null;
  
    private track(property: keyof T) {
      if (!Reactive.activeEffect) return;
      if (!this._subscribers[property]) {
        this._subscribers[property] = new Set();
      }
      this._subscribers[property]!.add(Reactive.activeEffect);
    }
  
    private trigger(property: keyof T) {
      if (this._subscribers[property]) {
        this._subscribers[property]!.forEach(effect => effect());
      }
    }
  
    static effect(fn: () => void) {
      Reactive.activeEffect = fn;
      fn();
      Reactive.activeEffect = null;
    }
  
    useEffect(callback: () => void, dependencies: (keyof T)[]) {
      const runEffect = () => {
        dependencies.forEach(dep => this.track(dep));
        callback();
      };
      Reactive.effect(runEffect);
    }
  
    private _makeReactive(data: any): any {
      if (Reactive.proxyMap.has(data)) {
        return Reactive.proxyMap.get(data);
      }
  
      if (Array.isArray(data)) {
        const reactiveArr = this._makeReactiveArray(data);
        Reactive.proxyMap.set(data, reactiveArr);
        return reactiveArr;
      } else if (data !== null && typeof data === 'object' && !(data instanceof Reactive)) {
        const reactiveObj = new Proxy(data, {
          get: (target, property: string | symbol, receiver: any) => {
            this.track(property as keyof T);
            // console.log('Get (nested):', property, target);
            return Reflect.get(target, property, receiver);
          },
          set: (target, property: string | symbol, value: any, receiver: any) => {
            const oldValue = target[property];
            if (oldValue !== value) {
              target[property] = this._makeReactive(value);
              this.trigger(property as keyof T);
            }
            // console.log('Set (nested):', property, value, target);
            return true;
          }
        });
        Object.keys(data).forEach(key => {
          data[key] = this._makeReactive(data[key]);
        });
        Reactive.proxyMap.set(data, reactiveObj);
        return reactiveObj;
      } else {
        return data;
      }
    }
  
    private _makeReactiveArray(arr: any[]): any[] {
      const reactiveArr = arr.map(item => this._makeReactive(item));
      const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
  
      arrayMethods.forEach(method => {
        reactiveArr[method as any] = (...args: any[]) => {
          const reactiveArgs = args.map(arg => this._makeReactive(arg));
          const result = Array.prototype[method as any].apply(reactiveArr, reactiveArgs);
          this.triggerArray();
          // console.log('Array method:', method, reactiveArgs);
          return result;
        };
      });
  
      return reactiveArr;
    }
  
    private triggerArray() {
      Object.keys(this._subscribers).forEach(key => this.trigger(key as keyof T));
    }
  }
  
  