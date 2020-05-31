import uuid from '../lib/uuid'

type Hook = ScriptInvocationListenerCallbacks
type Handler = { [sel: string]: Hook }

const subject = 'http'

const dataTaskHookHandler: Hook = {
  onEnter(args) {
    const completionHandler = new ObjC.Block(args[3])
    const id = uuid()

    const originalCallback = completionHandler.implementation
    completionHandler.implementation = (...args) => {
      console.log('finish', this.method)
    }
  }
}

const uploadTaskHookHandler: Hook = {
  onEnter(args) {

  }
}

const handlers: Handler = {
  // https://github.com/Flipboard/FLEX/blob/b38cca06b/Classes/Network/PonyDebugger/FLEXNetworkObserver.m#L157
  'connectionDidFinishLoading:': {
    onEnter(args) {

    }
  },
  'connection:willSendRequest:redirectResponse:': {
    onEnter(args) {
      console.log('connection:willSendRequest:redirectResponse:')

    }
  },
  'connection:didReceiveResponse:': {
    onEnter(args) {

    }
  },
  'connection:didReceiveData:': {
    onEnter(args) {

    }
  },
  'connection:didFailWithError:': {
    onEnter(args) {

    }
  },
  'URLSession:task:willPerformHTTPRedirection:newRequest:completionHandler:': {
    onEnter(args) {

    }
  },
  'URLSession:dataTask:didReceiveData:': {
    onEnter(args) {

    }
  },
  'URLSession:dataTask:didReceiveResponse:completionHandler:': {
    onEnter(args) {

    }
  },
  'URLSession:task:didCompleteWithError:': {
    onEnter(args) {

    }
  },
  'URLSession:dataTask:didBecomeDownloadTask:': {
    onEnter(args) {

    }
  },
  'URLSession:downloadTask:didWriteData:totalBytesWritten:totalBytesExpectedToWrite:': {
    onEnter(args) {

    }
  },
  'URLSession:downloadTask:didFinishDownloadingToURL:': {
    onEnter(args) {

    }
  },

  // https://github.com/Flipboard/FLEX/blob/b38cca06b/Classes/Network/PonyDebugger/FLEXNetworkObserver.m#L275
  'af_resume': { // AFNetworking
    onEnter(args) {

    }
  },

  // https://github.com/Flipboard/FLEX/blob/b38cca06b/Classes/Network/PonyDebugger/FLEXNetworkObserver.m#L500
  'dataTaskWithRequest:completionHandler:': dataTaskHookHandler,
  'dataTaskWithURL:completionHandler:': dataTaskHookHandler,
  'downloadTaskWithRequest:completionHandler:': dataTaskHookHandler,
  'downloadTaskWithResumeData:completionHandler:': dataTaskHookHandler,
  'downloadTaskWithURL:completionHandler:': dataTaskHookHandler,

  // https://github.com/Flipboard/FLEX/blob/b38cca06b/Classes/Network/PonyDebugger/FLEXNetworkObserver.m#L568
  'uploadTaskWithRequest:fromData:completionHandler:': uploadTaskHookHandler,
  'uploadTaskWithRequest:fromFile:completionHandler:': uploadTaskHookHandler
}

const mapping: { [key: string]: ObjC.Object } = {}

/*
  TODO: check protocol

  NSProgressReporting
  NSSecureCoding
  NSStreamDelegate
  NSURLConnectionDataDelegate
  NSURLConnectionDelegate
  NSURLSessionDataDelegate
  NSURLSessionDataDelegatePrivate
  NSURLSessionDataDelegate_Internal
  NSURLSessionDelegate
  NSURLSessionDownloadDelegate
  NSURLSessionStreamDelegate
  NSURLSessionSubclass
  NSURLSessionTaskDelegate
*/

export function init() {
  const resolver = new ApiResolver('objc')
  for (const [sel, handler] of Object.entries(handlers)) {
    for (const match of resolver.enumerateMatches(`-[* ${sel}]`)) {
      // const clazz = match.name.substr(2, match.name.indexOf(' ') - 2)
      // for (const protocol of Object.keys(ObjC.classes[clazz].$protocols)) {
      //   protocols.add(protocol)
      // }
      Interceptor.attach(match.address, {
        onEnter(args: InvocationArguments) {
          this.method = match.name
          console.log(match.name)
          if (handler.onEnter) handler.onEnter.call(this, args)
        },
        onLeave(retval: InvocationReturnValue) {
          if (handler.onLeave) handler.onLeave?.call(this, retval)
        }
      })
    }
  }

  for (const clazz of ['__NSCFLocalSessionTask', 'NSURLSessionTask', '__NSCFURLSessionTask']) {
    const cls = ObjC.classes[clazz]
    if (!cls) continue
    const method = cls['- resume'] as ObjC.ObjectMethod
    if (!method) continue
    Interceptor.attach(method.implementation, {
      onEnter(args) {
        // todo:
      }
    })
  }

  Interceptor.attach(ObjC.classes.NSURLConnection.cancel.implementation, {
    onEnter(args) {

    }
  })
}

export function dispose() {
  Interceptor.detachAll()

}

setImmediate(init)
