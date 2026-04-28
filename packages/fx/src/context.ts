import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

type ContextServiceClass<Shape, A, E, R> = Context.Tag<unknown, Shape & A> & {
  new (...args: Array<any>): A
  readonly Default: Layer.Layer<unknown, E, R>
}

type MakeContextService = <Shape = unknown>() => <K extends string, A, E = never, R = never>(
  name: K,
  makeService: () => Effect.Effect<A, E, R>
) => ContextServiceClass<Shape, A, E, R>

/**
 * 通用的 Context Service 构建器
 *
 * 这个模式解决了以下问题：
 * 1. 创建可继承的 Context.Tag
 * 2. 自动处理原型链修补（参考 Effect Service）
 * 3. 提供类型安全的 Default Layer
 *
 * @example
 * ```ts
 * class MyService extends makeContextService<MyService>()('my-service', (name) =>
 *   Effect.succeed({
 *     doSomething: () => Effect.succeed('done')
 *   })
 * ) {
 *   // 添加自定义方法
 *   customMethod() {
 *     return this.doSomething()
 *   }
 * }
 * ```
 */
const makeContextServiceImpl =
  <Shape = unknown>() =>
  <K extends string, A, E = never, R = never>(name: K, makeService: () => Effect.Effect<A, E, R>) => {
    let patchState: "unchecked" | "plain" | "patched" = "unchecked"

    class Base extends Context.Tag(name)<Base, Shape & A>() {
      constructor(service: A) {
        super(void 0 as never)

        if (patchState === "unchecked") {
          const proto = Object.getPrototypeOf(service)
          if (proto === Object.prototype || proto === null) {
            patchState = "plain"
          } else {
            const selfProto = Object.getPrototypeOf(this)
            Object.setPrototypeOf(selfProto, proto)
            patchState = "patched"
          }
        }

        if (patchState === "plain") {
          Object.assign(this, service)
        } else if (patchState === "patched") {
          Object.setPrototypeOf(service, Object.getPrototypeOf(this))
          return service as any
        }
      }

      static get Default(): Layer.Layer<Base, E, R> {
        return Layer.effect(
          this,
          Effect.gen(
            function* (this: any) {
              const service = yield* makeService()
              return new this(service) as any
            }.bind(this)
          )
        )
      }
    }

    type BaseConstructor = typeof Base

    return Base as unknown as BaseConstructor & {
      new (...args: Array<any>): A
    }
  }

export const makeContextService = makeContextServiceImpl as MakeContextService
