# Hangman HTTP Kata
Out there there's a server that allows you to play hangman over HTTP, you need to write a client that can play the game

# Goals
You don't have the protocol documentation, you have to explore the exposed API and follow them ala HATEOAS (Hypermedia As The Engine Of Application State) way. Ideally your client should be resilient to protocol changes as long as the resource representations remains the same aka don't rely on resource's URLs, only on the entry point below.

Things you can do:
* create a program that can automatically play the game
* create a command line program that allows a human player to play the game
* create a shell program (think REPL) that allows a human player to play the game

# Specification
```
$ curl http://balanced-hangman.herokuapp.com
```
Hopefully you'll see something like
```json
{
 "index": "/",
 "me": "/me",
 "prisoners": "/prisoners"
}
```
NOTE: in the near future I will implement a clone of the original server

# Focus-On
* clearly separate the game logic from the HTTP protocol
* how to test the game logic code without depending on the server availability?
* how to test the HTTP protocol handling without depending on the server availability?
* how to make sure that your application still works with the current server?
* how do you explore the server API? What tools are you gonna to use?
* create an usable and pretty command line application

# Credits
Originally used as an exercise to evaluate candidates for a job and published as a [gist](https://gist.github.com/mjallday/6891926), I thought that this would have been a wonderful kata and there it is

# What is a Code Kata?
Code Kata is a term coined by Dave Thomas, co-author of the book The Pragmatic Programmer, in a bow to the Japanese concept of kata in the martial arts. A code kata is an exercise in programming which helps a programmer hone their skills through practice and repetition (excerpt from [wikipedia](http://en.wikipedia.org/wiki/Kata_(programming)))
