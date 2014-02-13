# Focus-On
First time I do this kata and I know nothing of the server protocol, how can I explore it? Some time ago I came across [htty](https://github.com/htty/htty), I always wanted to master it but never got/took the time, but this is exactly why we do katas right? So let's do it! I will also take the opportunity to review this HTTP API, to reason about it and to think how to improve it.


# Step-01
Let's see if this thing works
```
$ htty balanced-hangman.herokuapp.com
*** Welcome to  htty , the HTTP TTY. Heck To The Yeah!
http://balanced-hangman.herokuapp.com/> get
 200  OK -- 5 headers -- 61-character body
http://balanced-hangman.herokuapp.com/> body
{
 "index": "/",
 "me": "/me",
 "prisoners": "/prisoners"
}
```


# Step-02
Two resources, `/me` I guess it's the current user/player, `/prisoners` I'm not sure yet but could be related with the current or past games? We will see, for now focus on `/me`, what could I do with this resource?
```
http://balanced-hangman.herokuapp.com/> path /me
http://balanced-hangman.herokuapp.com/me> http-options
 200  OK -- 6 headers -- empty body
http://balanced-hangman.herokuapp.com/me> headers
         Allow: HEAD, OPTIONS, POST, GET
  Content-Type: text/html; charset=utf-8
          Date: Wed, 12 Feb 2014 12:09:49 GMT
        Server: gunicorn/18.0
Content-Length: 0
    Connection: keep-alive
```
We asked what options do we have on this resource, now we know we can `GET` and `POST` on this thing, let's keep it safe and try to `GET` it
```
http://balanced-hangman.herokuapp.com/me> get
 200  OK -- 5 headers -- 4-character body
http://balanced-hangman.herokuapp.com/me> body
null
http://balanced-hangman.herokuapp.com/me> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 12:13:47 GMT
        Server: gunicorn/18.0
Content-Length: 4
    Connection: keep-alive
```
Wow, null? looking at the `Content-Type` not sure if it's a valid `application/json` I must remember it, I guess the json parse will not be happy... Anyway, nothing here, maybe because we are not logged in, but let's look at `/prisoners` before to create side effects


# Step-03
```
http://balanced-hangman.herokuapp.com/me> path /prisoners
http://balanced-hangman.herokuapp.com/prisoners> http-options
 405  Method Not Allowed -- 5 headers -- empty body
http://balanced-hangman.herokuapp.com/prisoners> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 13:28:03 GMT
        Server: gunicorn/18.0
Content-Length: 80
    Connection: keep-alive
```
Too bad, `405 Method Not Allowed` I wonder why... let's try to `get` it anyway
```
http://balanced-hangman.herokuapp.com/prisoners> get
 200  OK -- 5 headers -- 186-character body
http://balanced-hangman.herokuapp.com/prisoners> body
{
 "items": [],
 "offset": 0,
 "first": "/prisoners?offset=0",
 "next": null,
 "limit": 10,
 "total": 0,
 "last": "/prisoners?offset=0",
 "uri": "/prisoners",
 "previous": null
}
```
Seems like some kind of pagination metadata, `/prisoners` (like the plural would suggest) is a collection, we don't know if we can post on it but we will try soon


# Step-04
Back to `/me` resource, `GET /me` returns `null`, let's try an empty `POST`, I hope the server will give us some clue on how to proceed
```
http://balanced-hangman.herokuapp.com/prisoners> path /me
http://balanced-hangman.herokuapp.com/me> post
 400  Bad Request -- 5 headers -- 109-character body
http://balanced-hangman.herokuapp.com/me> body
{
 "status": "Bad Request",
 "status_code": 400,
 "description": "Missing required field [email_address]"
}
```
Good, we need to give it an email address
```
http://balanced-hangman.herokuapp.com/me> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
email_address=me@example.com


http://balanced-hangman.herokuapp.com/me> post
 400  Bad Request -- 5 headers -- 104-character body
http://balanced-hangman.herokuapp.com/me> body
{
 "status": "Bad Request",
 "status_code": 400,
 "description": "Missing required field [password]"
}
```
Nice! a password is also required, seems reasonable, let's do it
```
http://balanced-hangman.herokuapp.com/me> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
email_address=me@example.com&password=hangman


http://balanced-hangman.herokuapp.com/me> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 291-character body
http://balanced-hangman.herokuapp.com/me> body
{
 "id": "jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "prisoners": "/prisoners",
 "uri": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "email_address": "me@example.com",
 "stats": {
  "started_at": null,
  "dead": 0,
  "help": 0,
  "rescued": 0,
  "ended_at": null
 }
}
http://balanced-hangman.herokuapp.com/me> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 13:48:23 GMT
      Location: http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=
        Server: gunicorn/18.0
Content-Length: 291
    Connection: keep-alive
```
Success! We are in! I think...


# Step-05
```
http://balanced-hangman.herokuapp.com/me> get
 200  OK -- 5 headers -- 4-character body
http://balanced-hangman.herokuapp.com/me> body
null
```
`GET /me` is still null... this is not useful at all, maybe `GET /me` should return a `405 Method Not Allowed`? And so `OPTION /me` must not include it?
```
http://balanced-hangman.herokuapp.com/me> path /users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> get
 403  Forbidden -- 5 headers -- 198-character body
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> body
{
 "status": "Forbidden",
 "status_code": 403,
 "description": "<p>You don't have the permission to access the requested resource. It is either read-protected or not readable by the server.</p>"
}
```
`403 Forbidden` sound strange, but I get it, `/me` is used to create an user resource with username and password, to access this resource you need to provide those username and password
```
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> userinfo-set me@example.com hangman
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> get
 200  OK -- 5 headers -- 291-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> body
{
 "id": "jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "prisoners": "/prisoners",
 "uri": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "email_address": "me@example.com",
 "stats": {
  "started_at": null,
  "dead": 0,
  "help": 0,
  "rescued": 0,
  "ended_at": null
 }
}
```
Yes! We are really in! What I have done here is to provide username and password for a Basic Authorization, look at it
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> headers-request
    User-Agent: htty/1.4.1
Authorization:@ Basic bWVAZXhhbXBsZS5jb206aGFuZ21hbg==
```
We are sending an `Authorization` header, now, let's look around with those valid credentials
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> path /me
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/me> get
*** The body of your GET request is not being sent
 200  OK -- 5 headers -- 341-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/me> body
{
 "prisoners": "/prisoners",
 "id": "jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "email_address": "me@example.com",
 "uri": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "stats": {
  "started_at": null,
  "dead": 0,
  "help": 0,
  "rescued": 0,
  "ended_at": null
 }
}
```
I get it, `/me` with valid user credentials is an alias of the user's resource


# Step-06
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> path /users
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users> get
 404  Not Found -- 5 headers -- 202-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users> body
{
 "status": "Not Found",
 "status_code": 404,
 "description": "<p>The requested URL was not found on the server.</p><p>If you entered the URL manually please check your spelling and try again.</p>"
}
```
Mmm, ok, `users` doesn't exists, I don't like it but let's move on
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users> path /prisoners
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> get
 200  OK -- 5 headers -- 186-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> body
{
 "items": [],
 "offset": 0,
 "first": "/prisoners?offset=0",
 "next": null,
 "limit": 10,
 "total": 0,
 "last": "/prisoners?offset=0",
 "uri": "/prisoners",
 "previous": null
}
```
`/prisoners` is unchanged with valid credentials, let's try to post on it
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 327-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> body
{
 "word": "*************",
 "misses": [],
 "guesses_remaining": 20,
 "guesses": "/prisoners/5guXaUAUQY8=/guesses",
 "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "hits": [],
 "id": "5guXaUAUQY8=",
 "state": "help",
 "uri": "/prisoners/5guXaUAUQY8=",
 "imprisoned_at": "2014-02-12T14:19:26.244308Z"
}
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> get
 200  OK -- 5 headers -- 540-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> body
{
 "items": [
  {
   "word": "*************",
   "misses": [],
   "guesses_remaining": 20,
   "guesses": "/prisoners/5guXaUAUQY8=/guesses",
   "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
   "hits": [],
   "id": "5guXaUAUQY8=",
   "state": "help",
   "uri": "/prisoners/5guXaUAUQY8=",
   "imprisoned_at": "2014-02-12T14:19:26.244308Z"
  }
 ],
 "offset": 0,
 "first": "/prisoners?offset=0",
 "next": null,
 "limit": 10,
 "total": 1,
 "last": "/prisoners?offset=0",
 "uri": "/prisoners",
 "previous": null
}
```
Cool! We created a new prisoner resource aka a new game, I only need to find out how to play


# Step-07
Without further ado, let's be bold
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners> path /prisoners/5guXaUAUQY8=/guesses
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> post
 400  Bad Request -- 5 headers -- 101-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body
{
 "status": "Bad Request",
 "status_code": 400,
 "description": "Missing required field [guess]"
}
```
A field guess it's needed, I'll try giving a single character
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
guess=e


http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 335-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> headers
  Content-Type: application/json
          Date: Wed, 12 Feb 2014 14:46:44 GMT
      Location: http://balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=
        Server: gunicorn/18.0
Content-Length: 335
    Connection: keep-alive
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body
{
 "word": "*************",
 "misses": [
  "e"
 ],
 "guesses_remaining": 19,
 "guesses": "/prisoners/5guXaUAUQY8=/guesses",
 "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "hits": [],
 "id": "5guXaUAUQY8=",
 "state": "help",
 "uri": "/prisoners/5guXaUAUQY8=",
 "imprisoned_at": "2014-02-12T14:19:26.244308Z"
}
```
I missed, `e` is not in the word we have to guess to free the current prisoner, but it's not this that bothers me... Why on earth a `201 Created` response with a `Location` of an already created resource aka the current prisoner? Never mind, I want to win this game


# Step-08
After some time...
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
guess=l


http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 407-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body
{
 "word": "*o*o*ra*hi*al",
 "misses": [
  "e",
  "t",
  "n",
  "s"
 ],
 "guesses_remaining": 10,
 "guesses": "/prisoners/5guXaUAUQY8=/guesses",
 "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "hits": [
  "a",
  "o",
  "i",
  "h",
  "r",
  "l"
 ],
 "id": "5guXaUAUQY8=",
 "state": "help",
 "uri": "/prisoners/5guXaUAUQY8=",
 "imprisoned_at": "2014-02-12T14:19:26.244308Z"
}
```
I think that the word could be *doxographical*, can I guess the entire word?
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
guess=doxographical


http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> post
 400  Bad Request -- 5 headers -- 134-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body
{
 "status": "Bad Request",
 "status_code": 400,
 "description": "Invalid field [guess] - \"doxographical\" must have length <= 1"
}
```
Nope... one characted at time, and... in the end...
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
guess=c


http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> post
*** Type fol[low] to follow the 'Location' header received in the response
 201  Created -- 6 headers -- 449-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body
{
 "word": "doxographical",
 "misses": [
  "e",
  "t",
  "n",
  "s"
 ],
 "guesses_remaining": 5,
 "guesses": "/prisoners/5guXaUAUQY8=/guesses",
 "user": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "hits": [
  "a",
  "o",
  "i",
  "h",
  "r",
  "l",
  "d",
  "x",
  "g",
  "p",
  "c"
 ],
 "id": "5guXaUAUQY8=",
 "state": "rescued",
 "uri": "/prisoners/5guXaUAUQY8=",
 "imprisoned_at": "2014-02-12T14:19:26.244308Z"
}
```
Yes!!! The prisoner is rescued! Let's look at our stats
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> path /users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> get
 200  OK -- 5 headers -- 341-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> body
{
 "id": "jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "prisoners": "/prisoners",
 "uri": "/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=",
 "email_address": "me@example.com",
 "stats": {
  "started_at": "2014-02-12T14:19:26.244308Z",
  "dead": 0,
  "help": 0,
  "rescued": 1,
  "ended_at": "2014-02-12T14:19:26.244308Z"
 }
}
```
Ok, mission accomplished, no more secrets in this server!


# Play Around
Now I'll try to break things...
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> path /prisoners/5guXaUAUQY8
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=> http-delete
 405  Method Not Allowed -- 5 headers -- 80-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=> body
{
 "status": "Method Not Allowed",
 "status_code": 405,
 "description": null
}
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=> path /users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=
ttp://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> http-delete
 405  Method Not Allowed -- 5 headers -- 80-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> body
{
 "description": null,
 "status_code": 405,
 "status": "Method Not Allowed"
}
```
Ok, prisoners and users could not be deleted, that's fair. What if I try to guess for an ended game?
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body-set
*** Enter two blank lines, or hit Ctrl-D, to signify the end of the body
guess=Z


http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> post
 500  Internal Server Error -- 5 headers -- 131-character body
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/prisoners/5guXaUAUQY8=/guesses> body
{
 "status": "Internal Server Error",
 "status_code": 500,
 "description": "Prisoner \"5guXaUAUQY8=\" is already rescued silly"
}
```
Woooooo, `500 Internal Server Error`, that's extreme! But I like the error message. What about trying to create a new game without user credentials?
```
http://me%40example.com:hangman@balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> userinfo-clear
http://balanced-hangman.herokuapp.com/users/jCpH07240wlqZHn1Pqw7ckKR218cMWERAPZ1vlU3Mp0=> path /prisoners
http://balanced-hangman.herokuapp.com/prisoners> post
 403  Forbidden -- 5 headers -- 198-character body
http://balanced-hangman.herokuapp.com/prisoners> body
{
 "description": "<p>You don't have the permission to access the requested resource. It is either read-protected or not readable by the server.</p>",
 "status_code": 403,
 "status": "Forbidden"
}
```
Ok, same `403 Forbidden`, I still don't like it. I guess that's all for now


# Considerations And Improvements
* I don't like the `null` as an `application/json` representation of the resource `/me` when you don't provide valid user credentials
  * Improvement: `GEt /me` could return `401 Unauthorized`
  * Improvement: `GET /me` could redirect to `/users/unknown` with an explanation of what you have to do to identify yourself or to create a new user
  * Improvement: `GET /me` must return `405 Method Not Allowed` since `/me` is only used to create new users with a `POST`
* I don't like that the `OPTION` method is not implemented on `/prisoners` resource
  * Improvement: must be implemented on every resource
* I don't like that links are relative in the resources representation
  * Improvement: links in JSON could be better represented, see [this article](http://www.mnot.net/blog/2011/11/25/linking_in_json)
* I don't like the `403 Forbidden`, here is the explanation for this result code _"The server understood the request, but is refusing to fulfill it. Authorization will not help and the request SHOULD NOT be repeated"_ this is clearly not the case
  * Improvement: use `401 Unauthorized`
* I don't like that `/users` doesn't exists when `/users/:id` exists
  * Improvement: I think that for some administrator `/users` would be accessible/useful so a `401 Unauthorized` in this case would be better
* Is prisoner part of the ubiquitous language of the hangman game domain? I really don't know but I didn't found it too easy to understand but I'm not a native speaker so I guess it's ok, ...
* What happens if we, the agent, don't support `application/json` as a content type? I tried, the client `Accept` header is completely ignored
  * Improvement: if the client doesn't accept `application/json` the response should be `406 Not Acceptable`
* I don't like that `POST /prisoners/:id/guesses` return `201 Created` of an already created resource
  * Improvement: simply return `200 OK`
  * Improvement: return `201 Created` but creating a guess resource like `/prisoners/:prisoner-id/guesses/:guess-id`
  * Improvement: return `303 See Other` with header `Location: /prisoners/:id` because _"This method exists primarily to allow the output of a POST-activated script to redirect the user agent to a selected resource"_ maybe also with the prisoner representation in the body
* I don't like the `500 Internal Sever Error` for a guess in an already ended game
  * Improvement: this is where a `403 Forbidden` will shine! Look above for the `403` definition
* I don't like to repeat the status and the status code in the response body
* When you post credentials of an existing user to `/me` you get back a `201 Created` but nothing is really created, the user resource was already there
  * Improvement: return `302 Found` with header `Location: /users/:id` because _"The requested resource resides temporarily under a different URI"_ that's the case, with those credentials `/me` is temprorary linked to `/users/:id`


# Conclusions
That was fun, the API is well conceived, I have some concerns but that's ok. HTTY really impressed me, it's the kind of tool that I love but seems like a little neglected (the last commit was 9 months ago) so I decided to contribute to it. Next step: build an OO wrapper in Ruby that works
