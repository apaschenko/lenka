class PromiseClone {
  static #HANDLER_TYPES = {
    THEN: 'THEN',
    CATCH: 'CATCH',
    FINALLY: 'FINALLY',
  };

  handlers = [];

  constructor(executor) {
    executor(this.#resolve, this.#reject);
  }

  static #isThenHandler = ({type}) => type === PromiseClone.#HANDLER_TYPES.THEN;
  static #isCatchHandler = ({type}) => type === PromiseClone.#HANDLER_TYPES.CATCH;
  static #isFinallyHandler = ({type}) => type === PromiseClone.#HANDLER_TYPES.FINALLY;

  then = (handler) => this.#registerHandler(PromiseClone.#HANDLER_TYPES.THEN, handler);
  catch = (handler) => this.#registerHandler(PromiseClone.#HANDLER_TYPES.CATCH, handler);
  finally = (handler) => this.#registerHandler(PromiseClone.#HANDLER_TYPES.FINALLY, handler);

  // Private methods
  #registerHandler = (type, execute) => {
    this.handlers = [{type, execute}, ...this.handlers];
    return this;
  };

  #noMoreHandlers = () => this.handlers.length === 0;

  #resolve = (value) => {
    while (true) {
      const finallyHandled = this.#handleIfFinally();
      if (finallyHandled === null) {
        // Using null, to break out of the chain if
        // some error occurs.
        return;
      }
      if (finallyHandled === true) {
        // Still need to execute the THEN block
        continue;
      }
      if (this.#noMoreHandlers()) {
        // If no more handlers remaining, nothing more to execute
        break;
      }
      const handler = this.handlers.pop();
      if (PromiseClone.#isCatchHandler(handler)) {
        // We want to ignore the catch handler here
        continue;
      }
      // Reached here if handler is a THEN handler
      try {
        const result = handler["execute"](value);

        // If the THEN block returns a Promise after completion
        // of the execution, then we need to assign all the
        // remaining handlers of the current promise to the new
        // returned promise. Else, just continue the Promise chain.
        if (result instanceof PromiseClone) {
          result.handlers = this.handlers;
          this.handlers = [];
        } else {
          // this.#executeAllFinallyHandlers();
          this.#resolve(result);
        }
        return;
      } catch (error) {
        // If some error occurs during the execution of the promise,
        // then we reject.
        this.#reject(error);
        return;
      }
    }
  };

  #reject = (value) => {
    while (true) {
      const finallyHandled = this.#handleIfFinally();
      if (finallyHandled === null) {
        // Using null, to break out of the chain if
        // some error occurs.
        break;
      }
      if (finallyHandled === true) {
        // Still need to execute the CATCH block
        continue;
      }
      if (this.#noMoreHandlers()) {
        // If no more handlers remaining, the error value
        // has no handler registered. So, just throw the
        // error value in the wild
        throw value;
      }
      const handler = this.handlers.pop();
      if (PromiseClone.#isThenHandler(handler)) {
        // If THEN handler, then skip. We are looing for a
        // CATCH handler
        continue;
      }

      // Reached here if handler is a CATCH handler
      try {
        const result = handler["execute"](value);

        // If the THEN block returns a Promise after completion
        // of the execution, then we need to assign all the
        // remaining handlers of the current promise to the new
        // returned promise.
        if (result instanceof PromiseClone) {
          result.handlers = this.handlers;
          this.handlers = [];
        } else {
          // If it doesn't return a Promise, we have
          // completed our Promise chain and now just
          // need to execute the remaining FINALLY handlers.
          this.#executeAllFinallyHandlers();
        }
      } catch (error) {
        // If some error occurs during the execution of the
        // CATCH block, we pass the error to be handled
        // by next error handler.
        this.#reject(error);
      }
      break;
    }
  };

  // Returns if handled finally block successfully
  #handleIfFinally = () => {
    if (this.#noMoreHandlers()) {
      // Returning FALSE, to imply FINALLY was not processed
      return false;
    }
    const handler = this.handlers.pop();
    if (PromiseClone.#isFinallyHandler(handler)) {
      try {
        const result = handler["execute"]();
        if (result instanceof PromiseClone) {
          // Pass the current handlers to the new PromiseClone handlers
          result.handlers = this.handlers;

          // Stop execution SYMBOL, because the new Promise will take over.
          return null;
        }
        return true;
      } catch (error) {
        this.#reject(error);
      }
      return true;
    } else {
      this.handlers.push(handler);
      return false;
    }
  };

  #executeAllFinallyHandlers = () => {
    while (this.#noMoreHandlers() === false) {
      try {
        // Skip all the non-finally handlers
        if (this.#handleIfFinally() === false) {
          this.handlers.pop();
        }
      } catch (error) {
        this.#reject(error);
        break;
      }
    }
  };
}


const getPromise = (n, doReject=false) => new PromiseClone((resolve, reject) => {
  setTimeout(() => {
    if (doReject) {
      reject('REJECTED!!!! ' + n);
    } else {
      resolve('Hello: ' + n)
    }
  }, 1000);
});


getPromise(1)
  .then((res) => {
    console.log('THEN 1:', res);
    return getPromise(2);
  })
  .then((res) => {
    console.log('THEN 2:', res);
    return getPromise(3, true);
  })
  .finally(() => {
    console.log('FINALLY 1');
    // throw new Error('ERROR IN FINALLY')
    return getPromise(42, true);
  })
  .catch((err) => {
    console.log('CATCH 1', err.message)
    return getPromise(4);
  })
  .then(res => {
    console.log('THEN 3:', res);
  })
  .then(res => {
    console.log('THEN 4', res);
  })
  .then(() => {
    return getPromise(5);
  })
  .then((res) => {
    console.log('THEN 5', res);
  })
  .finally(() => {
    console.log('FINALLY 2:', 'This is last...');
  });