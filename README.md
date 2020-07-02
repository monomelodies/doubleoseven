# doubleoseven
Javascript library for events-that-behave-like-promises

## Goal
Events in Javascript are cool; it's great to run certain code only when an event
is fired, after all:

```js
EventManager.on('myEvent', (foo, bar) => {
    // ... do something only now
});
```

Want to know what's even cooler? Promises! Callbacks suck, and can't be chained.
And callback chaining is awesome, because it makes for more readable code.
Wouldn't it be swell if we could do something like the following (cfg. the ES6
Promises specification)?

```js
EventManager.on('myEvent')
    .then((foo, bar) => {
        console.log(bar);
        return foo;
    })
    .then(foo => {
        console.log(foo);
    })
    .catch(error => {
        console.log(error);
    })
    .finally(() => {
        console.log('finally!');
    });
```

For ES6 Promises, this is against specification; a promise is intended to only
be resolved once. With this library, we create a [James] Bond which allows you
to wrap your event resolution in promise-like chains. Awesome!

## Installation

```sh
$ npm i doubleoseven
$ yarn add doubleoseven
```

Choose your package manager; we prefer `yarn` but `npm` is also widely used. It
doesn't really matter.

## Usage
Simply return a new instance of the imported class whenever you want a function
to behave in this fashion. E.g.:

```js
import Bond from 'doubleoseven';

class MyService {

    getData() {
        return new Bond((resolve, reject) => {
            // Do your stuff and call either resolve or reject with some value
            EventEmitter.on('someEvent', value => resolve(value));
            EventEmitter.on('someOtherEvent', value => reject(value));
        });
    }

}
```

And now you can do:

```js
MyService.getData().then(result => {
    // do something...
    return someOtherValue;
}).then(otherValue => {
    // do something else...
    return whateverYouWant;
}).catch(reason => console.error(reason));
```

