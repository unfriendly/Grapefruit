import './ready'
import './polyfill'
import './observers/http'

import { interfaces, invoke, register } from './rpc'
import modules from './modules/index'

rpc.exports = {
  interfaces,
  invoke,
}

function registerModules() {
  const destructors = new Set<Function>()
  for (const [name, submodule] of Object.entries(modules)) {
    for (const [method, func] of Object.entries(submodule as {[key: string]: Function})) {
      if (method === 'default')
        register(func, name)
      else if (method === 'dispose')
        destructors.add(func)
      else
        register(func, [name, func.name].join('/'))
    }
  }

  recv('dispose', () => {
    for (const cb of destructors) {
      try {
        cb()
      } finally {

      }
    }
  })  
}

setImmediate(registerModules)

Process.setExceptionHandler((detail) => {
  console.error('Exception report: ')
  console.error(JSON.stringify(detail, null, 4))
  send({
    subject: 'exception',
    detail
  })
  const { context } = detail
  const pc = Instruction.parse(context.pc)
  console.warn(DebugSymbol.fromAddress(context.pc))
  console.error(pc.toString())
  console.error(Instruction.parse(pc.next).toString())  
  console.error('Backtrace')
  console.error(
    Thread.backtrace(context, Backtracer.ACCURATE)
      .map(addr => DebugSymbol.fromAddress(addr).toString()).join('\n'))
  
  return false
})
